import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Phone, PhoneOff, Mic, MicOff, Send, MessageSquare } from "lucide-react";
import destinyAvatar from "@/assets/destiny-avatar.png";

const VAPI_ASSISTANT_ID = "a51e4ffa-4659-4cf9-a491-5f7b91739c40";
const ZAPIER_WEBHOOK_URL = "";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const DestinyChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [textInput, setTextInput] = useState("");
  const vapiRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@vapi-ai/web@latest/dist/vapi.js";
    script.async = true;
    script.onload = () => {
      // @ts-ignore
      if (window.Vapi) {
        // @ts-ignore
        vapiRef.current = new window.Vapi("e2ea88a0-52e2-4482-b0d0-fc0c0de2cf78");

        vapiRef.current.on("call-start", () => {
          setIsConnecting(false);
          setIsConnected(true);
          setMessages(prev => [...prev, { role: "assistant", content: "Connected! How can I help you today?", timestamp: new Date() }]);
        });

        vapiRef.current.on("call-end", () => {
          setIsConnected(false);
          setIsConnecting(false);
          setMessages(prev => {
            const updated = [...prev, { role: "assistant" as const, content: "Call ended. Thank you!", timestamp: new Date() }];
            sendToZapier(updated);
            return updated;
          });
        });

        vapiRef.current.on("message", (msg: any) => {
          if (msg.type === "transcript" && msg.transcriptType === "final") {
            setMessages(prev => [...prev, {
              role: msg.role === "user" ? "user" : "assistant",
              content: msg.transcript,
              timestamp: new Date(),
            }]);
          }
        });
      }
    };
    document.body.appendChild(script);

    return () => {
      if (vapiRef.current) {
        try { vapiRef.current.stop(); } catch {}
      }
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [sendToZapier]);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    const handleStartCall = () => {
      setIsOpen(true);
      setTimeout(() => handleCall(), 500);
    };
    window.addEventListener("openDestinyChat", handleOpen);
    window.addEventListener("startDestinyCall", handleStartCall);
    return () => {
      window.removeEventListener("openDestinyChat", handleOpen);
      window.removeEventListener("startDestinyCall", handleStartCall);
    };
  }, []);

  const handleCall = async () => {
    if (isConnected) {
      vapiRef.current?.stop();
      return;
    }
    setIsConnecting(true);
    try {
      await vapiRef.current?.start(VAPI_ASSISTANT_ID);
    } catch (err) {
      console.error("VAPI connection error:", err);
      setIsConnecting(false);
    }
  };

  const toggleMute = () => {
    if (vapiRef.current && isConnected) {
      vapiRef.current.setMuted(!isMuted);
      setIsMuted(!isMuted);
    }
  };

  const handleSendText = () => {
    const trimmed = textInput.trim();
    if (!trimmed) return;
    const userMsg: ChatMessage = { role: "user", content: trimmed, timestamp: new Date() };
    setMessages(prev => {
      const updated = [...prev, userMsg];
      // Auto-reply with a helpful message and send to Zapier
      const botReply: ChatMessage = {
        role: "assistant",
        content: "Thanks for your message! A housing representative will follow up with you shortly. You can also tap the mic button to speak with Destiny live.",
        timestamp: new Date(),
      };
      const withReply = [...updated, botReply];
      sendToZapier(withReply);
      return withReply;
    });
    setTextInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  };

  return (
    <>
      {/* Floating button with ring vibration */}
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
                    Type a message below or tap the mic to start a voice conversation about available units, second-chance housing, or scheduling.
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
              <div ref={messagesEndRef} />
            </div>

            {/* Text input + voice controls */}
            <div className="p-3 border-t border-border shrink-0 space-y-2">
              {/* Text input row */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  className="flex-1 rounded-full border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <motion.button
                  onClick={handleSendText}
                  disabled={!textInput.trim()}
                  className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40"
                  whileTap={{ scale: 0.9 }}
                >
                  <Send size={16} />
                </motion.button>
              </div>

              {/* Voice controls row */}
              <div className="flex items-center justify-center gap-3">
                {isConnected && (
                  <motion.button
                    onClick={toggleMute}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                      isMuted ? "bg-destructive/20 text-destructive" : "bg-primary/10 text-primary"
                    }`}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
                  </motion.button>
                )}

                <motion.button
                  onClick={handleCall}
                  disabled={isConnecting}
                  className={`flex items-center gap-2 px-5 py-2 rounded-full font-semibold text-xs transition-all ${
                    isConnected
                      ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      : "bg-gradient-to-r from-primary to-accent-magenta text-primary-foreground glow-btn hover:opacity-90"
                  } ${isConnecting ? "opacity-60 cursor-wait" : ""}`}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {isConnected ? (
                    <><PhoneOff size={14} /> End Call</>
                  ) : isConnecting ? (
                    <><Phone size={14} className="animate-pulse" /> Connecting...</>
                  ) : (
                    <><Mic size={14} /> Talk to Destiny</>
                  )}
                </motion.button>
              </div>

              {isConnected && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs text-muted-foreground">Connected — speak now</span>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DestinyChat;
