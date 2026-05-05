import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { LayoutDashboard, ClipboardCheck, FileText, Bell, IndianRupee } from "lucide-react";
import api from "@/lib/api";
import DashboardShell from "@/components/DashboardShell";
import { useAuth } from "@/contexts/AuthContext";

const NAV = [
    { to: "/student-dashboard", label: "Overview", icon: LayoutDashboard },
    { to: "/student-dashboard/attendance", label: "Attendance", icon: ClipboardCheck },
    { to: "/student-dashboard/materials", label: "Materials", icon: FileText },
    { to: "/student-dashboard/fees", label: "Fees", icon: IndianRupee },
    { to: "/student-dashboard/notifications", label: "Notifications", icon: Bell },
];export default function StudentDashboard() {
    return (
        <Routes>
            <Route element={<DashboardShell title="Student Portal" navItems={NAV} />}>
                <Route index element={<Overview />} />
                <Route path="attendance" element={<Attendance />} />
                <Route path="materials" element={<Materials />} />
                <Route path="fees" element={<Fees />} />
                <Route path="notifications" element={<Notifications />} />
            </Route>
        </Routes>
    );
}

function Overview() {
    const { user } = useAuth();
    const [att, setAtt] = useState([]);
    const [fees, setFees] = useState([]);
    const [notifs, setNotifs] = useState([]);

    useEffect(() => {
        api.get("/attendance").then(r => setAtt(r.data));
        api.get("/fees").then(r => setFees(r.data));
        api.get("/notifications").then(r => setNotifs(r.data.slice(0, 3)));
    }, []);

    const present = att.filter(a => a.status === "present").length;
    const pct = att.length ? Math.round((present / att.length) * 100) : 0;
    const due = fees.filter(f => f.status === "pending").reduce((s, f) => s + f.amount, 0);

    return (
        <div data-testid="student-overview">
            <h1 className="font-outfit font-black text-3xl lg:text-4xl text-primary mb-2">Hi, {user?.name?.split(" ")[0]}</h1>
            <p className="text-muted-foreground mb-8">Your academic snapshot at a glance.</p>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-2xl p-6 border border-border">
                    <div className="text-sm uppercase tracking-widest text-muted-foreground mb-2">Attendance</div>
                    <div className="font-outfit font-black text-4xl text-primary">{pct}%</div>
                    <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-secondary" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">{present} of {att.length} classes</div>
                </div>
                <div className="bg-primary text-white rounded-2xl p-6">
                    <div className="text-sm uppercase tracking-widest text-secondary mb-2">Fees Due</div>
                    <div className="font-outfit font-black text-4xl">₹{due.toLocaleString()}</div>
                    <div className="text-xs text-white/60 mt-2">{fees.filter(f => f.status === "pending").length} pending invoice(s)</div>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-border">
                    <div className="text-sm uppercase tracking-widest text-muted-foreground mb-2">Notifications</div>
                    <div className="font-outfit font-black text-4xl text-primary">{notifs.length}</div>
                    <div className="text-xs text-muted-foreground mt-2">Latest in your inbox</div>
                </div>
            </div>
            <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-border p-6">
                    <h3 className="font-outfit font-bold text-xl text-primary mb-4">Latest notifications</h3>
                    <ul className="space-y-3">
                        {notifs.map(n => (
                            <li key={n.id} className="border-l-4 border-secondary pl-4">
                                <div className="font-bold text-primary">{n.title}</div>
                                <div className="text-sm text-muted-foreground">{n.message}</div>
                            </li>
                        ))}
                        {notifs.length === 0 && <li className="text-muted-foreground text-sm">No notifications yet.</li>}
                    </ul>
                </div>
                <div className="bg-white rounded-2xl border border-border p-6">
                    <h3 className="font-outfit font-bold text-xl text-primary mb-4">Recent attendance</h3>
                    <ul className="space-y-2 text-sm">
                        {att.slice(0, 8).map(a => (
                            <li key={a.id} className="flex justify-between">
                                <span>{a.date}</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${a.status === "present" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>{a.status}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

function Attendance() {
    const [list, setList] = useState([]);
    useEffect(() => { api.get("/attendance").then(r => setList(r.data)); }, []);
    return (
        <div data-testid="student-attendance">
            <h1 className="font-outfit font-black text-3xl text-primary mb-6">My Attendance</h1>
            <div className="bg-white rounded-2xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-muted/40 text-xs uppercase tracking-widest text-muted-foreground">
                        <tr><th className="px-5 py-3 text-left">Date</th><th className="px-5 py-3 text-left">Course</th><th className="px-5 py-3 text-left">Status</th></tr>
                    </thead>
                    <tbody>
                        {list.map(a => (
                            <tr key={a.id} className="border-t border-border">
                                <td className="px-5 py-3">{a.date}</td>
                                <td className="px-5 py-3">{a.course_code}</td>
                                <td className="px-5 py-3"><span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${a.status === "present" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>{a.status}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function Materials() {
    const [list, setList] = useState([]);
    useEffect(() => { api.get("/materials").then(r => setList(r.data)); }, []);
    return (
        <div data-testid="student-materials">
            <h1 className="font-outfit font-black text-3xl text-primary mb-6">Study Materials</h1>
            <div className="grid md:grid-cols-2 gap-4">
                {list.map(m => (
                    <a key={m.id} href={m.file_url} target="_blank" rel="noreferrer" className="bg-white rounded-2xl border border-border p-6 lift block">
                        <div className="text-xs uppercase tracking-widest text-secondary font-bold">{m.course_code}</div>
                        <div className="font-outfit font-bold text-lg text-primary mt-1">{m.title}</div>
                        <p className="text-sm text-muted-foreground mt-2">{m.description}</p>
                    </a>
                ))}
            </div>
        </div>
    );
}

function Fees() {
    const [list, setList] = useState([]);
    const [busy, setBusy] = useState(null);
    const [polling, setPolling] = useState(null);
    const [msg, setMsg] = useState("");
    const load = () => api.get("/fees").then(r => setList(r.data));

    useEffect(() => { load(); }, []);

    // Detect return from Stripe
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const sessionId = params.get("session_id");
        const cancelled = params.get("cancelled");
        if (cancelled) {
            setMsg("Payment cancelled. You can try again anytime.");
            window.history.replaceState({}, "", "/student-dashboard/fees");
            return;
        }
        if (!sessionId) return;
        setPolling(sessionId);
        setMsg("Verifying payment with Stripe...");
        let attempts = 0;
        const poll = async () => {
            attempts += 1;
            try {
                const { data } = await api.get(`/payments/status/${sessionId}`);
                if (data.payment_status === "paid") {
                    setMsg("Payment successful! Your fee has been marked paid.");
                    setPolling(null);
                    await load();
                    window.history.replaceState({}, "", "/student-dashboard/fees");
                    return;
                }
                if (data.status === "expired" || attempts >= 8) {
                    setMsg("Payment session expired or not completed. Please try again.");
                    setPolling(null);
                    return;
                }
                setTimeout(poll, 2000);
            } catch {
                setMsg("Could not verify payment. Please refresh.");
                setPolling(null);
            }
        };
        poll();
    }, []);

    const pay = async (id) => {
        setBusy(id); setMsg("");
        try {
            const { data } = await api.post(`/fees/${id}/checkout`, {
                fee_id: id,
                origin_url: window.location.origin,
            });
            window.location.href = data.url;
        } catch (err) {
            setMsg(err.response?.data?.detail || "Could not start checkout");
            setBusy(null);
        }
    };

    return (
        <div data-testid="student-fees">
            <h1 className="font-outfit font-black text-3xl text-primary mb-6">Fees</h1>
            {msg && <div className="mb-5 p-4 rounded-xl bg-secondary/10 border border-secondary/30 text-primary text-sm">{msg}</div>}
            <div className="space-y-3">
                {list.map(f => (
                    <div key={f.id} className="bg-white p-6 rounded-xl border border-border flex flex-col md:flex-row justify-between md:items-center gap-4">
                        <div>
                            <div className="font-bold text-primary">{f.course_code} — {f.semester}</div>
                            <div className="text-sm text-muted-foreground">Amount: ₹{f.amount.toLocaleString()}</div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${f.status === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{f.status}</span>
                            {f.status === "pending" && (
                                <button onClick={() => pay(f.id)} disabled={busy === f.id || !!polling} className="btn-gold px-5 py-2 rounded-full text-sm disabled:opacity-50" data-testid={`pay-fee-${f.id}`}>
                                    {busy === f.id ? "Redirecting..." : "Pay with Stripe"}
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                <p className="text-xs text-muted-foreground italic">* Powered by Stripe (test mode). Use card 4242 4242 4242 4242, any future expiry, any CVC.</p>
            </div>
        </div>
    );
}

function Notifications() {
    const [list, setList] = useState([]);
    useEffect(() => { api.get("/notifications").then(r => setList(r.data)); }, []);
    return (
        <div data-testid="student-notifications">
            <h1 className="font-outfit font-black text-3xl text-primary mb-6">Notifications</h1>
            <div className="space-y-3">
                {list.map(n => (
                    <div key={n.id} className="bg-white p-5 rounded-xl border border-border">
                        <div className="font-bold text-primary">{n.title}</div>
                        <div className="text-sm text-muted-foreground mt-1">{n.message}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
