import { motion } from "framer-motion";
import { TrendingUp, Award, Briefcase, IndianRupee, GraduationCap, Quote } from "lucide-react";
import { Link } from "react-router-dom";

const KPI = [
    { value: "98%", label: "Placement Rate", icon: TrendingUp },
    { value: "₹4.5 LPA", label: "Average Package", icon: IndianRupee },
    { value: "₹12 LPA", label: "Highest Package", icon: Award },
    { value: "150+", label: "Students Placed (last batch)", icon: Briefcase },
];

const RECRUITERS = [
    { name: "Infosys", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Infosys_logo.svg/1280px-Infosys_logo.svg.png" },
    { name: "Wipro", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Wipro_Primary_Logo_Color_RGB.svg/1280px-Wipro_Primary_Logo_Color_RGB.svg.png" },
    { name: "TCS", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Tata_Consultancy_Services_old_logo.svg/1280px-Tata_Consultancy_Services_old_logo.svg.png" },
    { name: "Accenture", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Accenture.svg/1280px-Accenture.svg.png" },
    { name: "Capgemini", logo: "https://www.logo.wine/a/logo/Capgemini/Capgemini-Logo.wine.svg" },
    { name: "Happiest Minds", logo: "https://upload.wikimedia.org/wikipedia/commons/6/60/HappiestMinds_Logo_Colour.png" },
    { name: "Equalize RCM", logo: "https://cdn.nwe.io/files/x/23/f3/adb58766c2c08cd30825064625fc.jpg" },
    { name: "Invenzo Labs", logo: "https://media.licdn.com/dms/image/v2/C560BAQHyKehX_WiXGA/company-logo_200_200/company-logo_200_200/0/1630655378051/invenzo_labs_india_private_limited_logo?e=2147483647&v=beta&t=co5PFxL0yVrBLD_XEcTInZA82RDco0fbFlzY1cHgYWc" },
    { name: "Sigma Networks", logo: "https://www.sigmanetworks.co.in/wp-content/uploads/2017/09/logo-nw.png" },
    { name: "SPTech", logo: "https://upload.wikimedia.org/wikipedia/commons/6/60/HappiestMinds_Logo_Colour.png" },
];

const SKILLS = ["React", "Node.js", "Java", "Python", "Cloud", "Data Analytics", "Kotlin", "Android", "Game Dev", "UI / UX", "AWS", "Docker"];

const TRAINING = ["Full Stack Web Development", "AI / ML Fundamentals", "Cloud Computing", "Data Structures & Algorithms", "Soft Skills & Aptitude", "Live Capstone Projects", "Industry Internships", "Mock Interviews"];

const PLACED_STUDENTS = [
    { name: "Abhishek B N", role: "Software Engineer", company: "Equalize RCM", quote: "The practical exposure and coding culture at Cauvery BCA helped me crack my placement with confidence." },
    { name: "Prathvin T R", role: "Full Stack Developer", company: "Invenzo Labs", quote: "The mentorship and real-world projects gave me an edge over others in interviews." },
    { name: "Nithin V", role: "Cloud Engineer", company: "Happiest Minds", quote: "Workshops and certifications gave me real industry readiness — AWS certified before graduation." },
    { name: "Divya S", role: "Data Analyst", company: "Capgemini", quote: "From Excel to Power BI to Python — I built every layer of my data career here at Cauvery." },
];

export default function Placements() {
    return (
        <div data-testid="placements-page">
            {/* Hero */}
            <section className="bg-primary text-white py-24 lg:py-32 relative overflow-hidden">
                <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-secondary/10 blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-secondary/10 blur-3xl" />
                <div className="container-x relative">
                    <p className="text-secondary uppercase tracking-[0.3em] text-sm font-bold mb-3">Placements</p>
                    <h1 className="font-outfit font-black text-5xl lg:text-7xl max-w-4xl">Ready for your <span className="text-secondary">dream career</span>.</h1>
                    <p className="mt-6 text-white/85 text-lg max-w-2xl leading-relaxed">
                        Cauvery College Gonikoppal's dedicated placement cell has built a 98% placement track record. Every batch graduates with industry-ready skills, real-world internships and mentorship from CXOs and senior alumni.
                    </p>
                </div>
            </section>

            {/* KPIs */}
            <section className="-mt-12 relative z-10">
                <div className="container-x">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                        {KPI.map((k, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                                className="glass-light rounded-2xl p-7 lift" data-testid={`placement-kpi-${i}`}>
                                <k.icon className="w-7 h-7 text-secondary mb-3" />
                                <div className="font-outfit font-black text-3xl lg:text-4xl text-primary">{k.value}</div>
                                <div className="text-xs uppercase tracking-widest text-muted-foreground mt-1">{k.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Recruiters marquee */}
            <section className="section">
                <div className="container-x">
                    <p className="text-secondary uppercase tracking-[0.25em] text-sm font-bold mb-3">Top recruiters</p>
                    <h2 className="font-outfit font-black text-4xl lg:text-5xl text-primary mb-12 max-w-3xl">Where Cauverians thrive.</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        {RECRUITERS.map((r, i) => (
                            <motion.div key={r.name}
                                initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                                className="bg-white border border-border rounded-2xl h-32 flex items-center justify-center p-6 lift">
                                <img src={r.logo} alt={r.name} className="max-h-12 max-w-[120px] object-contain grayscale hover:grayscale-0 transition" />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Skills + Training */}
            <section className="section bg-white border-y border-border">
                <div className="container-x grid lg:grid-cols-2 gap-12">
                    <div>
                        <p className="text-secondary uppercase tracking-[0.25em] text-sm font-bold mb-3">Top demand skills</p>
                        <h3 className="font-outfit font-black text-3xl text-primary mb-6">Built into every Cauverian's toolkit.</h3>
                        <div className="flex flex-wrap gap-3">
                            {SKILLS.map((s) => (
                                <motion.span key={s} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                                    className="px-4 py-2 rounded-full bg-primary/5 border border-primary/10 text-primary font-medium text-sm">{s}</motion.span>
                            ))}
                        </div>
                    </div>
                    <div>
                        <p className="text-secondary uppercase tracking-[0.25em] text-sm font-bold mb-3">Training focus areas</p>
                        <h3 className="font-outfit font-black text-3xl text-primary mb-6">From classroom to corporate.</h3>
                        <ul className="space-y-3">
                            {TRAINING.map((t, i) => (
                                <motion.li key={t} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                                    className="flex items-center gap-3 text-foreground/85">
                                    <span className="w-6 h-6 rounded-full bg-secondary/20 text-secondary text-xs font-bold flex items-center justify-center">{i + 1}</span>
                                    {t}
                                </motion.li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* Placed students */}
            <section className="section">
                <div className="container-x">
                    <p className="text-secondary uppercase tracking-[0.25em] text-sm font-bold mb-3">Placed alumni</p>
                    <h2 className="font-outfit font-black text-4xl lg:text-5xl text-primary mb-12 max-w-3xl">Stories from the offer letter pile.</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        {PLACED_STUDENTS.map((s, i) => (
                            <motion.div key={s.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                                className="bg-white rounded-2xl p-7 border border-border lift">
                                <Quote className="w-7 h-7 text-secondary mb-4" />
                                <p className="font-outfit text-lg text-primary leading-snug">"{s.quote}"</p>
                                <div className="mt-5 flex items-center gap-3">
                                    <div className="w-11 h-11 rounded-full bg-primary text-secondary font-outfit font-black flex items-center justify-center">
                                        {s.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                                    </div>
                                    <div>
                                        <div className="font-bold text-primary">{s.name}</div>
                                        <div className="text-sm text-muted-foreground">{s.role} · {s.company}</div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="section pt-0">
                <div className="container-x">
                    <div className="rounded-2xl bg-primary text-white p-10 lg:p-16 grid lg:grid-cols-2 gap-8 items-center relative overflow-hidden">
                        <div className="absolute -right-20 -bottom-20 w-72 h-72 rounded-full bg-secondary/20 blur-3xl" />
                        <div className="relative">
                            <GraduationCap className="w-12 h-12 text-secondary mb-4" />
                            <h3 className="font-outfit font-black text-3xl lg:text-4xl">Your career story starts here.</h3>
                            <p className="mt-3 text-white/80">Join the next batch of Cauverians shaping India's tech, business and creative industries.</p>
                        </div>
                        <div className="relative flex flex-col sm:flex-row gap-4 lg:justify-end">
                            <Link to="/admissions" className="btn-gold px-7 py-4 rounded-full text-center inline-flex items-center justify-center">Apply Now</Link>
                            <Link to="/contact" className="btn-outline-gold px-7 py-4 rounded-full text-center inline-flex items-center justify-center">Talk to Placement Cell</Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
