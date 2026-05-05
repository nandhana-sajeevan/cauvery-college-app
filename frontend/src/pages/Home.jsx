import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import CountUp from "react-countup";
import { ArrowRight, Award, BookOpen, Users, GraduationCap, Sparkles, Calendar, ChevronRight } from "lucide-react";
import api from "@/lib/api";

const HERO = "https://res.cloudinary.com/dveiiup8m/image/upload/v1777906329/gallery-assets/college/6.png";

const STATS = [
    { value: 58, suffix: "+", label: "Years of Legacy" },
    { value: 15000, suffix: "+", label: "Successful Alumni" },
    { value: 98, suffix: "%", label: "Placement Rate" },
    { value: 17, suffix: " Acres", label: "Lush Campus" },
];

const HIGHLIGHTS = [
    { icon: Award, title: "Established 1968", desc: "Over five decades of academic excellence in the heart of Kodagu (Coorg) — Karnataka." },
    { icon: BookOpen, title: "Future-Ready Curriculum", desc: "AI, Full-Stack, Cloud & Data Science woven into a Mangalore University-affiliated syllabus." },
    { icon: Users, title: "Industry Mentorship", desc: "Faculty + industry mentors + live projects with Infosys, Wipro, TCS, Capgemini & more." },
    { icon: GraduationCap, title: "100% Placement Assistance", desc: "Dedicated placement cell — average ₹4.5 LPA, highest ₹12 LPA for BCA grads." },
];

const TESTIMONIALS = [
    { name: "Abhishek B N", role: "Software Engineer @ Equalize RCM · BCA 2023", quote: "The practical exposure and coding culture at Cauvery BCA helped me crack my placement with confidence." },
    { name: "Shawn Codava K S", role: "Software Developer Intern · BCA 2024", quote: "From zero coding knowledge to deploying real apps — this journey was transformational." },
    { name: "Prathvin T R", role: "Full Stack Developer @ Invenzo Labs · BCA 2022", quote: "The mentorship and real-world projects gave me an edge over others in interviews." },
];

export default function Home() {
    const [events, setEvents] = useState([]);
    const [tIndex, setTIndex] = useState(0);

    useEffect(() => {
        api.get("/events").then(r => setEvents(r.data.slice(0, 3))).catch(() => {});
    }, []);

    useEffect(() => {
        const id = setInterval(() => setTIndex((i) => (i + 1) % TESTIMONIALS.length), 5500);
        return () => clearInterval(id);
    }, []);

    return (
        <div data-testid="home-page">
            {/* HERO */}
            <section className="relative min-h-[92vh] overflow-hidden" data-testid="hero-section">
                <div className="absolute inset-0">
                    <img src={HERO} alt="Cauvery campus" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 hero-overlay" />
                </div>

                <div className="relative container-x flex items-center min-h-[92vh] py-24">
                    <div className="max-w-3xl">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-dark text-secondary text-sm font-medium mb-6">
                            <Sparkles className="w-4 h-4" /> Admissions Open • 2026 — 27
                        </motion.div>
                        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
                            className="font-outfit font-black text-white text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight">
                            Education for<br />
                            <span className="text-secondary">Self-Reliance & Self-Realization.</span>
                        </motion.h1>
                        <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.25 }}
                            className="mt-6 text-white/85 text-lg md:text-xl max-w-2xl leading-relaxed">
                            Established in 1968 and named after Mother Cauvery, Cauvery College Gonikoppal has shaped over 15,000 graduates across 58 years — empowering rural youth of Kodagu (Coorg) with knowledge, skills and values for a global stage.
                        </motion.p>
                        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4 }}
                            className="mt-10 flex flex-col sm:flex-row gap-4">
                            <Link to="/admissions" className="btn-gold px-7 py-4 rounded-full inline-flex items-center justify-center gap-2 shadow-xl" data-testid="hero-apply-btn">
                                Apply Now <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link to="/courses" className="btn-outline-gold px-7 py-4 rounded-full inline-flex items-center justify-center gap-2" data-testid="hero-courses-btn">
                                Explore Courses
                            </Link>
                        </motion.div>
                    </div>
                </div>

                {/* Stats overlapping */}
                <div className="relative -mt-16 pb-4 z-10">
                    <div className="container-x">
                        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
                            className="glass-light rounded-2xl grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-border overflow-hidden" data-testid="stats-bar">
                            {STATS.map((s, i) => (
                                <div key={i} className="p-8 lg:p-10 text-center">
                                    <div className="font-outfit font-black text-4xl lg:text-5xl text-primary">
                                        <CountUp end={s.value} duration={2.4} separator="," />{s.suffix}
                                    </div>
                                    <div className="mt-2 text-sm uppercase tracking-widest text-muted-foreground">{s.label}</div>
                                </div>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* HIGHLIGHTS */}
            <section className="section">
                <div className="container-x">
                    <div className="max-w-2xl mb-14">
                        <p className="text-secondary text-sm font-bold uppercase tracking-[0.25em] mb-3">Why CCAUVERY</p>
                        <h2 className="font-outfit font-black text-4xl lg:text-5xl text-primary leading-tight">
                            A choice that makes the <span className="italic text-secondary">difference</span>.
                        </h2>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {HIGHLIGHTS.map((h, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className="bg-white rounded-2xl p-7 border border-border lift" data-testid={`highlight-${i}`}>
                                <div className="w-12 h-12 rounded-xl bg-primary text-secondary flex items-center justify-center mb-5">
                                    <h.icon className="w-6 h-6" />
                                </div>
                                <h3 className="font-outfit font-bold text-xl text-primary mb-2">{h.title}</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">{h.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* COURSES TEASER */}
            <section className="section bg-white border-y border-border">
                <div className="container-x">
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
                        <div>
                            <p className="text-secondary text-sm font-bold uppercase tracking-[0.25em] mb-3">Programs</p>
                            <h2 className="font-outfit font-black text-4xl lg:text-5xl text-primary">Choose your path forward</h2>
                        </div>
                        <Link to="/courses" className="text-primary font-medium inline-flex items-center gap-2 hover:text-secondary">
                            View all programs <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { code: "BCA", name: "Computer Applications", img: "https://res.cloudinary.com/dveiiup8m/image/upload/v1777906273/gallery-assets/bca/lab/lab.png" },
                            { code: "BBA", name: "Business Administration", img: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=80" },
                            { code: "BCOM", name: "Commerce", img: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=900&q=80" },
                        ].map((c, i) => (
                            <Link to={`/courses/${c.code}`} key={c.code}
                                className="group relative h-80 rounded-2xl overflow-hidden lift" data-testid={`course-card-${c.code}`}>
                                <img src={c.img} alt={c.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/60 to-transparent" />
                                <div className="relative h-full flex flex-col justify-end p-7 text-white">
                                    <span className="text-secondary text-xs uppercase tracking-[0.25em] font-bold">3 Year Bachelor's</span>
                                    <h3 className="mt-2 font-outfit font-black text-3xl">{c.code}</h3>
                                    <p className="text-white/85">{c.name}</p>
                                    <div className="mt-4 inline-flex items-center gap-2 text-secondary font-semibold opacity-0 group-hover:opacity-100 transition">
                                        Learn more <ChevronRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* TESTIMONIALS */}
            <section className="section bg-primary text-white relative overflow-hidden">
                <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-secondary/10 blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-secondary/10 blur-3xl" />
                <div className="container-x relative">
                    <p className="text-secondary text-sm font-bold uppercase tracking-[0.25em] mb-3">Voices of Cauvery</p>
                    <h2 className="font-outfit font-black text-4xl lg:text-5xl mb-14 max-w-3xl">Stories that speak louder than rankings.</h2>
                    <div className="relative h-64 md:h-52" data-testid="testimonials-carousel">
                        {TESTIMONIALS.map((t, i) => (
                            <motion.div key={i}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: tIndex === i ? 1 : 0 }}
                                transition={{ duration: 0.6 }}
                                className={`absolute inset-0 ${tIndex === i ? "pointer-events-auto" : "pointer-events-none"}`}>
                                <p className="font-outfit font-light text-2xl md:text-3xl leading-snug text-white/95 max-w-4xl">
                                    "{t.quote}"
                                </p>
                                <div className="mt-6">
                                    <div className="font-bold text-secondary">{t.name}</div>
                                    <div className="text-sm text-white/70">{t.role}</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                    <div className="mt-8 flex gap-2">
                        {TESTIMONIALS.map((_, i) => (
                            <button key={i} onClick={() => setTIndex(i)}
                                className={`h-1.5 rounded-full transition-all ${tIndex === i ? "w-10 bg-secondary" : "w-4 bg-white/30"}`}
                                aria-label={`Testimonial ${i + 1}`} />
                        ))}
                    </div>
                </div>
            </section>

            {/* NEWS / EVENTS */}
            <section className="section">
                <div className="container-x">
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
                        <div>
                            <p className="text-secondary text-sm font-bold uppercase tracking-[0.25em] mb-3">Happening on campus</p>
                            <h2 className="font-outfit font-black text-4xl lg:text-5xl text-primary">News & Upcoming Events</h2>
                        </div>
                        <Link to="/events" className="text-primary font-medium inline-flex items-center gap-2 hover:text-secondary">
                            See all events <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {events.map((e) => (
                            <Link to={`/events/${e.id}`} key={e.id} className="bg-white rounded-2xl overflow-hidden border border-border lift" data-testid={`event-card-${e.id}`}>
                                <div className="aspect-[16/10] overflow-hidden">
                                    <img src={e.image} alt={e.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                                </div>
                                <div className="p-6">
                                    <span className="text-xs uppercase tracking-widest text-secondary font-bold">{e.category}</span>
                                    <h3 className="font-outfit font-bold text-xl text-primary mt-2 mb-3 leading-snug">{e.title}</h3>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Calendar className="w-4 h-4" />
                                        {new Date(e.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="section pt-0">
                <div className="container-x">
                    <div className="relative rounded-2xl bg-primary text-white p-10 lg:p-16 overflow-hidden">
                        <div className="absolute -right-20 -bottom-20 w-72 h-72 rounded-full bg-secondary/20 blur-3xl" />
                        <div className="relative grid lg:grid-cols-2 gap-8 items-center">
                            <div>
                                <h3 className="font-outfit font-black text-3xl lg:text-4xl leading-tight">
                                    Your future starts at <span className="text-secondary">Cauvery</span>.
                                </h3>
                                <p className="mt-4 text-white/80 max-w-xl">Applications for the 2026 — 27 academic year are open. Take the first step today.</p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4 lg:justify-end">
                                <Link to="/admissions" className="btn-gold px-7 py-4 rounded-full inline-flex items-center justify-center gap-2">
                                    Apply Now <ArrowRight className="w-4 h-4" />
                                </Link>
                                <Link to="/contact" className="btn-outline-gold px-7 py-4 rounded-full inline-flex items-center justify-center">
                                    Talk to us
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
