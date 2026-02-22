import { useState } from "react";
import { MessageCircle, X, Mail, Phone, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How do I pay rent?",
    answer:
      "Navigate to the Payments section in your portal sidebar. You can view your balance and payment history there. For payment methods, contact our support team.",
  },
  {
    question: "How do I submit a maintenance request?",
    answer:
      "Go to the Maintenance section, click 'New Request', describe the issue with photos if possible, and our team will respond promptly.",
  },
  {
    question: "How do I update my lease information?",
    answer:
      "Lease changes must be handled by management. Please reach out via email or phone and we'll assist you.",
  },
  {
    question: "Where can I find my documents?",
    answer:
      "All your documents including lease agreements and uploaded files are available in the Documents section of your portal.",
  },
  {
    question: "How do I update my profile?",
    answer:
      "Click your name in the top header bar (or the edit profile button on mobile) to update your name and phone number.",
  },
];

const SupportChatWidget = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-20 md:bottom-6 right-4 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
        aria-label="Support chat"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-36 md:bottom-22 right-4 z-50 w-[340px] max-h-[70vh] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-200">
          {/* Header */}
          <div className="bg-primary text-primary-foreground px-5 py-4">
            <h3 className="font-serif font-bold text-base">Support</h3>
            <p className="text-xs opacity-80">We're here to help</p>
          </div>

          <ScrollArea className="flex-1 max-h-[50vh]">
            <div className="p-4 space-y-4">
              {/* FAQ */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Frequently Asked Questions
                </p>
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, i) => (
                    <AccordionItem key={i} value={`faq-${i}`} className="border-border/50">
                      <AccordionTrigger className="text-sm text-left py-3 hover:no-underline">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>

              {/* Contact */}
              <div className="border-t border-border pt-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Still need help?
                </p>
                <div className="flex flex-col gap-2">
                  <Button variant="outline" size="sm" className="justify-start gap-2" asChild>
                    <a href="mailto:Destiny@CBlakeEnt.com">
                      <Mail className="w-4 h-4" /> Destiny@CBlakeEnt.com
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start gap-2" asChild>
                    <a href="tel:+16362066037">
                      <Phone className="w-4 h-4" /> (636) 206-6037
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      )}
    </>
  );
};

export default SupportChatWidget;
