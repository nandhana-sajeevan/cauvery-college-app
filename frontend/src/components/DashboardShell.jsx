import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, Home } from "lucide-react";

export default function DashboardShell({ title, navItems }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const initials = (user?.name || "U").split(" ").map(s => s[0]).slice(0, 2).join("").toUpperCase();

    return (
        <div className="min-h-screen bg-background flex" data-testid="dashboard-shell">
            <aside className="hidden lg:flex flex-col w-72 bg-primary text-white p-6 sticky top-0 h-screen">
                <Link to="/" className="flex items-center gap-3 mb-10">
                    <div className="bg-white rounded-lg p-2">
                        <img src="/cauvery-logo.jpg" alt="Cauvery College" className="h-9 w-auto" />
                    </div>
                    <div className="leading-tight">
                        <div className="font-outfit font-bold text-base">Cauvery College</div>
                        <div className="text-[10px] uppercase tracking-widest text-secondary/80">{title}</div>
                    </div>
                </Link>

                <nav className="flex-1 space-y-1">
                    {navItems.map((n) => (
                        <NavLink key={n.to} to={n.to} end
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl transition ${isActive ? "bg-secondary text-primary font-bold" : "text-white/80 hover:bg-white/10 hover:text-white"}`
                            }
                            data-testid={`nav-${n.label.toLowerCase().replace(/\s+/g, "-")}`}>
                            <n.icon className="w-5 h-5" />
                            <span>{n.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="mt-6 border-t border-white/10 pt-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-secondary text-primary font-bold flex items-center justify-center">{initials}</div>
                        <div className="min-w-0">
                            <div className="font-medium truncate">{user?.name}</div>
                            <div className="text-xs text-white/60 truncate">{user?.email}</div>
                        </div>
                    </div>
                    <Link to="/" className="flex items-center gap-2 text-sm text-white/70 hover:text-secondary mb-2">
                        <Home className="w-4 h-4" /> Back to website
                    </Link>
                    <button onClick={() => { logout(); navigate("/"); }}
                        className="flex items-center gap-2 text-sm text-white/70 hover:text-secondary"
                        data-testid="dash-logout">
                        <LogOut className="w-4 h-4" /> Logout
                    </button>
                </div>
            </aside>

            {/* Mobile header */}
            <div className="lg:hidden fixed top-0 inset-x-0 z-30 bg-primary text-white p-4 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2">
                    <div className="bg-white rounded-md p-1">
                        <img src="/cauvery-logo.jpg" alt="Cauvery College" className="h-7 w-auto" />
                    </div>
                    <span className="font-bold">{title}</span>
                </Link>
                <button onClick={() => { logout(); navigate("/"); }} className="text-white/80"><LogOut className="w-5 h-5" /></button>
            </div>

            <main className="flex-1 lg:p-10 p-5 pt-20 lg:pt-10 max-w-full overflow-x-hidden">
                <Outlet />
            </main>
        </div>
    );
}
