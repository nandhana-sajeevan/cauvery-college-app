import { motion } from "framer-motion";
import { Target, Eye, BookHeart, Quote } from "lucide-react";

export default function About() {
    return (
        <div data-testid="about-page">
            {/* Hero */}
            <section className="relative h-[55vh] flex items-end overflow-hidden">
                <img src="https://res.cloudinary.com/dveiiup8m/image/upload/v1777906319/gallery-assets/college/4.png" alt="Campus" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 hero-overlay" />
                <div className="relative container-x pb-16">
                    <p className="text-secondary uppercase tracking-[0.3em] text-sm font-bold mb-3">About</p>
                    <h1 className="font-outfit font-black text-white text-5xl lg:text-7xl leading-tight max-w-3xl">A legacy of learning since <span className="text-secondary">1968</span>.</h1>
                </div>
            </section>

            <section className="section">
                <div className="container-x grid lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-5">
                        <p className="text-secondary uppercase tracking-[0.25em] text-sm font-bold mb-3">Our Story</p>
                        <h2 className="font-outfit font-black text-4xl text-primary leading-tight">Rooted in Kodagu. Reaching the world.</h2>
                    </div>
                    <div className="lg:col-span-7 text-foreground/80 leading-relaxed text-lg space-y-5">
                        <p>Founded on <strong>15th July 1968</strong> through the vision of philanthropists committed to accessible higher education, Cauvery College Gonikoppal sits in the culturally rich and picturesque Kodagu (Coorg) district of Karnataka — a land known for its natural beauty, heritage and brave personalities like Field Marshal K. M. Cariappa and General K. S. Thimmaiah.</p>
                        <p>Named after <strong>Mother Cauvery</strong>, the institution stands as a symbol of purity, knowledge and service. Across 58 years, Cauvery College has shaped over 15,000 successful graduates and consistently contributed to quality higher education in rural Karnataka — empowering students with knowledge, skills and values to succeed at national and international levels.</p>
                    </div>
                </div>
            </section>

            {/* Vision / Mission */}
            <section className="section bg-white border-y border-border">
                <div className="container-x grid md:grid-cols-3 gap-6">
                    {[
                        { icon: Target, title: "Vision", body: "Education for Self-Reliance and Self-Realization — empowering every Cauverian to stand on their own and discover their highest potential." },
                        { icon: Eye, title: "Mission", body: "Empower underprivileged and rural youth through quality education. Develop responsible, disciplined, patriotic citizens. Encourage self-learning, creativity and innovation." },
                        { icon: BookHeart, title: "Goals", body: "Provide accessible higher education in rural Kodagu. Build life skills (communication, leadership, decision-making). Encourage sports, cultural and extracurricular excellence." },
                    ].map((b, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
                            className="bg-background rounded-2xl p-8 border border-border lift" data-testid={`about-pillar-${i}`}>
                            <div className="w-12 h-12 rounded-xl bg-primary text-secondary flex items-center justify-center mb-5">
                                <b.icon className="w-6 h-6" />
                            </div>
                            <h3 className="font-outfit font-bold text-2xl text-primary mb-3">{b.title}</h3>
                            <p className="text-muted-foreground leading-relaxed">{b.body}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Principal message */}
            <section className="section">
                <div className="container-x grid lg:grid-cols-12 gap-12 items-center">
                    <div className="lg:col-span-5">
                        <div className="rounded-2xl overflow-hidden bg-primary p-2">
                            <img src="https://www.bcacauverycollege.com/images/uploads/kaverappa.jpg" alt="Principal Prof. M.B. Kaverappa"
                                className="w-full aspect-[4/5] object-cover rounded-xl" />
                        </div>
                    </div>
                    <div className="lg:col-span-7">
                        <Quote className="w-12 h-12 text-secondary mb-4" />
                        <p className="font-outfit font-light text-2xl lg:text-3xl text-primary leading-snug">
                            "At Cauvery College, Gonikoppal, we are moving boldly — and concertedly — to expand tomorrow's frontiers. We believe that we have the power to shape the future, for the better."
                        </p>
                        <div className="mt-8">
                            <div className="font-bold text-primary text-lg">Prof. M.B. Kaverappa</div>
                            <div className="text-muted-foreground">Principal, Cauvery College Gonikoppal</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Campus images */}
            <section className="section pt-0">
                <div className="container-x">
                    <p className="text-secondary uppercase tracking-[0.25em] text-sm font-bold mb-3">Campus Life</p>
                    <h2 className="font-outfit font-black text-4xl lg:text-5xl text-primary mb-10">Building a vibrant community of creative and accomplished people.</h2>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            "https://res.cloudinary.com/dveiiup8m/image/upload/v1777906293/gallery-assets/college/1.png",
                            "https://res.cloudinary.com/dveiiup8m/image/upload/v1777906301/gallery-assets/college/2.png",
                            "https://res.cloudinary.com/dveiiup8m/image/upload/v1777906312/gallery-assets/college/3.png",
                            "https://res.cloudinary.com/dveiiup8m/image/upload/v1777906326/gallery-assets/college/5.png",
                        ].map((src, i) => (
                            <motion.img key={i} src={src} alt="campus" loading="lazy"
                                initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                                className="aspect-[4/5] w-full object-cover rounded-2xl lift" />
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
