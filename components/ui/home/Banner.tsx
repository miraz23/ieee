"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

interface BinaryBit {
  x: number;
  y: number;
  vx: number;
  vy: number;
  char: string;
  opacity: number;
  size: number;
  flipTimer: number;
  flipInterval: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const PARTICLE_COLOR = "rgba(249, 163, 26,";
const LINK_COLOR = "rgba(249, 163, 26,";
const BG_COLOR = "#0d1117";

const MOBILE_CANVAS_MAX = 640;

type ParticleConfig = {
  count: number;
  linkDistance: number;
  linkOpacityMax: number;
  mouseLinkOpacityMax: number;
  mouseLinkMaxDist: number;
  linkLineWidth: number;
  dotOpacity: number;
  radiusMin: number;
  radiusMax: number;
  speed: number;
  repulseRadius: number;
  bitCount: number;
};

function getParticleConfig(width: number): ParticleConfig {
  const narrow = width > 0 && width < MOBILE_CANVAS_MAX;
  if (narrow) {
    return {
      count: 46,
      linkDistance: 116,
      linkOpacityMax: 0.3,
      mouseLinkOpacityMax: 0.62,
      mouseLinkMaxDist: 148,
      linkLineWidth: 0.62,
      dotOpacity: 0.62,
      radiusMin: 1,
      radiusMax: 2.2,
      speed: 0.45,
      repulseRadius: 90,
      bitCount: 50,
    };
  }
  return {
    count: 80,
    linkDistance: 150,
    linkOpacityMax: 0.48,
    mouseLinkOpacityMax: 0.78,
    mouseLinkMaxDist: 180,
    linkLineWidth: 0.8,
    dotOpacity: 0.75,
    radiusMin: 1.5,
    radiusMax: 3,
    speed: 0.8,
    repulseRadius: 120,
    bitCount: 90,
  };
}

// ─── Hook: canvas particle animation ─────────────────────────────────────────
function useParticleCanvas(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let mouseX = -9999;
    let mouseY = -9999;

    let cfg: ParticleConfig = getParticleConfig(0);
    let particles: Particle[] = [];
    let bits: BinaryBit[] = [];

    const seedParticles = () => {
      cfg = getParticleConfig(canvas.width);

      // Particles
      particles = Array.from({ length: cfg.count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * cfg.speed * 2,
        vy: (Math.random() - 0.5) * cfg.speed * 2,
        radius: Math.random() * (cfg.radiusMax - cfg.radiusMin) + cfg.radiusMin,
      }));

      // Scattered binary bits
      bits = Array.from({ length: cfg.bitCount }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        char: Math.random() > 0.5 ? "1" : "0",
        opacity: Math.random() * 0.22 + 0.07,
        size: Math.floor(Math.random() * 5 + 10),
        flipTimer: 0,
        flipInterval: Math.floor(Math.random() * 300 + 120),
      }));
    };

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.offsetWidth;
      canvas.height = parent.offsetHeight;
      seedParticles();
    };

    resize();
    window.addEventListener("resize", resize);

    // Mouse tracking
    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };
    const onMouseLeave = () => { mouseX = -9999; mouseY = -9999; };
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseleave", onMouseLeave);

    // Click: push particles away
    const onClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      particles.forEach((p) => {
        const dx = p.x - cx;
        const dy = p.y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < cfg.repulseRadius) {
          p.vx += (dx / dist) * 2;
          p.vy += (dy / dist) * 2;
        }
      });
    };
    canvas.addEventListener("click", onClick);

    // Draw loop
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // ── Scattered binary bits (drawn first, behind everything) ──
      bits.forEach((b) => {
        b.x += b.vx;
        b.y += b.vy;

        // Wrap around edges
        if (b.x < -20) b.x = canvas.width + 20;
        if (b.x > canvas.width + 20) b.x = -20;
        if (b.y < -20) b.y = canvas.height + 20;
        if (b.y > canvas.height + 20) b.y = -20;

        // Occasionally flip between 0 and 1
        b.flipTimer++;
        if (b.flipTimer >= b.flipInterval) {
          b.flipTimer = 0;
          b.char = b.char === "1" ? "0" : "1";
          b.flipInterval = Math.floor(Math.random() * 300 + 120);
        }

        ctx.font = `${b.size}px monospace`;
        ctx.fillStyle = `${PARTICLE_COLOR}${b.opacity})`;
        ctx.fillText(b.char, b.x, b.y);
      });

      // ── Update & bounce particles ──
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        // Clamp speed after mouse interaction
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > cfg.speed * 20) {
          p.vx = (p.vx / speed) * cfg.speed * 50;
          p.vy = (p.vy / speed) * cfg.speed * 50;
        }
      });

      // ── Draw links ──
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < cfg.linkDistance) {
            const opacity = (1 - dist / cfg.linkDistance) * cfg.linkOpacityMax;
            ctx.beginPath();
            ctx.strokeStyle = `${LINK_COLOR}${opacity})`;
            ctx.lineWidth = cfg.linkLineWidth;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }

        // Mouse grab links
        const mdx = particles[i].x - mouseX;
        const mdy = particles[i].y - mouseY;
        const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mDist < cfg.mouseLinkMaxDist) {
          const opacity =
            (1 - mDist / cfg.mouseLinkMaxDist) * cfg.mouseLinkOpacityMax;
          ctx.beginPath();
          ctx.strokeStyle = `${LINK_COLOR}${opacity})`;
          ctx.lineWidth = cfg.linkLineWidth;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(mouseX, mouseY);
          ctx.stroke();
        }
      }

      // ── Draw dots ──
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${PARTICLE_COLOR}${cfg.dotOpacity})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseleave", onMouseLeave);
      canvas.removeEventListener("click", onClick);
    };
  }, [canvasRef]);
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function Banner() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useParticleCanvas(canvasRef);

  return (
    <section
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden"
      style={{ backgroundColor: BG_COLOR }}
    >
      {/* Particle canvas */}
      <div
        className="absolute inset-0 opacity-100 max-sm:opacity-[0.92]"
        aria-hidden
      >
        <canvas ref={canvasRef} className="h-full w-full" />
      </div>

      {/* Calm the busy network behind copy on narrow viewports */}
      <div
        className="pointer-events-none absolute inset-0 z-1 bg-[radial-gradient(ellipse_95%_80%_at_50%_45%,rgba(13,17,23,0.56)_0%,rgba(13,17,23,0.12)_50%,transparent_75%)] sm:hidden"
        aria-hidden
      />

      {/* Hero content */}
      <div className="relative z-10 mx-auto max-w-3xl px-5 py-24 text-center sm:px-6 sm:py-20">
        <h1
          className="mb-4 mt-2 text-3xl font-bold leading-snug tracking-wide text-white sm:mb-0 sm:mt-0 sm:text-4xl sm:leading-tight md:text-5xl"
        >
          IEEE COMPUTER SOCIETY
        </h1>

        <p
          className="mb-6 text-2xl font-bold leading-snug tracking-wide text-[#f9a31a] sm:mb-5 sm:text-3xl md:text-4xl"
        >
          IIUC Student Branch Chapter
        </p>

        <p className="mb-10 mx-auto max-w-xl text-sm leading-relaxed text-neutral-300 sm:mb-9 sm:max-w-none sm:text-base sm:text-neutral-400">
          Innovating the future through code, community, and collaboration by empowering the next generation of computing professionals with the technical mastery and leadership skills needed to drive the global digital revolution.
        </p>

        {/* CTA Button */}
        <Link
          href="#"
          className="inline-flex items-center gap-2 rounded-full bg-[#f9a31a] px-8 py-3 text-base font-semibold text-white transition-transform hover:scale-105 active:scale-95"
        >
          Explore
          <ArrowRight size={18} strokeWidth={2.25} aria-hidden />
        </Link>
      </div>
    </section>
  );
}
