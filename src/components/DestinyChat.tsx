import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X } from "lucide-react";

const DestinyChat = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent-magenta flex items-center justify-center shadow-lg animate-pulse-glow hover:scale-110 transition-transform"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Chat with Destiny"
      >
        {isOpen ? <X size={24} className="text-primary-foreground" /> : <Bot size={24} className="text-primary-foreground" />}
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 rounded-2xl bg-card border border-border shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-primary/20 to-accent-magenta/10 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent-magenta flex items-center justify-center">
                  <Bot size={20} className="text-primary-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Destiny — AI Leasing Rep</p>
                  <p className="text-xs text-muted-foreground">Powered by C. Blake Enterprise Automation</p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 min-h-[200px] flex flex-col items-center justify-center text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Hi! I'm Destiny, your AI leasing representative. I can help with:
              </p>
              <ul className="text-xs text-muted-foreground space-y-2 mb-6">
                <li>• Available unit information</li>
                <li>• Second-chance housing policy</li>
                <li>• Schedule consultations</li>
                <li>• Investor inquiries</li>
              </ul>
              <p className="text-xs text-muted-foreground italic">
                Voice & chat integration coming soon via VAPI.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DestinyChat;
