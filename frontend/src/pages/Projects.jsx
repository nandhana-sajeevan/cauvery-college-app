import { useEffect, useState } from "react";
import api from "@/lib/api";
import { motion } from "framer-motion";
import { ExternalLink, Code2, Sparkles } from "lucide-react";

export default function Projects() {
    const [list, setList] = useState([]);
    const [filter, setFilter] = useState("All");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/projects").then(r => setList(r.data)).finally(() => setLoading(false));
    }, []);

    const categories = ["All", ...Array.from(new Set(list.map(p => p.category)))];
    const filtered = filter === "All" ? list : list.filter(p => p.category === filter);

    return (
        <div data-testid="projects-page">
            <section className="bg-primary text-white py-24 lg:py-32 relative overflow-hidden">
                <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-secondary/10 blur-3xl" />
                <div className="container-x relative">
                    <p className="text-secondary uppercase tracking-[0.3em] text-sm font-bold mb-3">Built by Cauverians</p>
                    <h1 className="font-outfit font-black text-5xl lg:text-7xl max-w-4xl">Live apps, real <span className="text-secondary">impact</span>.</h1>
                    <p className="mt-6 text-white/85 text-lg max-w-2xl leading-relaxed">
                        From Play Store apps to AI-powered tools and AR experiences — explore mobile apps, web platforms and ML projects built by Cauvery College students during workshops, hackathons and capstone semesters.
                    </p>
                </div>
            </section>

            <section className="section">
                <div className="container-x">
                    <div className="flex flex-wrap gap-2 mb-10">
                        {categories.map(c => (
                            <button key={c} onClick={() => setFilter(c)}
                                className={`px-5 py-2 rounded-full text-sm font-medium transition ${filter === c ? "bg-primary text-white" : "bg-white border border-border text-foreground hover:border-primary"}`}
                                data-testid={`projects-filter-${c}`}>
                                {c}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-96 rounded-2xl bg-muted animate-pulse" />)}
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filtered.map((p, i) => (
                                <motion.article key={p.id}
                                    initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                                    transition={{ delay: i * 0.08 }}
                                    className="bg-white rounded-2xl overflow-hidden border border-border lift"
                                    data-testid={`project-card-${p.id}`}>
                                    <div className="aspect-[16/10] overflow-hidden bg-primary/5 flex items-center justify-center p-6">
                                        <img src={p.image} alt={p.title} className="w-full h-full object-cover rounded-lg" />
                                    </div>
                                    <div className="p-6">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Code2 className="w-4 h-4 text-secondary" />
                                            <span className="text-xs uppercase tracking-widest font-bold text-secondary">{p.category}</span>
                                            {p.link && <Sparkles className="w-3.5 h-3.5 text-secondary ml-auto" title="Live" />}
                                        </div>
                                        <h3 className="font-outfit font-bold text-xl text-primary leading-snug">{p.title}</h3>
                                        <p className="text-muted-foreground text-sm mt-2 leading-relaxed line-clamp-3">{p.description}</p>
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {p.tags.slice(0, 4).map(t => (
                                                <span key={t} className="text-[10px] uppercase tracking-widest font-bold text-primary/70 bg-primary/5 px-2 py-1 rounded-full">{t}</span>
                                            ))}
                                        </div>
                                        <div className="mt-5 pt-4 border-t border-border flex justify-between items-center text-xs">
                                            <div>
                                                <div className="font-medium text-foreground">{p.student_name}</div>
                                                <div className="text-muted-foreground">{p.batch}</div>
                                            </div>
                                            {p.link && (
                                                <a href={p.link} target="_blank" rel="noreferrer" className="text-primary hover:text-secondary inline-flex items-center gap-1 font-medium">
                                                    View <ExternalLink className="w-3.5 h-3.5" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </motion.article>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
