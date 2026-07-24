import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const openApplication = () => window.dispatchEvent(new CustomEvent("openApplication"));
const openDestinyChat = () => window.dispatchEvent(new CustomEvent("openDestinyChat"));

const faqs = [
  {
    q: "What is the Second Chance program?",
    a: (
      <>
        Our Second Chance program provides structured private-room housing for residents who may have
        background, credit, or eviction history that traditional landlords turn away. We focus on
        accountability, community standards, and documented lease agreements — giving people a real
        path to stable housing.
      </>
    ),
  },
  {
    q: "How do I apply, and is there a fee?",
    a: (
      <>
        You can apply online through our{" "}
        <button onClick={openApplication} className="text-primary underline underline-offset-2 hover:opacity-80">
          Housing Application
        </button>
        . The application fee is currently <strong>waived</strong> as part of our active promotion.
      </>
    ),
  },
  {
    q: "Are utilities included?",
    a: (
      <>
        All private rooms and the furnished 2 Bed / 1 Bath include utilities and Wi-Fi. Our unfurnished
        townhome and 2 Bed unit require utilities to be placed in the tenant's name — this is noted on
        each listing card.
      </>
    ),
  },
  {
    q: "What is the deposit?",
    a: (
      <>
        Private rooms have a low <strong>$100 move-in deposit</strong>. Unfurnished units require a
        deposit equal to one month's rent ($1,625 or $1,700 depending on the unit). Exact deposits are
        listed on each unit card.
      </>
    ),
  },
  {
    q: "Where are your units located?",
    a: (
      <>
        Our current inventory is in the greater St. Louis area — including St. John, University City,
        and other St. Louis Area neighborhoods. Specific addresses are shared after an application is
        reviewed.
      </>
    ),
  },
  {
    q: "Can I talk to a real person?",
    a: (
      <>
        Absolutely. Call or text us at{" "}
        <a href="tel:+16362514272" className="text-primary underline underline-offset-2 hover:opacity-80">
          (636) 251-4272
        </a>
        , or chat with{" "}
        <button onClick={openDestinyChat} className="text-primary underline underline-offset-2 hover:opacity-80">
          Angel
        </button>
        , our AI assistant, any time of day.
      </>
    ),
  },
];

const FAQSection = () => {
  return (
    <section id="faq" className="section-padding">
      <div className="container mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">
            Frequently Asked
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold">
            Answers Before You Apply
          </h2>
        </motion.div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left font-serif text-lg">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQSection;
