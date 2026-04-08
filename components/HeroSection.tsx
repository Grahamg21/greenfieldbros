"use client";
import { useEffect, useState } from "react";

const taglines = [
  "shipping code.",
  "playing games.",
  "hitting fairways.",
  "building things.",
  "breaking par.",
];

export default function HeroSection() {
  const [taglineIndex, setTaglineIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    const target = taglines[taglineIndex];
    if (typing) {
      if (displayed.length < target.length) {
        const t = setTimeout(() => setDisplayed(target.slice(0, displayed.length + 1)), 60);
        return () => clearTimeout(t);
      } else {
        const t = setTimeout(() => setTyping(false), 1800);
        return () => clearTimeout(t);
      }
    } else {
      if (displayed.length > 0) {
        const t = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 35);
        return () => clearTimeout(t);
      } else {
        setTaglineIndex((i) => (i + 1) % taglines.length);
        setTyping(true);
      }
    }
  }, [displayed, typing, taglineIndex]);

  return (
    <section
      id="top"
      className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden"
    >
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(#00ff9f 1px, transparent 1px), linear-gradient(90deg, #00ff9f 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Radial glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] rounded-full bg-neon/5 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Eyebrow */}
        <span className="section-label opacity-0 animate-fade-up" style={{ animationDelay: "0.1s", animationFillMode: "forwards" }}>
          Welcome to
        </span>

        {/* Main title */}
        <h1
          className="font-mono font-bold text-6xl md:text-8xl tracking-tight opacity-0 animate-fade-up"
          style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}
        >
          <span className="text-text">GREENFIELD</span>
          <br />
          <span className="text-neon neon-glow">BROS</span>
        </h1>

        {/* Typewriter tagline */}
        <p
          className="font-mono text-lg md:text-xl text-muted opacity-0 animate-fade-up"
          style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}
        >
          We are{" "}
          <span className="text-neon">
            {displayed}
            <span className="animate-blink">█</span>
          </span>
        </p>

        {/* Pills */}
        <div
          className="flex flex-wrap gap-3 justify-center mt-2 opacity-0 animate-fade-up"
          style={{ animationDelay: "0.6s", animationFillMode: "forwards" }}
        >
          {["AI & Automation", "Gaming", "Golf", "Open Source"].map((tag) => (
            <span
              key={tag}
              className="text-xs font-mono px-3 py-1 rounded-full border border-[#1e2433] text-muted bg-surface"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* CTA */}
        <div
          className="flex gap-4 mt-4 opacity-0 animate-fade-up"
          style={{ animationDelay: "0.8s", animationFillMode: "forwards" }}
        >
          <a
            href="#gaming"
            className="px-6 py-2.5 bg-neon text-bg font-mono text-sm font-bold rounded hover:bg-neon-dim transition-colors"
          >
            EXPLORE
          </a>
          <a
            href="#contact"
            className="px-6 py-2.5 border border-[#1e2433] text-muted font-mono text-sm rounded hover:border-neon/40 hover:text-text transition-colors"
          >
            GET IN TOUCH
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 flex flex-col items-center gap-2 text-muted animate-pulse-slow">
        <span className="text-xs font-mono tracking-widest">SCROLL</span>
        <div className="w-px h-8 bg-gradient-to-b from-muted to-transparent" />
      </div>
    </section>
  );
}
