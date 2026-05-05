import { useState } from "react";
import api, { formatApiError } from "@/lib/api";
import { MapPin, Phone, Mail, Send, CheckCircle2 } from "lucide-react";

export default function Contact() {
    const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
    const [done, setDone] = useState(false);
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

    const submit = async (e) => {
        e.preventDefault();
        setError(""); setBusy(true);
        try {
            await api.post("/contact", form);
            setDone(true);
        } catch (err) {
            setError(formatApiError(err.response?.data?.detail) || "Could not send message");
        } finally { setBusy(false); }
    };

    return (
        <div data-testid="contact-page">
            <section className="bg-primary text-white py-24 lg:py-32">
                <div className="container-x">
                    <p className="text-secondary uppercase tracking-[0.3em] text-sm font-bold mb-3">Contact</p>
                    <h1 className="font-outfit font-black text-5xl lg:text-7xl">Let's <span className="text-secondary">talk</span>.</h1>
                </div>
            </section>

            <section className="section">
                <div className="container-x grid lg:grid-cols-12 gap-12">
                    <aside className="lg:col-span-4 space-y-6">
                        <Block icon={MapPin} title="Address" body={<>5WM8+FJM, Virajpet-Mysore Rd,<br />Gonikoppa, Karnataka 571213, India</>} />
                        <Block icon={Phone} title="Phone / WhatsApp" body="+91 78991 47627 (Mon — Fri, 9am — 5pm)" />
                        <Block icon={Mail} title="Email" body="bcacauverycollege@gmail.com" />
                        <div className="rounded-2xl overflow-hidden border border-border">
                            <iframe
                                title="map"
                                src="https://maps.google.com/maps?q=Cauvery%20College%20Gonikoppal&t=&z=15&ie=UTF8&iwloc=&output=embed"
                                width="100%" height="280" loading="lazy" style={{ border: 0 }} />
                        </div>
                    </aside>

                    <div className="lg:col-span-8">
                        <div className="bg-white rounded-2xl border border-border p-8 lg:p-10">
                            <h2 className="font-outfit font-black text-3xl text-primary mb-2">Send us a message</h2>
                            <p className="text-muted-foreground mb-6">Have a question? We typically reply within one business day.</p>

                            {done ? (
                                <div className="p-6 rounded-xl bg-secondary/10 border border-secondary/30 text-primary flex items-start gap-3" data-testid="contact-success">
                                    <CheckCircle2 className="w-6 h-6 text-secondary shrink-0" />
                                    <div>
                                        <div className="font-bold">Message sent.</div>
                                        <div className="text-sm">Thank you, {form.name || "friend"}. Our team will get back to you soon.</div>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={submit} className="grid md:grid-cols-2 gap-5">
                                    {error && <div className="md:col-span-2 p-4 rounded-xl bg-destructive/10 text-destructive text-sm">{error}</div>}
                                    <Input label="Name" required value={form.name} onChange={update("name")} testId="contact-name" />
                                    <Input label="Email" type="email" required value={form.email} onChange={update("email")} testId="contact-email" />
                                    <div className="md:col-span-2"><Input label="Subject" required value={form.subject} onChange={update("subject")} testId="contact-subject" /></div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium mb-2">Message *</label>
                                        <textarea required rows={5} value={form.message} onChange={update("message")}
                                            className="w-full px-4 py-3 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                                            data-testid="contact-message" />
                                    </div>
                                    <button type="submit" disabled={busy}
                                        className="md:col-span-2 btn-gold py-4 rounded-full inline-flex items-center justify-center gap-2 disabled:opacity-50"
                                        data-testid="contact-submit">
                                        {busy ? "Sending..." : <>Send message <Send className="w-4 h-4" /></>}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

function Block({ icon: Icon, title, body }) {
    return (
        <div className="flex gap-4 items-start bg-white rounded-2xl border border-border p-6">
            <div className="w-11 h-11 rounded-xl bg-primary text-secondary flex items-center justify-center shrink-0"><Icon className="w-5 h-5" /></div>
            <div>
                <div className="font-outfit font-bold text-primary">{title}</div>
                <div className="text-muted-foreground text-sm mt-1 leading-relaxed">{body}</div>
            </div>
        </div>
    );
}

function Input({ label, testId, ...rest }) {
    return (
        <div>
            <label className="block text-sm font-medium mb-2">{label}{rest.required && " *"}</label>
            <input {...rest} data-testid={testId}
                className="w-full px-4 py-3 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition" />
        </div>
    );
}
