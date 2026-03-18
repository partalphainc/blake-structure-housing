import { useState, useRef, useEffect } from "react";
import { Bot, Send, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import InvestorLayout from "@/components/investor/InvestorLayout";
import { Button } from "@/components/ui/button";

type Message = {
  id: string;
  role: "user" | "ai";
  text: string;
  time: string;
};

const suggestedPrompts = [
  "How much did I make last month?",
  "Do I have any late tenants?",
  "What repairs happened this month?",
  "When is my next payout?",
  "Which lease is ending soon?",
  "How many units are occupied?",
];

const getAIResponse = (text: string): string => {
  const lower = text.toLowerCase();
  if (lower.includes("make") || lower.includes("earn") || lower.includes("revenue") || lower.includes("profit")) {
    return "In February 2026, your portfolio generated **$7,400 in gross revenue** across 2 properties. After management fees of $592 and expenses of $488, your **net profit was $6,320**. That's up 3.6% from January. Your best-performing property was 4512 Oak Avenue at $4,600/month.";
  }
  if (lower.includes("late") || lower.includes("past due") || lower.includes("behind") || lower.includes("delinquent")) {
    return "You currently have **1 tenant with a late balance** — Rachel Davis at Unit 1A, 1823 Maple Drive. She has an outstanding balance of **$650** (March rent). Management has issued a 5-day notice. All other tenants — J. Williams (Unit 2B) and M. Thompson (Unit 3C) — are current and paid on time.";
  }
  if (lower.includes("repair") || lower.includes("maintenance") || lower.includes("fix") || lower.includes("work")) {
    return "This month (March 2026), **2 maintenance items** were completed:\n\n• **HVAC repair** at 4512 Oak Ave, Unit 1B — $480 (Comfort Air Services, Mar 14)\n• **Plumbing / faucet repair** at 1823 Maple Dr, Unit 1A — $325 (St. Louis Plumbing Co., Mar 11)\n\nTotal repair costs this month: **$805**. There are also **2 open requests** — a broken door lock (Unit 2B) and a dishwasher issue (Unit 3C) currently in progress.";
  }
  if (lower.includes("payout") || lower.includes("payment") || lower.includes("deposit")) {
    return "Your **next payout is scheduled for March 28, 2026** in the amount of **$5,920** via direct deposit. This is your net payout after the 8% management fee ($592) is deducted from your $7,400 gross revenue. Your last payout was $5,920 on March 1, 2026. Year-to-date you've received **$18,340** in payouts.";
  }
  if (lower.includes("lease") || lower.includes("expir") || lower.includes("renew") || lower.includes("ending")) {
    return "You have **1 lease ending soon**:\n\n• **J. Williams** — Unit 2B, 4512 Oak Avenue — expires **April 30, 2026** (44 days away). Renewal status is **Pending** — management will reach out to the tenant within the next 2 weeks.\n\nYour other leases are in good shape: R. Davis ends May 31, 2026, and M. Thompson renewed through August 31, 2026.";
  }
  if (lower.includes("occupied") || lower.includes("occupancy") || lower.includes("vacancy") || lower.includes("vacant") || lower.includes("unit")) {
    return "Your portfolio currently has **5 out of 6 units occupied** — an occupancy rate of **83.3%**.\n\n• **4512 Oak Avenue:** 4 of 4 units occupied (100%)\n• **1823 Maple Drive:** 1 of 2 units occupied (50%) — Unit 2 is currently vacant and listed.\n\nManagement is actively marketing the vacant unit and has had 2 showings this week.";
  }
  if (lower.includes("property") || lower.includes("portfolio")) {
    return "You own **2 properties** in your C. Blake portfolio:\n\n1. **4512 Oak Avenue, St. Louis MO** — 4 units, all occupied, $4,600/month gross\n2. **1823 Maple Drive, St. Louis MO** — 2 units, 1 occupied, $1,400/month gross\n\nCombined portfolio value (estimated): ~$840,000. Monthly gross revenue: $7,400. Annual ROI: approximately **8.4%**.";
  }
  return "I'm your C. Blake Investor AI. I can answer questions about your portfolio performance, tenant status, maintenance, payouts, and more. Try asking something like:\n\n• \"How much did I make last month?\"\n• \"When is my next payout?\"\n• \"Do I have any late tenants?\"";
};

const InvestorAIAssistant = () => {
  const { user, loading, signOut } = useAuth("investor");
  const [profile, setProfile] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "ai",
      text: "Hi! I'm your C. Blake Investor AI. Ask me anything about your portfolio — revenue, tenants, maintenance, payouts, leases, and more. How can I help you today?",
      time: "Just now",
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("user_id", user.id).single()
      .then(({ data }) => setProfile(data));
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  if (loading) return (
    <div className="min-h-screen bg-[#faf8f8] flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 border-2 border-[#d4738a] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-[#9b8a8d] text-sm">Loading AI Assistant...</p>
      </div>
    </div>
  );

  const userName = profile?.full_name || user?.email?.split("@")[0] || "Investor";

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const now = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    const userMsg: Message = { id: Date.now().toString(), role: "user", text, time: now };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    setTimeout(() => {
      const aiResponse = getAIResponse(text);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        text: aiResponse,
        time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages(prev => [...prev, aiMsg]);
      setTyping(false);
    }, 1200);
  };

  return (
    <InvestorLayout userName={userName} userId={user?.id} onSignOut={signOut}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 bg-gradient-to-br from-[#d4738a] to-[#b85c74] rounded-2xl flex items-center justify-center shadow-md">
            <Bot className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold text-[#2c2c2c]">C. Blake Investor AI</h1>
            <p className="text-[#9b8a8d] text-sm">Ask anything about your portfolio</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-xs text-[#d4738a] bg-[#d4738a]/10 px-3 py-1.5 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered
          </div>
        </div>

        {/* Suggested Prompts */}
        <div className="mb-4">
          <p className="text-xs text-[#9b8a8d] mb-2 font-medium">Suggested questions:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => sendMessage(prompt)}
                className="text-xs bg-white text-[#6b5b5e] border border-[#f0e8ea] hover:border-[#d4738a]/30 hover:text-[#d4738a] hover:bg-[#faf0f2] rounded-full px-3 py-1.5 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Window */}
        <div className="bg-white border border-[#f0e8ea] rounded-2xl shadow-sm overflow-hidden flex flex-col" style={{ height: "520px" }}>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  msg.role === "ai"
                    ? "bg-gradient-to-br from-[#d4738a] to-[#b85c74]"
                    : "bg-gradient-to-br from-[#6b5b5e] to-[#4a3e40]"
                }`}>
                  {msg.role === "ai"
                    ? <Bot className="w-4 h-4 text-white" />
                    : <span className="text-white text-xs font-bold">{userName[0]?.toUpperCase()}</span>
                  }
                </div>
                <div className={`max-w-[80%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}>
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-[#d4738a] text-white rounded-br-sm"
                      : "bg-[#f4eff0] text-[#2c2c2c] rounded-bl-sm"
                  }`}>
                    {msg.text.split("\n").map((line, i) => (
                      <p key={i} className={i > 0 ? "mt-1.5" : ""}>{line}</p>
                    ))}
                  </div>
                  <span className="text-[10px] text-[#b8a4a8] px-1">{msg.time}</span>
                </div>
              </div>
            ))}

            {typing && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#d4738a] to-[#b85c74] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-[#f4eff0] px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1.5">
                  <span className="text-xs text-[#9b8a8d]">C. Blake AI is typing</span>
                  <span className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 bg-[#d4738a] rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-[#f0e8ea] flex items-end gap-2">
            <div className="flex-1">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
                placeholder="Ask about your portfolio..."
                rows={2}
                className="w-full text-sm border border-[#f0e8ea] rounded-xl px-4 py-2.5 resize-none focus:outline-none focus:border-[#d4738a] text-[#2c2c2c] placeholder:text-[#b8a4a8] bg-[#faf8f8]"
              />
            </div>
            <Button
              size="icon"
              className="h-10 w-10 bg-[#d4738a] hover:bg-[#c4637a] text-white flex-shrink-0"
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || typing}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <p className="text-center text-xs text-[#b8a4a8] mt-3">
          AI responses are based on your portfolio data. For official records, contact management directly.
        </p>
      </div>
    </InvestorLayout>
  );
};

export default InvestorAIAssistant;
