"use client";
import { useState, useEffect } from "react";

const links = [
  { label: "Projects", href: "#projects" },
  { label: "Gaming", href: "#gaming" },
  { label: "Rocket League", href: "#rocketleague" },
  { label: "Golf", href: "#golf" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0a0a0f]/90 backdrop-blur-md border-b border-[#1e2433]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#top" className="font-mono text-sm font-bold tracking-widest text-neon neon-glow">
          GREENFIELD<span className="text-purple">BROS</span>
        </a>
        <div className="flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-muted hover:text-text transition-colors duration-200 tracking-wide"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#contact"
            className="text-xs font-mono px-4 py-1.5 border border-neon/40 text-neon rounded hover:bg-neon/10 transition-colors duration-200"
          >
            CONTACT
          </a>
        </div>
      </div>
    </nav>
  );
}
