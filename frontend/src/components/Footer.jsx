import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-primary text-white" data-testid="footer">
            <div className="container-x py-16 grid lg:grid-cols-4 gap-12">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-secondary text-primary font-outfit font-black text-2xl flex items-center justify-center">C</div>
                        <div>
                            <div className="font-outfit font-bold text-xl">CCAUVERY</div>
                            <div className="text-xs uppercase tracking-widest text-secondary/80">Cauvery College</div>
                        </div>
                    </div>
                    <p className="text-white/70 text-sm leading-relaxed">
                        Cauvery College Gonikoppal — established 1968. Empowering rural Kodagu through quality education for over five decades. Named after Mother Cauvery, a symbol of purity, knowledge and service.
                    </p>
                </div>

                <div>
                    <h4 className="font-outfit font-bold text-secondary mb-5 uppercase text-sm tracking-widest">Quick Links</h4>
                    <ul className="space-y-3 text-white/70 text-sm">
                        <li><Link to="/about" className="hover:text-secondary">About Us</Link></li>
                        <li><Link to="/courses" className="hover:text-secondary">Programmes</Link></li>
                        <li><Link to="/admissions" className="hover:text-secondary">Admissions</Link></li>
                        <li><Link to="/faculty" className="hover:text-secondary">Faculty</Link></li>
                        <li><Link to="/events" className="hover:text-secondary">Events</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-outfit font-bold text-secondary mb-5 uppercase text-sm tracking-widest">Contact</h4>
                    <ul className="space-y-3 text-white/70 text-sm">
                        <li className="flex gap-3"><MapPin className="w-4 h-4 text-secondary mt-1 shrink-0" /><span>5WM8+FJM, Virajpet-Mysore Rd,<br />Gonikoppa, Karnataka 571213, India</span></li>
                        <li className="flex gap-3 items-center"><Phone className="w-4 h-4 text-secondary" /><span>+91 78991 47627</span></li>
                        <li className="flex gap-3 items-center"><Mail className="w-4 h-4 text-secondary" /><span>bcacauverycollege@gmail.com</span></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-outfit font-bold text-secondary mb-5 uppercase text-sm tracking-widest">Follow</h4>
                    <div className="flex gap-3">
                        {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                            <a key={i} href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-secondary hover:text-primary text-white flex items-center justify-center transition">
                                <Icon className="w-4 h-4" />
                            </a>
                        ))}
                    </div>
                    <p className="text-xs text-white/50 mt-6 leading-relaxed">
                        Affiliated to Mangalore University.<br />NAAC graded · 58+ years of legacy.
                    </p>
                </div>
            </div>

            <div className="border-t border-white/10">
                <div className="container-x py-5 flex flex-col md:flex-row justify-between items-center text-xs text-white/60">
                    <p>© {new Date().getFullYear()} Cauvery College Gonikoppal. All rights reserved.</p>
                    <p className="mt-2 md:mt-0">Empowering Education for the Future</p>
                </div>
            </div>
        </footer>
    );
}
