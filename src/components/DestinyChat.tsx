import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mic, MicOff, Send } from "lucide-react";
import destinyAvatar from "@/assets/destiny-avatar.png";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/destiny-chat`;
const ZAPIER_WEBHOOK_URL = "";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const DestinyChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [textInput, setTextInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendToZapier = useCallback(async (chatMessages: ChatMessage[]) => {
    if (!ZAPIER_WEBHOOK_URL) return;
    try {
      const summary = chatMessages.map(m => `${m.role}: ${m.content}`).join("\n");
      await fetch(ZAPIER_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        mode: "no-cors",
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          triggered_from: window.location.origin,
          summary,
          message_count: chatMessages.length,
        }),
      });
    } catch (err) {
      console.error("Zapier webhook error:", err);
    }
  }, []);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("openDestinyChat", handleOpen);
    window.addEventListener("startDestinyCall", handleOpen);
    return () => {
      window.removeEventListener("openDestinyChat", handleOpen);
      window.removeEventListener("startDestinyCall", handleOpen);
    };
  }, []);

  // Speech-to-text using Web Speech API
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setTextInput(transcript);
    };

    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const streamAIResponse = async (allMessages: ChatMessage[]) => {
    const apiMessages = allMessages.map(m => ({ role: m.role, content: m.content }));

    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages: apiMessages }),
    });

    if (!resp.ok || !resp.body) throw new Error("Failed to start stream");

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let assistantSoFar = "";
    let streamDone = false;

    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") { streamDone = true; break; }

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            assistantSoFar += content;
            setMessages(prev => {
              const last = prev[prev.length - 1];
              if (last?.role === "assistant" && last === prev[prev.length - 1]) {
                return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
              }
              return [...prev, { role: "assistant", content: assistantSoFar, timestamp: new Date() }];
            });
          }
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }

    return assistantSoFar;
  };

  const handleSendText = async () => {
    const trimmed = textInput.trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMessage = { role: "user", content: trimmed, timestamp: new Date() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setTextInput("");
    setIsLoading(true);

    try {
      await streamAIResponse(updatedMessages);
      setMessages(prev => {
        sendToZapier(prev);
        return prev;
      });
    } catch (err) {
      console.error("AI response error:", err);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "I'm having trouble connecting right now. Please try again or call us at (636) 206-6037.",
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  };

  return (
    <>
      {/* Floating button with ring */}
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

      {/* Chat panel */}
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
                <div>
                  <p className="font-serif font-bold text-sm">Destiny — AI Leasing Rep</p>
                  <p className="text-xs text-muted-foreground">Powered by C. Blake Enterprise</p>
                </div>
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
                  <p className="text-xs text-muted-foreground">
                    Type a message or tap the mic to speak. I can help you find housing, answer questions, or schedule a tour.
                  </p>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-secondary text-secondary-foreground rounded-bl-sm"
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
              {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex justify-start">
                  <div className="bg-secondary text-secondary-foreground px-3 py-2 rounded-xl rounded-bl-sm text-sm">
                    <span className="animate-pulse">Destiny is typing...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="p-3 border-t border-border shrink-0">
              <div className="flex items-center gap-2">
                <motion.button
                  onClick={toggleListening}
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    isListening
                      ? "bg-destructive text-destructive-foreground animate-pulse"
                      : "bg-primary/10 text-primary hover:bg-primary/20"
                  }`}
                  whileTap={{ scale: 0.9 }}
                  aria-label={isListening ? "Stop listening" : "Speak your message"}
                >
                  {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                </motion.button>
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isListening ? "Listening..." : "Type a message..."}
                  className="flex-1 rounded-full border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  disabled={isLoading}
                />
                <motion.button
                  onClick={handleSendText}
                  disabled={!textInput.trim() || isLoading}
                  className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 disabled:opacity-40"
                  whileTap={{ scale: 0.9 }}
                >
                  <Send size={16} />
                </motion.button>
              </div>
              {isListening && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-center text-muted-foreground mt-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-destructive animate-pulse mr-1" />
                  Listening — speak now, then send
                </motion.p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DestinyChat;
