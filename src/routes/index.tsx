import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, ChefHat, LayoutDashboard, QrCode, Sparkles } from "lucide-react";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AURALIS — The Restaurant Operating System" },
      { name: "description", content: "Cinematic QR ordering, live kitchen displays, and enterprise analytics for the world's finest restaurants." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <header className="fixed inset-x-0 top-0 z-40 border-b hairline glass-strong">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Logo />
          <nav className="hidden items-center gap-8 text-sm md:flex">
            <a href="#experience" className="text-muted-foreground hover:text-gold">Experience</a>
            <Link to="/reserve" className="text-muted-foreground hover:text-gold">Reserve</Link>
          </nav>
          <Link to="/login" className="inline-flex items-center gap-2 rounded-full border hairline px-4 py-2 text-xs uppercase tracking-[0.2em] hover:bg-secondary">
            Staff Sign-In <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </header>

      <section className="relative isolate flex min-h-screen items-center px-6 pt-24">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.25_0.04_70_/_0.5),transparent_60%)]" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/40 to-background" />
        </div>

        <div className="mx-auto grid w-full max-w-7xl gap-16 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <div>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-2 rounded-full border hairline glass px-4 py-1.5 text-[11px] uppercase tracking-[0.3em] text-gold">
              <Sparkles className="h-3 w-3" /> The Restaurant OS
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.1 }}
              className="mt-6 font-display text-[clamp(3rem,8vw,7rem)] leading-[0.95] text-balance">
              Where every<br /><span className="gold-text italic">table</span> becomes<br />an experience.
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
              className="mt-8 max-w-xl text-base leading-relaxed text-muted-foreground">
              AURALIS is the operating system behind the world's most demanding kitchens —
              instant QR ordering, real-time kitchen orchestration, and an enterprise-grade
              admin built for the calm precision of fine dining.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.45 }}
              className="mt-10 flex flex-wrap items-center gap-3">
              <Link to="/reserve" className="inline-flex items-center gap-3 rounded-full bg-gold px-7 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-primary-foreground hover:bg-gold-soft">
                Reserve a Table <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/login" className="inline-flex items-center gap-2 rounded-full border hairline px-7 py-4 text-sm font-medium hover:bg-secondary">
                Staff
              </Link>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, delay: 0.4 }} className="hidden lg:block">
            <div className="space-y-3 rounded-3xl glass-strong p-6 gold-border">
              <div className="text-[10px] uppercase tracking-[0.3em] text-gold">Tonight at AURALIS</div>
              <div className="font-display text-3xl">Seven-course Omakase</div>
              <p className="text-sm text-muted-foreground">An evolving menu shaped by tonight's market and the chef's intuition. Reserved for thirty guests.</p>
              <div className="grid grid-cols-3 gap-3 pt-3 text-center">
                {[["18+", "Courses"], ["96%", "Returning"], ["★ 1", "Michelin"]].map(([n, l]) => (
                  <div key={l} className="rounded-2xl border hairline bg-background/40 px-3 py-3">
                    <div className="font-display text-xl gold-text">{n}</div>
                    <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="experience" className="relative px-6 py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 max-w-2xl">
            <div className="text-[11px] uppercase tracking-[0.3em] text-gold">The Experience</div>
            <h2 className="mt-3 font-display text-5xl">An ecosystem, end to end.</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              { icon: QrCode, title: "Smart QR Tables", body: "Each table has its own QR. One scan opens the menu — table identity flows automatically into every order." },
              { icon: ChefHat, title: "Live Kitchen Display", body: "Tickets land instantly with timers, table context, and status pipeline tuned for tablet-mounted kitchens." },
              { icon: LayoutDashboard, title: "Enterprise Admin", body: "Menu, orders, tables, reservations, and revenue analytics in one cohesive command center." },
            ].map((p) => (
              <div key={p.title} className="rounded-3xl glass p-8 hover:gold-glow transition-shadow">
                <p.icon className="h-8 w-8 text-gold" />
                <h3 className="mt-6 font-display text-2xl">{p.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t hairline px-6 py-10 text-center text-xs text-muted-foreground">
        <Logo className="justify-center" />
        <p className="mt-4">© {new Date().getFullYear()} AURALIS Hospitality Systems. Crafted for fine dining.</p>
      </footer>
    </div>
  );
}
