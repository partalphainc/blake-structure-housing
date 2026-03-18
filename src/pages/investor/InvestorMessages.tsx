import { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, Paperclip, ArrowLeft, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import InvestorLayout from "@/components/investor/InvestorLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

type Message = { id: string; sender: "investor" | "management"; text: string; time: string; property?: string };
type Conversation = { id: string; name: string; lastMessage: string; time: string; unread: number; category: string; messages: Message[] };

const sampleConversations: Conversation[] = [
  {
    id: "c1",
    name: "C. Blake Management",
    lastMessage: "Your next payout is scheduled for March 28.",
    time: "2h ago",
    unread: 1,
    category: "Financial",
    messages: [
      { id: "m1", sender: "investor", text: "Hi, when can I expect my March payout?", time: "Mar 15, 9:00 AM", property: "Portfolio" },
      { id: "m2", sender: "management", text: "Hi! Your next payout is scheduled for March 28, 2026. The amount will be $5,920 net after management fee. We'll send a confirmation email when it's processed.", time: "Mar 15, 10:15 AM" },
      { id: "m3", sender: "investor", text: "Perfect, thank you!", time: "Mar 15, 10:22 AM" },
      { id: "m4", sender: "management", text: "Absolutely! You can always view your payout history in the Payouts section. Let us know if you have any other questions.", time: "Mar 15, 10:30 AM" },
    ],
  },
  {
    id: "c2",
    name: "C. Blake Management",
    lastMessage: "The HVAC repair at 4512 Oak Ave has been completed.",
    time: "1d ago",
    unread: 0,
    category: "Maintenance",
    messages: [
      { id: "m1", sender: "management", text: "We wanted to update you on the HVAC repair at 4512 Oak Ave, Unit 1B. The vendor completed the work on March 14. A capacitor was replaced and filters cleaned. Final cost was $480 (est. was $450). Invoice attached.", time: "Mar 14, 4:00 PM", property: "4512 Oak Ave" },
      { id: "m2", sender: "investor", text: "Thanks for the update. Has the tenant confirmed it's working?", time: "Mar 14, 4:45 PM" },
      { id: "m3", sender: "management", text: "Yes — tenant confirmed the heat is fully working. We'll note this in the maintenance log. Total repair costs this month are $1,480.", time: "Mar 14, 5:10 PM" },
    ],
  },
];

const categories = ["All", "General", "Leasing", "Maintenance", "Financial", "Inspection", "Urgent"];

const InvestorMessages = () => {
  const { user, loading, signOut } = useAuth("investor");
  const [profile, setProfile] = useState<any>(null);
  const [conversations, setConversations] = useState(sampleConversations);
  const [activeConvo, setActiveConvo] = useState<Conversation | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [newMessage, setNewMessage] = useState("");
  const [showMobileList, setShowMobileList] = useState(true);
  const [search, setSearch] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("user_id", user.id).single()
      .then(({ data }) => setProfile(data));
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConvo?.messages]);

  if (loading) return (
    <div className="min-h-screen bg-[#faf8f8] flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 border-2 border-[#d4738a] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-[#9b8a8d] text-sm">Loading messages...</p>
      </div>
    </div>
  );

  const userName = profile?.full_name || user?.email?.split("@")[0] || "Investor";

  const handleSelectConvo = (convo: Conversation) => {
    setActiveConvo(convo);
    setShowMobileList(false);
    // Mark as read
    setConversations(prev => prev.map(c => c.id === convo.id ? { ...c, unread: 0 } : c));
  };

  const handleSend = () => {
    if (!newMessage.trim() || !activeConvo) return;
    const now = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    const msg: Message = { id: Date.now().toString(), sender: "investor", text: newMessage, time: `Today, ${now}` };
    const updated = { ...activeConvo, messages: [...activeConvo.messages, msg], lastMessage: newMessage };
    setActiveConvo(updated);
    setConversations(prev => prev.map(c => c.id === activeConvo.id ? updated : c));
    setNewMessage("");
    toast({ title: "Message sent", description: "Your message has been delivered to C. Blake Management." });
  };

  const filtered = conversations.filter((c) => {
    const matchCat = activeCategory === "All" || c.category === activeCategory;
    const matchSearch = c.lastMessage.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <InvestorLayout userName={userName} userId={user?.id} onSignOut={signOut}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-4">
          <h1 className="text-2xl font-serif font-bold text-[#2c2c2c]">Messages</h1>
          <p className="text-[#9b8a8d] text-sm mt-1">Direct communication with C. Blake Management</p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                activeCategory === cat
                  ? "bg-[#d4738a] text-white border-[#d4738a]"
                  : "border-[#f0e8ea] text-[#6b5b5e] hover:border-[#d4738a]/30 hover:text-[#d4738a]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Inbox Layout */}
        <div className="bg-white border border-[#f0e8ea] rounded-2xl shadow-sm overflow-hidden" style={{ height: "620px" }}>
          <div className="flex h-full">
            {/* Conversation List */}
            <div className={`${showMobileList ? "flex" : "hidden"} md:flex flex-col w-full md:w-72 border-r border-[#f0e8ea] flex-shrink-0`}>
              <div className="p-3 border-b border-[#f0e8ea]">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-[#9b8a8d]" />
                  <Input
                    placeholder="Search messages..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8 h-8 text-xs border-[#f0e8ea]"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {filtered.map((convo) => (
                  <button
                    key={convo.id}
                    onClick={() => handleSelectConvo(convo)}
                    className={`w-full text-left p-4 border-b border-[#f0e8ea] hover:bg-[#faf8f8] transition-colors ${
                      activeConvo?.id === convo.id ? "bg-[#faf0f2]" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#d4738a] to-[#c4637a] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        CB
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <span className="text-sm font-semibold text-[#2c2c2c] truncate">{convo.name}</span>
                          <span className="text-[10px] text-[#9b8a8d] flex-shrink-0">{convo.time}</span>
                        </div>
                        <p className="text-xs text-[#9b8a8d] truncate">{convo.lastMessage}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <Badge className="text-[10px] bg-[#f0e8ea] text-[#9b8a8d] px-1.5 py-0">{convo.category}</Badge>
                          {convo.unread > 0 && (
                            <span className="w-4 h-4 bg-[#d4738a] text-white text-[10px] rounded-full flex items-center justify-center ml-auto">
                              {convo.unread}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Thread Panel */}
            <div className={`${!showMobileList ? "flex" : "hidden"} md:flex flex-col flex-1 min-w-0`}>
              {activeConvo ? (
                <>
                  {/* Thread Header */}
                  <div className="flex items-center gap-3 p-4 border-b border-[#f0e8ea]">
                    <button className="md:hidden text-[#9b8a8d]" onClick={() => setShowMobileList(true)}>
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#d4738a] to-[#c4637a] flex items-center justify-center text-white text-xs font-bold">
                      CB
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#2c2c2c]">{activeConvo.name}</p>
                      <Badge className="text-[10px] bg-[#f0e8ea] text-[#9b8a8d] px-1.5 py-0">{activeConvo.category}</Badge>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {activeConvo.messages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.sender === "investor" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[75%] ${msg.sender === "investor" ? "items-end" : "items-start"} flex flex-col gap-1`}>
                          {msg.property && (
                            <span className="text-[10px] text-[#9b8a8d] px-2">{msg.property}</span>
                          )}
                          <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                            msg.sender === "investor"
                              ? "bg-[#d4738a] text-white rounded-br-sm"
                              : "bg-[#f4eff0] text-[#2c2c2c] rounded-bl-sm"
                          }`}>
                            {msg.text}
                          </div>
                          <span className="text-[10px] text-[#9b8a8d] px-2">{msg.time}</span>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Compose */}
                  <div className="p-3 border-t border-[#f0e8ea]">
                    <div className="flex items-end gap-2">
                      <div className="flex-1 relative">
                        <textarea
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                          placeholder="Type a message to management..."
                          rows={2}
                          className="w-full text-sm border border-[#f0e8ea] rounded-xl px-4 py-2.5 resize-none focus:outline-none focus:border-[#d4738a] text-[#2c2c2c] placeholder:text-[#b8a4a8] bg-[#faf8f8]"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-[#9b8a8d] hover:text-[#d4738a]"
                          onClick={() => toast({ title: "Attach File", description: "File attachment coming soon." })}
                        >
                          <Paperclip className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          className="h-8 w-8 bg-[#d4738a] hover:bg-[#c4637a] text-white"
                          onClick={handleSend}
                          disabled={!newMessage.trim()}
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                  <div className="w-16 h-16 bg-[#d4738a]/10 rounded-full flex items-center justify-center mb-4">
                    <MessageSquare className="w-8 h-8 text-[#d4738a]/40" />
                  </div>
                  <h3 className="text-base font-serif font-bold text-[#2c2c2c] mb-2">Select a conversation</h3>
                  <p className="text-[#9b8a8d] text-sm">Choose a conversation from the list to read and reply.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </InvestorLayout>
  );
};

export default InvestorMessages;
