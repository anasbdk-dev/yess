import { Link } from "@tanstack/react-router";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`group inline-flex items-center gap-2.5 ${className}`}>
      <span className="grid h-9 w-9 place-items-center rounded-full border hairline bg-gradient-to-br from-gold/30 to-gold-deep/10 transition-transform group-hover:scale-105">
        <span className="font-display text-lg gold-text leading-none">A</span>
      </span>
      <span className="font-display text-xl tracking-[0.18em] text-foreground">AURALIS</span>
    </Link>
  );
}
