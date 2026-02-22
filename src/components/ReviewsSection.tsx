import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const reviews = [
  {
    name: "Charles B.",
    role: "Second-Chance Resident — 5 Years",
    text: "C. Blake gave me a real second chance when no one else would. Five years later, I'm still here — stable housing, structured environment, and a team that holds you accountable but never gives up on you.",
    rating: 5,
  },
  {
    name: "Randy J.",
    role: "Insurance Replacement Resident",
    text: "After my home was damaged, I needed furnished housing fast. C. Blake had me placed within days — fully furnished, utilities included, no hassle. The process was seamless and professional.",
    rating: 5,
  },
  {
    name: "Moneta S.",
    role: "Private Room Resident",
    text: "The private room setup works perfectly for me. I have my own space, shared common areas are clean, and the team keeps everything running smoothly. It's affordable and well-managed.",
    rating: 4,
  },
  {
    name: "Tony T.",
    role: "Private Room Resident",
    text: "I was skeptical about shared housing, but C. Blake runs things differently. My room is private, the community standards are enforced, and I finally feel like I have a real home base.",
    rating: 5,
  },
  {
    name: "Vonda M.",
    role: "Investor & Partner",
    text: "Partnering with C. Blake was one of the smartest moves for my portfolio. Their structured model keeps occupancy high and revenue consistent. The documentation and communication are top-notch.",
    rating: 5,
  },
  {
    name: "David R.",
    role: "Property Owner",
    text: "Since partnering with C. Blake, my vacancy rate dropped to nearly zero. Their structured model maximizes revenue without the headaches.",
    rating: 5,
  },
];

const partners = [
  { name: "State Farm", logo: "https://logo.clearbit.com/statefarm.com" },
  { name: "Timberland Partners", logo: "https://logo.clearbit.com/timberlandpartners.com" },
  { name: "St. Patrick Center", logo: "https://logo.clearbit.com/stpatrickcenter.org" },
  { name: "KeyCheck Screening", logo: null },
  { name: "St. Louis Housing Authority", logo: null },
  { name: "Metro Insurance Partners", logo: null },
  { name: "Community Action Agency", logo: null },
  { name: "Midwest Relocation Services", logo: null },
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

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
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
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star
                    key={j}
                    size={14}
                    className={j < r.rating ? "fill-primary text-primary" : "text-muted-foreground/30"}
                  />
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

        <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
          {partners.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
              className="flex items-center gap-3 px-6 py-3 rounded-full bg-card border border-border text-sm font-medium"
            >
              {p.logo && (
                <img
                  src={p.logo}
                  alt={p.name}
                  className="w-6 h-6 object-contain rounded"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              )}
              {p.name}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;
