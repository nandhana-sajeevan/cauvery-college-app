import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Menu, X, GraduationCap, LogOut, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getDashboardPath } from "@/lib/auth-utils";

const links = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/courses", label: "Courses" },
    { to: "/admissions", label: "Admissions" },
    { to: "/placements", label: "Placements" },
    { to: "/projects", label: "Projects" },
    { to: "/faculty", label: "Faculty" },
    { to: "/events", label: "Events" },
    { to: "/contact", label: "Contact" },
];

export default function Navbar() {
    const [open, setOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const dashboardPath = getDashboardPath(user?.role);

    return (
        <header className="fixed top-0 inset-x-0 z-50 glass-light" data-testid="navbar">
            <div className="container-x flex items-center justify-between h-20">
                <Link to="/" className="flex items-center gap-3 group" data-testid="logo-link">
                    <div className="w-11 h-11 rounded-xl bg-primary text-secondary flex items-center justify-center font-outfit font-black text-xl shadow-lg group-hover:rotate-6 transition-transform">
                        C
                    </div>
                    <div className="leading-tight">
                        <div className="font-outfit font-bold text-primary text-lg tracking-tight">Cauvery College</div>
                        <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Gonikoppal · Est. 1968</div>
                    </div>
                </Link>

                <nav className="hidden lg:flex items-center gap-7">
                    {links.map((l) => (
                        <NavLink
                            key={l.to}
                            to={l.to}
                            end={l.to === "/"}
                            className={({ isActive }) =>
                                `nav-link font-medium text-[15px] ${isActive ? "active text-primary" : "text-foreground/80 hover:text-primary"}`
                            }
                            data-testid={`nav-${l.label.toLowerCase()}`}
                        >
                            {l.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="hidden lg:flex items-center gap-3">
                    {user ? (
                        <>
                            <Link
                                to={dashboardPath}
                                className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white font-medium hover:bg-primary/90 transition"
                                data-testid="dashboard-link"
                            >
                                <LayoutDashboard className="w-4 h-4" /> Dashboard
                            </Link>
                            <button
                                onClick={() => { logout(); navigate("/"); }}
                                className="p-2 rounded-full hover:bg-muted text-foreground"
                                data-testid="logout-btn"
                                aria-label="Log out"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="text-primary font-medium hover:text-secondary" data-testid="login-link">
                                Login
                            </Link>
                            <Link
                                to="/admissions"
                                className="btn-gold px-5 py-2.5 rounded-full text-sm"
                                data-testid="apply-now-cta"
                            >
                                Apply Now
                            </Link>
                        </>
                    )}
                </div>

                <button
                    className="lg:hidden p-2 text-primary"
                    onClick={() => setOpen(!open)}
                    aria-label="Toggle menu"
                    data-testid="mobile-menu-toggle"
                >
                    {open ? <X /> : <Menu />}
                </button>
            </div>

            {open && (
                <div className="lg:hidden border-t border-border bg-white" data-testid="mobile-menu">
                    <nav className="container-x py-6 flex flex-col gap-4">
                        {links.map((l) => (
                            <NavLink
                                key={l.to}
                                to={l.to}
                                end={l.to === "/"}
                                onClick={() => setOpen(false)}
                                className={({ isActive }) => `font-medium ${isActive ? "text-secondary" : "text-primary"}`}
                            >
                                {l.label}
                            </NavLink>
                        ))}
                        {user ? (
                            <>
                                <Link to={dashboardPath} onClick={() => setOpen(false)} className="font-medium text-primary">Dashboard</Link>
                                <button onClick={() => { logout(); setOpen(false); navigate("/"); }} className="text-left font-medium text-destructive">Logout</button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" onClick={() => setOpen(false)} className="font-medium text-primary">Login</Link>
                                <Link to="/admissions" onClick={() => setOpen(false)} className="btn-gold px-5 py-2.5 rounded-full text-center">Apply Now</Link>
                            </>
                        )}
                    </nav>
                </div>
            )}
        </header>
    );
}
