import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BarChart3, Bell, PiggyBank, Shield, Sparkles, Target, TrendingUp, Wallet, CheckCircle2, ChevronDown } from "lucide-react";
import { useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/common/SiteChrome";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ExpenseFlow — Personal finance, beautifully simple" },
      { name: "description", content: "Track expenses, set budgets, hit goals. A premium personal finance dashboard built for clarity." },
      { property: "og:title", content: "ExpenseFlow — Personal finance, beautifully simple" },
      { property: "og:description", content: "Track expenses, set budgets, hit goals. A premium personal finance dashboard built for clarity." },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: Wallet, title: "Unified accounts", desc: "Bring every transaction into one elegant timeline you'll actually want to read." },
  { icon: BarChart3, title: "Real-time analytics", desc: "Breakdowns, trends and projections rendered in milliseconds." },
  { icon: Target, title: "Smart budgets", desc: "Category budgets with proactive alerts before you overspend." },
  { icon: PiggyBank, title: "Savings goals", desc: "Track emergency funds, vacations and milestones with progress rings." },
  { icon: Bell, title: "Proactive alerts", desc: "Get notified the moment a budget tips or a goal hits a milestone." },
  { icon: Shield, title: "Bank-grade security", desc: "JWT auth, encrypted storage, and zero data sold. Ever." },
];

const steps = [
  { n: "01", title: "Create your account", desc: "Sign up in under 30 seconds. No credit card required." },
  { n: "02", title: "Add transactions", desc: "Log income and expenses, or import CSV from your bank." },
  { n: "03", title: "Set goals & relax", desc: "Define budgets and goals — we'll track the rest." },
];

const testimonials = [
  { name: "Sarah Chen", role: "Product Designer", quote: "Finally a finance app that feels designed, not assembled. The dashboard is genuinely beautiful." },
  { name: "Marcus Rivera", role: "Software Engineer", quote: "I tried YNAB, Mint, everything. ExpenseFlow is the first one I've actually stuck with for a year." },
  { name: "Priya Anand", role: "Freelance Writer", quote: "The budget alerts saved me twice last month. The goals tracker is weirdly motivating." },
];

const faqs = [
  { q: "Is my financial data secure?", a: "Yes. We use JWT authentication, encrypt data at rest and in transit, and never sell information to third parties." },
  { q: "Can I import from my bank?", a: "You can import CSV exports from any bank. Direct bank connections are on the roadmap." },
  { q: "Is there a free plan?", a: "Yes — full access to budgets, goals and analytics. Premium adds advanced reports and unlimited goals." },
  { q: "Does it work on mobile?", a: "ExpenseFlow is fully responsive. Native apps are coming soon." },
];

function Landing() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-20 pb-24 lg:pt-32 lg:pb-32">
          <div className="mx-auto max-w-3xl text-center animate-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-brand-purple" />
              New: smart budget alerts in real time
            </div>
            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Personal finance,<br />
              <span className="gradient-text">beautifully simple.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
              Track expenses, set budgets, and hit your savings goals — all in a premium dashboard that loves your eyes.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/register" className="inline-flex items-center gap-2 rounded-xl btn-primary px-6 py-3 text-sm font-semibold">
                Start for free <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#features" className="inline-flex items-center gap-2 rounded-xl glass px-6 py-3 text-sm font-semibold text-foreground hover:bg-white/5 transition-colors">
                See features
              </a>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-success" /> Free forever plan</span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-success" /> No credit card</span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-success" /> Cancel anytime</span>
            </div>
          </div>

          {/* Mock dashboard preview */}
          <div className="relative mx-auto mt-16 max-w-5xl animate-float-slow">
            <div className="absolute -inset-4 -z-10 rounded-3xl opacity-50 blur-3xl" style={{ background: "var(--gradient-primary)" }} />
            <div className="card-glass p-6 sm:p-8">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  { l: "Balance", v: "$12,480", c: "text-foreground" },
                  { l: "Income", v: "$8,200", c: "text-success" },
                  { l: "Expenses", v: "$3,720", c: "text-brand-rose" },
                  { l: "Savings", v: "$4,480", c: "text-brand-blue" },
                ].map((s) => (
                  <div key={s.l} className="rounded-xl bg-white/[0.03] p-4 border border-white/5">
                    <div className="text-xs text-muted-foreground">{s.l}</div>
                    <div className={`mt-1 text-xl font-bold ${s.c}`}>{s.v}</div>
                  </div>
                ))}
              </div>
              <div className="mt-6 grid gap-4 lg:grid-cols-3">
                <div className="lg:col-span-2 rounded-xl bg-white/[0.03] border border-white/5 p-5 h-48">
                  <div className="text-xs text-muted-foreground">Monthly overview</div>
                  <div className="mt-4 flex h-32 items-end gap-2">
                    {[40,55,30,70,45,80,60,90,52,75,68,85].map((h,i)=>(
                      <div key={i} className="flex-1 rounded-md" style={{ height: `${h}%`, background: "var(--gradient-primary)", opacity: 0.6 + (h/200) }} />
                    ))}
                  </div>
                </div>
                <div className="rounded-xl bg-white/[0.03] border border-white/5 p-5">
                  <div className="text-xs text-muted-foreground">Top categories</div>
                  <div className="mt-3 space-y-3 text-sm">
                    {[
                      { l: "Groceries", v: 68, c: "var(--brand-purple)" },
                      { l: "Transport", v: 45, c: "var(--brand-blue)" },
                      { l: "Dining", v: 82, c: "var(--brand-rose)" },
                    ].map((r)=>(
                      <div key={r.l}>
                        <div className="flex justify-between text-xs"><span>{r.l}</span><span className="text-muted-foreground">{r.v}%</span></div>
                        <div className="mt-1 h-2 rounded-full bg-white/5 overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${r.v}%`, background: r.c }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-4 sm:px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-sm font-medium text-brand-purple">Features</div>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-5xl">Everything you need. Nothing you don't.</h2>
          <p className="mt-4 text-muted-foreground">A focused toolkit for clarity, not clutter.</p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="card-glass p-6 transition-transform hover:-translate-y-1">
              <div className="grid h-11 w-11 place-items-center rounded-xl" style={{ background: "var(--gradient-primary)" }}>
                <f.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-7xl px-4 sm:px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-sm font-medium text-brand-blue">How it works</div>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-5xl">Set up in three minutes.</h2>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="card-glass p-6">
              <div className="text-4xl font-black gradient-text">{s.n}</div>
              <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="mx-auto max-w-7xl px-4 sm:px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-sm font-medium text-brand-rose">Loved by</div>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-5xl">Trusted by 10,000+ users</h2>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure key={t.name} className="card-glass p-6">
              <blockquote className="text-sm leading-relaxed text-foreground/90">"{t.quote}"</blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full font-semibold text-white" style={{ background: "var(--gradient-primary)" }}>
                  {t.name[0]}
                </div>
                <div>
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-4 sm:px-6 py-20">
        <div className="text-center">
          <div className="text-sm font-medium text-brand-purple">FAQ</div>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-5xl">Frequently asked</h2>
        </div>
        <div className="mt-10 space-y-3">
          {faqs.map((f, i) => <FaqItem key={i} q={f.q} a={f.a} />)}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-20">
        <div className="relative overflow-hidden card-glass p-10 sm:p-16 text-center">
          <div className="absolute inset-0 -z-10 opacity-40" style={{ background: "var(--gradient-hero)" }} />
          <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
            Take control of your money <span className="gradient-text">today.</span>
          </h2>
          <p className="mt-4 text-muted-foreground">Join thousands building a healthier financial life with ExpenseFlow.</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/register" className="inline-flex items-center gap-2 rounded-xl btn-primary px-6 py-3 text-sm font-semibold">
              Create free account <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/login" className="inline-flex items-center gap-2 rounded-xl glass px-6 py-3 text-sm font-semibold hover:bg-white/5 transition-colors">
              Sign in
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card-glass overflow-hidden">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between gap-4 p-5 text-left">
        <span className="font-medium">{q}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="px-5 pb-5 text-sm text-muted-foreground animate-fade-up">{a}</div>}
    </div>
  );
}
