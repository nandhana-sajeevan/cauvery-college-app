import { useEffect, useState } from "react";
import api, { formatApiError } from "@/lib/api";
import { motion } from "framer-motion";
import { Send, CheckCircle2, FileText, ArrowRight } from "lucide-react";

export default function Admissions() {
    const [courses, setCourses] = useState([]);
    const [form, setForm] = useState({
        full_name: "", email: "", phone: "", dob: "", gender: "Male",
        address: "", course_code: "BCA", qualification: "", marks: ""
    });
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        api.get("/courses").then(r => setCourses(r.data));
    }, []);

    const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

    const submit = async (e) => {
        e.preventDefault();
        setError(""); setSubmitting(true);
        try {
            const { data } = await api.post("/admissions", { ...form, marks: parseFloat(form.marks) });
            setSuccess(data);
        } catch (err) {
            setError(formatApiError(err.response?.data?.detail) || "Submission failed");
        } finally {
            setSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="section" data-testid="admission-success">
                <div className="container-x max-w-2xl text-center">
                    <div className="w-20 h-20 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10 text-secondary" />
                    </div>
                    <h1 className="font-outfit font-black text-4xl text-primary mb-4">Application received!</h1>
                    <p className="text-muted-foreground text-lg mb-2">Reference ID: <span className="font-mono text-primary">{success.id.slice(0, 8).toUpperCase()}</span></p>
                    <p className="text-muted-foreground">Our admissions team will reach out within 48 hours at <strong>{success.email}</strong>.</p>
                </div>
            </div>
        );
    }

    return (
        <div data-testid="admissions-page">
            <section className="bg-primary text-white py-24 lg:py-32">
                <div className="container-x">
                    <p className="text-secondary uppercase tracking-[0.3em] text-sm font-bold mb-3">Admissions 2026 — 27</p>
                    <h1 className="font-outfit font-black text-5xl lg:text-7xl max-w-3xl">Begin your <span className="text-secondary">Cauvery</span> journey.</h1>
                </div>
            </section>

            <section className="section">
                <div className="container-x grid lg:grid-cols-12 gap-12">
                    <aside className="lg:col-span-4 space-y-6">
                        <div className="bg-white rounded-2xl p-7 border border-border">
                            <FileText className="w-8 h-8 text-secondary mb-4" />
                            <h3 className="font-outfit font-bold text-xl text-primary mb-3">Admission Process</h3>
                            <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                                <li>Submit the online application form below</li>
                                <li>Visit campus / video call for counselling</li>
                                <li>Verification of original 10th & 12th marksheets</li>
                                <li>Pay first-instalment fee to confirm seat</li>
                                <li>Receive admission letter & ID card</li>
                            </ol>
                        </div>
                        <div className="bg-white rounded-2xl p-7 border border-border">
                            <h3 className="font-outfit font-bold text-xl text-primary mb-3">Documents Required</h3>
                            <ul className="text-sm text-muted-foreground space-y-2">
                                <li>• 10th & 12th (PUC) marksheets</li>
                                <li>• Transfer Certificate (TC)</li>
                                <li>• Migration Certificate (if applicable)</li>
                                <li>• Aadhaar / ID proof</li>
                                <li>• 6 passport-size photos</li>
                                <li>• Caste / Income certificate (if applicable)</li>
                            </ul>
                        </div>
                        <div className="bg-primary text-white rounded-2xl p-7">
                            <h3 className="font-outfit font-bold text-xl mb-4">Annual Tuition Fees</h3>
                            <ul className="space-y-2 text-sm text-white/85">
                                {courses.map(c => (
                                    <li key={c.code} className="flex justify-between border-b border-white/10 pb-2">
                                        <span>{c.code}</span>
                                        <span className="font-bold text-secondary">₹ {c.fees.toLocaleString()}</span>
                                    </li>
                                ))}
                            </ul>
                            <p className="text-xs text-white/60 mt-4">* Scholarships available for SC/ST/OBC, sports & meritorious students. Hostel & exam fees additional.</p>
                        </div>
                    </aside>

                    <div className="lg:col-span-8">
                        <div className="bg-white rounded-2xl border border-border p-8 lg:p-10">
                            <h2 className="font-outfit font-black text-3xl text-primary mb-2">Application form</h2>
                            <p className="text-muted-foreground mb-8">Fill in your details — it takes 2 minutes.</p>

                            {error && <div className="mb-6 p-4 rounded-xl bg-destructive/10 text-destructive text-sm" data-testid="admission-error">{error}</div>}

                            <form onSubmit={submit} className="grid md:grid-cols-2 gap-5">
                                <Field label="Full name" required value={form.full_name} onChange={update("full_name")} testId="adm-name" />
                                <Field label="Email" type="email" required value={form.email} onChange={update("email")} testId="adm-email" />
                                <Field label="Phone" required value={form.phone} onChange={update("phone")} testId="adm-phone" />
                                <Field label="Date of birth" type="date" required value={form.dob} onChange={update("dob")} testId="adm-dob" />
                                <Select label="Gender" value={form.gender} onChange={update("gender")} options={["Male", "Female", "Other"]} testId="adm-gender" />
                                <Select label="Course" value={form.course_code} onChange={update("course_code")} options={courses.map(c => c.code)} testId="adm-course" />
                                <Field label="Qualification (12th board)" required value={form.qualification} onChange={update("qualification")} testId="adm-qual" />
                                <Field label="Aggregate marks (%)" type="number" required value={form.marks} onChange={update("marks")} testId="adm-marks" />
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-foreground mb-2">Address</label>
                                    <textarea required value={form.address} onChange={update("address")} rows={3}
                                        className="w-full px-4 py-3 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                                        data-testid="adm-address" />
                                </div>
                                <button type="submit" disabled={submitting}
                                    className="md:col-span-2 btn-gold py-4 rounded-full inline-flex items-center justify-center gap-2 disabled:opacity-50"
                                    data-testid="admission-submit">
                                    {submitting ? "Submitting..." : <>Submit application <ArrowRight className="w-4 h-4" /></>}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

function Field({ label, testId, ...rest }) {
    return (
        <div>
            <label className="block text-sm font-medium text-foreground mb-2">{label}{rest.required && <span className="text-destructive ml-1">*</span>}</label>
            <input {...rest} data-testid={testId}
                className="w-full px-4 py-3 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition" />
        </div>
    );
}

function Select({ label, options, testId, ...rest }) {
    return (
        <div>
            <label className="block text-sm font-medium text-foreground mb-2">{label}</label>
            <select {...rest} data-testid={testId}
                className="w-full px-4 py-3 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition bg-white">
                {options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
        </div>
    );
}
