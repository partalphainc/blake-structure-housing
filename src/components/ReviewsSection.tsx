import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const reviews = [
  {
    name: "Tamika W.",
    role: "Resident",
    text: "C. Blake gave me a real second chance. The process was structured and respectful. I finally have stable housing I can be proud of.",
    rating: 5,
  },
  {
    name: "Marcus J.",
    role: "Resident",
    text: "The private room setup is exactly what I needed. Clean, furnished, utilities included — and the team actually cares about the community.",
    rating: 5,
  },
  {
    name: "David R.",
    role: "Property Owner",
    text: "Since partnering with C. Blake, my vacancy rate dropped to nearly zero. Their structured model maximizes revenue without the headaches.",
    rating: 5,
  },
  {
    name: "Angela T.",
    role: "Insurance Partner",
    text: "We've placed dozens of displaced residents through C. Blake. Their documentation and communication are top-notch.",
    rating: 5,
  },
];

const partners = [
  "KeyCheck Screening",
  "St. Louis Housing Authority",
  "Metro Insurance Partners",
  "Community Action Agency",
  "Midwest Relocation Services",
];

const ReviewsSection = () => {
  return (
    <section id="reviews" className="section-padding">
      <div className="container mx-auto">
        {/* Reviews */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">Testimonials</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-4">
            What Our <span className="text-gradient">Community Says</span>
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {reviews.map((r, i) => (
            <motion.div
              key={r.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="p-6 rounded-xl bg-card border border-border relative"
            >
              <Quote size={24} className="text-primary/20 absolute top-4 right-4" />
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: r.rating }).map((_, j) => (
                  <Star key={j} size={14} className="fill-primary text-primary" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">"{r.text}"</p>
              <div>
                <p className="font-semibold text-sm">{r.name}</p>
                <p className="text-xs text-muted-foreground">{r.role}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Partners */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">Our Partners</p>
          <h3 className="text-2xl md:text-3xl font-serif font-bold">
            Trusted By <span className="text-gradient">Industry Leaders</span>
          </h3>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto">
          {partners.map((p, i) => (
            <motion.div
              key={p}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
              className="px-6 py-3 rounded-full bg-card border border-border text-sm font-medium"
            >
              {p}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;
