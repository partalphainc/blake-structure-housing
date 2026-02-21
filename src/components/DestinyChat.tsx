import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Phone, PhoneOff } from "lucide-react";
import destinyAvatar from "@/assets/destiny-avatar.png";

const VAPI_ASSISTANT_ID = "a51e4ffa-4659-4cf9-a491-5f7b91739c40";

const DestinyChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const vapiRef = useRef<any>(null);

  useEffect(() => {
    // Dynamically load the VAPI Web SDK
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
        });
        
        vapiRef.current.on("call-end", () => {
          setIsConnected(false);
          setIsConnecting(false);
        });
      }
    };
    document.body.appendChild(script);

    return () => {
      if (vapiRef.current && isConnected) {
        vapiRef.current.stop();
      }
      document.body.removeChild(script);
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

  return (
    <>
      {/* Floating button with ring vibration */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Animated rings */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-primary/40"
          animate={{
            scale: [1, 1.5, 1.8],
            opacity: [0.6, 0.3, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeOut",
          }}
          style={{ width: 64, height: 64 }}
        />
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-accent-magenta/30"
          animate={{
            scale: [1, 1.3, 1.6],
            opacity: [0.5, 0.2, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeOut",
            delay: 0.5,
          }}
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
            <img
              src={destinyAvatar}
              alt="Destiny - AI Leasing Rep"
              className="w-full h-full object-cover"
            />
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
            className="fixed bottom-28 right-6 z-50 w-80 sm:w-96 rounded-2xl bg-card border border-border shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-primary/20 to-accent-magenta/10 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/40">
                  <img
                    src={destinyAvatar}
                    alt="Destiny"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-serif font-bold text-sm">Destiny — AI Leasing Rep</p>
                  <p className="text-xs text-muted-foreground">Powered by C. Blake Enterprise Automation</p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 min-h-[240px] flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary/30 mb-4 glow-pink">
                <img
                  src={destinyAvatar}
                  alt="Destiny"
                  className="w-full h-full object-cover"
                />
              </div>

              <p className="text-sm text-foreground font-medium mb-3">
                Hi! I'm Destiny 👋
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                Your AI leasing representative. I can help with available units, second-chance policy, scheduling consultations, and investor inquiries.
              </p>

              {/* Call button */}
              <motion.button
                onClick={handleCall}
                disabled={isConnecting}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all ${
                  isConnected
                    ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    : "bg-gradient-to-r from-primary to-accent-magenta text-primary-foreground glow-btn hover:opacity-90"
                } ${isConnecting ? "opacity-60 cursor-wait" : ""}`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {isConnected ? (
                  <>
                    <PhoneOff size={16} />
                    End Call
                  </>
                ) : isConnecting ? (
                  <>
                    <Phone size={16} className="animate-pulse" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Phone size={16} />
                    Talk to Destiny
                  </>
                )}
              </motion.button>

              {isConnected && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 flex items-center gap-2"
                >
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
