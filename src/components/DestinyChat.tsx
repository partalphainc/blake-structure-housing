import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mic, MicOff, Send, Phone, PhoneOff, Volume2, VolumeX } from "lucide-react";
import destinyAvatar from "@/assets/destiny-avatar.png";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/destiny-chat`;
const ZAPIER_WEBHOOK_URL = "";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

type VoiceStatus = "idle" | "listening" | "thinking" | "speaking";

// Pick a natural-sounding female voice from the browser
function getDestinyVoice(): SpeechSynthesisVoice | null {
  const voices = speechSynthesis.getVoices();
  const preferred = [
    "Samantha", "Karen", "Victoria", "Moira", "Fiona",
    "Google US English", "Microsoft Zira", "Microsoft Jenny",
    "en-US-Neural2-F", "en-US-Wavenet-F",
  ];
  for (const name of preferred) {
    const v = voices.find((vx) => vx.name.includes(name));
    if (v) return v;
  }
  return voices.find((v) => v.lang.startsWith("en") && v.name.toLowerCase().includes("female")) ?? voices[0] ?? null;
}

const DestinyChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [textInput, setTextInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Voice call state
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const voiceLoopRef = useRef(true); // controls auto-listen loop
  const messagesRef = useRef<ChatMessage[]>([]);

  // Keep ref in sync with state for use inside async callbacks
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { scrollToBottom(); }, [messages]);

  // ─── Text Chat ───────────────────────────────────────────────────────────────

  const sendToZapier = useCallback(async (chatMessages: ChatMessage[]) => {
    if (!ZAPIER_WEBHOOK_URL) return;
    try {
      await fetch(ZAPIER_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        mode: "no-cors",
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          triggered_from: window.location.origin,
          summary: chatMessages.map((m) => `${m.role}: ${m.content}`).join("\n"),
          message_count: chatMessages.length,
        }),
      });
    } catch (err) {
      console.error("Zapier webhook error:", err);
    }
  }, []);

  const fetchDestinyResponse = useCallback(async (allMessages: ChatMessage[]): Promise<string> => {
    const apiMessages = allMessages.map((m) => ({ role: m.role, content: m.content }));
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages: apiMessages }),
    });
    if (!resp.ok || !resp.body) throw new Error("Failed to connect to Destiny");

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let assistantText = "";
    let done = false;

    while (!done) {
      const { done: streamDone, value } = await reader.read();
      if (streamDone) break;
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);
        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;
        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") { done = true; break; }
        try {
          const parsed = JSON.parse(jsonStr);
          const chunk = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (chunk) assistantText += chunk;
        } catch { /* skip */ }
      }
    }
    return assistantText;
  }, []);

  const handleSendText = async (overrideInput?: string) => {
    const trimmed = (overrideInput ?? textInput).trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMessage = { role: "user", content: trimmed, timestamp: new Date() };
    const updated = [...messagesRef.current, userMsg];
    setMessages(updated);
    setTextInput("");
    setIsLoading(true);

    let assistantText = "";
    try {
      // Add placeholder assistant message for streaming display
      const placeholder: ChatMessage = { role: "assistant", content: "", timestamp: new Date() };
      setMessages([...updated, placeholder]);

      assistantText = await fetchDestinyResponse(updated);

      const finalMsg: ChatMessage = { role: "assistant", content: assistantText, timestamp: new Date() };
      setMessages((prev) => {
        const next = [...prev.slice(0, -1), finalMsg];
        sendToZapier(next);
        return next;
      });
    } catch {
      const errMsg: ChatMessage = {
        role: "assistant",
        content: "I'm having trouble connecting right now. Please call us at (636) 206-6037.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev.slice(0, -1), errMsg]);
      assistantText = errMsg.content;
    } finally {
      setIsLoading(false);
    }
    return assistantText;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendText(); }
  };

  // ─── Voice Mode (Browser-Native, No API Key) ─────────────────────────────────

  const speak = useCallback((text: string): Promise<void> => {
    return new Promise((resolve) => {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.05;
      utterance.volume = 1;
      // Wait for voices to load then assign
      const assignVoice = () => {
        const v = getDestinyVoice();
        if (v) utterance.voice = v;
      };
      if (speechSynthesis.getVoices().length > 0) {
        assignVoice();
      } else {
        speechSynthesis.onvoiceschanged = assignVoice;
      }
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      setVoiceStatus("speaking");
      speechSynthesis.speak(utterance);
    });
  }, []);

  const listenOnce = useCallback((): Promise<string> => {
    return new Promise((resolve, reject) => {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) { reject(new Error("speech-not-supported")); return; }

      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.continuous = false;
      recognition.interimResults = true;
      recognitionRef.current = recognition;

      let finalTranscript = "";

      recognition.onresult = (event: any) => {
        let t = "";
        for (let i = 0; i < event.results.length; i++) {
          t += event.results[i][0].transcript;
        }
        finalTranscript = t;
        setVoiceTranscript(t);
      };

      recognition.onend = () => resolve(finalTranscript);
      recognition.onerror = (e: any) => {
        if (e.error === "no-speech") resolve("");
        else reject(e);
      };

      setVoiceStatus("listening");
      setVoiceTranscript("");
      recognition.start();
    });
  }, []);

  const runVoiceLoop = useCallback(async () => {
    // Greet on first call
    const greetings = [
      "Hi there, I'm Destiny, your AI leasing representative at C. Blake Enterprise. How can I help you today?",
    ];
    await speak(greetings[0]);

    while (voiceLoopRef.current) {
      let transcript = "";
      try {
        transcript = await listenOnce();
      } catch (err: any) {
        if (err.message === "speech-not-supported") {
          await speak("Voice input is not supported in this browser. Please use the chat instead.");
          setIsVoiceMode(false);
          return;
        }
        break;
      }

      if (!voiceLoopRef.current) break;
      if (!transcript.trim()) continue; // silence — listen again

      setVoiceStatus("thinking");

      const userMsg: ChatMessage = { role: "user", content: transcript, timestamp: new Date() };
      const updated = [...messagesRef.current, userMsg];
      setMessages(updated);
      setVoiceTranscript("");

      let response = "";
      try {
        response = await fetchDestinyResponse(updated);
        const finalMsg: ChatMessage = { role: "assistant", content: response, timestamp: new Date() };
        setMessages([...updated, finalMsg]);
        sendToZapier([...updated, finalMsg]);
      } catch {
        response = "I'm having a bit of trouble right now. Is there anything else I can help with?";
        setMessages([...updated, { role: "assistant", content: response, timestamp: new Date() }]);
      }

      if (!voiceLoopRef.current) break;
      await speak(response);
    }

    setVoiceStatus("idle");
  }, [speak, listenOnce, fetchDestinyResponse, sendToZapier]);

  const startVoiceCall = useCallback(() => {
    voiceLoopRef.current = true;
    setIsVoiceMode(true);
    setIsMuted(false);
    setVoiceTranscript("");
    setVoiceStatus("thinking");
    runVoiceLoop();
  }, [runVoiceLoop]);

  const endVoiceCall = useCallback(() => {
    voiceLoopRef.current = false;
    recognitionRef.current?.stop();
    speechSynthesis.cancel();
    setIsVoiceMode(false);
    setVoiceStatus("idle");
    setVoiceTranscript("");
    setIsMuted(false);
  }, []);

  const toggleMute = useCallback(() => {
    const next = !isMuted;
    setIsMuted(next);
    if (next) {
      recognitionRef.current?.stop();
      speechSynthesis.cancel();
      setVoiceStatus("idle");
    } else {
      // Resume listening
      if (voiceLoopRef.current) setVoiceStatus("listening");
    }
  }, [isMuted]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      voiceLoopRef.current = false;
      recognitionRef.current?.stop();
      speechSynthesis.cancel();
    };
  }, []);

  // Mic toggle for text chat panel
  const toggleTextMic = () => {
    if (recognitionRef.current && voiceStatus === "listening") {
      recognitionRef.current.stop();
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { alert("Speech recognition is not supported in this browser."); return; }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onresult = (event: any) => {
      let t = "";
      for (let i = 0; i < event.results.length; i++) t += event.results[i][0].transcript;
      setTextInput(t);
    };
    recognition.onend = () => setVoiceStatus("idle");
    recognition.onerror = () => setVoiceStatus("idle");
    recognitionRef.current = recognition;
    recognition.start();
    setVoiceStatus("listening");
  };

  // Listen for events from HeroSection buttons
  useEffect(() => {
    const handleOpenChat = () => setIsOpen(true);
    const handleStartCall = () => startVoiceCall();
    window.addEventListener("openDestinyChat", handleOpenChat);
    window.addEventListener("startDestinyCall", handleStartCall);
    return () => {
      window.removeEventListener("openDestinyChat", handleOpenChat);
      window.removeEventListener("startDestinyCall", handleStartCall);
    };
  }, [startVoiceCall]);

  // ─── Render ──────────────────────────────────────────────────────────────────

  const voiceStatusLabel = {
    idle: "Call ended",
    listening: isMuted ? "Muted" : "Listening…",
    thinking: "Destiny is thinking…",
    speaking: "Destiny is speaking…",
  }[voiceStatus];

  return (
    <>
      {/* ── Voice Call Overlay ── */}
      <AnimatePresence>
        {isVoiceMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-card border border-border rounded-3xl p-8 w-80 text-center shadow-2xl"
              style={{ boxShadow: "0 0 60px hsl(330 85% 55% / 0.3)" }}
            >
              {/* Avatar with pulse */}
              <div className="relative mx-auto w-28 h-28 mb-6">
                {voiceStatus === "speaking" && (
                  <>
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-primary/50"
                      animate={{ scale: [1, 1.5, 1.8], opacity: [0.7, 0.3, 0] }}
                      transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
                    />
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-accent-magenta/40"
                      animate={{ scale: [1, 1.25, 1.5], opacity: [0.5, 0.2, 0] }}
                      transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut", delay: 0.35 }}
                    />
                  </>
                )}
                {voiceStatus === "listening" && !isMuted && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-green-400/50"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.8, 0.3, 0.8] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                  />
                )}
                <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-primary/50">
                  <img src={destinyAvatar} alt="Destiny" className="w-full h-full object-cover" />
                </div>
              </div>

              <p className="font-serif font-bold text-lg mb-0.5">Destiny</p>
              <p className="text-xs text-muted-foreground mb-3">AI Leasing Representative</p>

              {/* Status */}
              <div className="flex items-center justify-center gap-2 mb-2 h-6">
                {voiceStatus === "thinking" && (
                  <motion.span
                    className="text-sm text-primary"
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  >
                    {voiceStatusLabel}
                  </motion.span>
                )}
                {voiceStatus === "listening" && (
                  <>
                    <motion.span
                      className={`inline-block w-2 h-2 rounded-full ${isMuted ? "bg-muted-foreground" : "bg-green-400"}`}
                      animate={{ opacity: isMuted ? 1 : [1, 0.3, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                    <span className="text-sm text-green-400">{voiceStatusLabel}</span>
                  </>
                )}
                {voiceStatus === "speaking" && (
                  <>
                    <motion.span
                      className="inline-block w-2 h-2 rounded-full bg-primary"
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity }}
                    />
                    <span className="text-sm text-primary">{voiceStatusLabel}</span>
                  </>
                )}
              </div>

              {/* Live transcript */}
              {voiceTranscript && (
                <p className="text-xs text-muted-foreground italic mb-3 px-2">"{voiceTranscript}"</p>
              )}

              {/* Controls */}
              <div className="flex items-center justify-center gap-6 mt-4">
                <motion.button
                  onClick={toggleMute}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                    isMuted
                      ? "bg-destructive/20 text-destructive border border-destructive/40"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                  whileTap={{ scale: 0.92 }}
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <VolumeX size={22} /> : <MicOff size={22} />}
                </motion.button>

                <motion.button
                  onClick={endVoiceCall}
                  className="w-16 h-16 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-lg"
                  whileTap={{ scale: 0.92 }}
                  title="End call"
                >
                  <PhoneOff size={24} />
                </motion.button>
              </div>

              <p className="text-xs text-muted-foreground mt-5">
                Speak naturally — Destiny will respond with voice
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Floating Chat Button ── */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-primary/40"
          animate={{ scale: [1, 1.5, 1.8], opacity: [0.6, 0.3, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
          style={{ width: 64, height: 64 }}
        />
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-accent-magenta/30"
          animate={{ scale: [1, 1.3, 1.6], opacity: [0.5, 0.2, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
          style={{ width: 64, height: 64 }}
        />
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-16 h-16 rounded-full overflow-hidden shadow-lg border-2 border-primary/50 hover:border-primary transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Chat with Destiny"
          style={{ boxShadow: "0 0 30px hsl(330 85% 55% / 0.3)" }}
        >
          {isOpen ? (
            <div className="w-full h-full bg-gradient-to-br from-primary to-accent-magenta flex items-center justify-center">
              <X size={24} className="text-primary-foreground" />
            </div>
          ) : (
            <img src={destinyAvatar} alt="Destiny - AI Leasing Rep" className="w-full h-full object-cover" />
          )}
        </motion.button>
      </div>

      {/* ── Chat Panel ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-28 right-6 z-50 w-80 sm:w-96 rounded-2xl bg-card border border-border shadow-2xl overflow-hidden flex flex-col"
            style={{ maxHeight: "70vh" }}
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-primary/20 to-accent-magenta/10 border-b border-border shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/40">
                  <img src={destinyAvatar} alt="Destiny" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <p className="font-serif font-bold text-sm">Destiny — AI Leasing Rep</p>
                  <p className="text-xs text-muted-foreground">Powered by PART Alpha Incorporation</p>
                </div>
                <motion.button
                  onClick={startVoiceCall}
                  className="flex items-center gap-1.5 text-xs bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 rounded-full transition-colors"
                  title="Start voice call with Destiny"
                  whileTap={{ scale: 0.95 }}
                >
                  <Phone className="w-3 h-3" /> Call
                </motion.button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px]">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-6">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/30 mb-3 glow-pink">
                    <img src={destinyAvatar} alt="Destiny" className="w-full h-full object-cover" />
                  </div>
                  <p className="text-sm text-foreground font-medium mb-2">Hi! I'm Destiny 👋</p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Type a message or start a voice call. I can help you find housing, answer questions, or schedule a tour.
                  </p>
                  <motion.button
                    onClick={startVoiceCall}
                    className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary text-xs px-4 py-2 rounded-full transition-colors"
                    whileTap={{ scale: 0.95 }}
                  >
                    <Volume2 size={12} /> Start Voice Call
                  </motion.button>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-secondary text-secondary-foreground rounded-bl-sm"
                    }`}>
                      {msg.content || <span className="animate-pulse opacity-60">…</span>}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border shrink-0">
              <div className="flex items-center gap-2">
                <motion.button
                  onClick={toggleTextMic}
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    voiceStatus === "listening" && !isVoiceMode
                      ? "bg-destructive text-destructive-foreground animate-pulse"
                      : "bg-primary/10 text-primary hover:bg-primary/20"
                  }`}
                  whileTap={{ scale: 0.9 }}
                  aria-label={voiceStatus === "listening" ? "Stop listening" : "Speak your message"}
                >
                  {voiceStatus === "listening" && !isVoiceMode ? <MicOff size={16} /> : <Mic size={16} />}
                </motion.button>
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={voiceStatus === "listening" && !isVoiceMode ? "Listening…" : "Type a message…"}
                  className="flex-1 rounded-full border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  disabled={isLoading}
                />
                <motion.button
                  onClick={() => handleSendText()}
                  disabled={!textInput.trim() || isLoading}
                  className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 disabled:opacity-40"
                  whileTap={{ scale: 0.9 }}
                >
                  <Send size={16} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DestinyChat;
