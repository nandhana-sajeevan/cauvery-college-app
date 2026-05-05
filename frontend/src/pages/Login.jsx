import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { formatApiError } from "@/lib/api";
import { getDashboardPath } from "@/lib/auth-utils";
import { GraduationCap, ArrowRight } from "lucide-react";

export default function Login() {
    const { login, user } = useAuth();
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);
    const navigate = useNavigate();

    if (user) {
        return <Navigate to={getDashboardPath(user.role)} replace />;
    }

    const submit = async (e) => {
        e.preventDefault();
        setError(""); setBusy(true);
        try {
            const u = await login(form.email, form.password);
            navigate(getDashboardPath(u.role));
        } catch (err) {
            setError(formatApiError(err.response?.data?.detail) || "Login failed");
        } finally { setBusy(false); }
    };

    return (
        <div className="min-h-[calc(100vh-5rem)] grid lg:grid-cols-2" data-testid="login-page">
            <div className="hidden lg:block relative">
                <img src="https://res.cloudinary.com/dveiiup8m/image/upload/v1777906329/gallery-assets/college/6.png" alt="Cauvery College campus" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-primary/75" />
                <div className="absolute inset-0 flex flex-col justify-end p-12 text-white">
                    <div className="bg-white rounded-xl p-3 inline-block mb-5 shadow-2xl self-start">
                        <img src="/cauvery-logo.jpg" alt="Cauvery College" className="h-16 w-auto" />
                    </div>
                    <h2 className="font-outfit font-black text-4xl leading-tight">Welcome back to <span className="text-secondary">Cauvery College</span>.</h2>
                    <p className="mt-3 text-white/80 max-w-md">Education for Self-Reliance & Self-Realization. Access your dashboard for attendance, materials, fees and more.</p>
                </div>
            </div>

            <div className="flex items-center justify-center p-8 lg:p-16">
                <div className="w-full max-w-md">
                    <h1 className="font-outfit font-black text-3xl text-primary mb-2">Sign in</h1>
                    <p className="text-muted-foreground mb-8">Enter your CCAUVERY credentials.</p>

                    {error && <div className="mb-6 p-4 rounded-xl bg-destructive/10 text-destructive text-sm" data-testid="login-error">{error}</div>}

                    <form onSubmit={submit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium mb-2">Email</label>
                            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                                data-testid="login-email" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Password</label>
                            <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                                data-testid="login-password" />
                        </div>
                        <button type="submit" disabled={busy}
                            className="w-full btn-gold py-3.5 rounded-full inline-flex items-center justify-center gap-2 disabled:opacity-50"
                            data-testid="login-submit">
                            {busy ? "Signing in..." : <>Sign in <ArrowRight className="w-4 h-4" /></>}
                        </button>
                    </form>

                    <div className="mt-8 p-5 rounded-xl bg-muted/40 border border-border text-sm">
                        <div className="font-bold text-primary mb-2">Demo accounts</div>
                        <ul className="space-y-1 text-muted-foreground text-xs font-mono">
                            <li>admin@ccauvery.edu / Admin@123</li>
                            <li>faculty@ccauvery.edu / Faculty@123</li>
                            <li>student@ccauvery.edu / Student@123</li>
                        </ul>
                    </div>

                    <p className="mt-6 text-sm text-muted-foreground text-center">
                        New here? <Link to="/register" className="text-primary font-semibold hover:text-secondary">Create an account</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
