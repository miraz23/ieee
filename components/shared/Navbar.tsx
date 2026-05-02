"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

// ─── Types ────────────────────────────────────────────────────────────────────
interface NavChild {
    label: string;
    href: string;
}

interface NavItem {
    label: string;
    href?: string;
    children?: NavChild[];
}

// ─── Nav Data ─────────────────────────────────────────────────────────────────
const NAV_ITEMS: NavItem[] = [
    { label: "Home", href: "/" },
    {
        label: "About",
        children: [
            { label: "About IEEE", href: "/about/ieee" },
            { label: "About CUET SB", href: "/about/cuet" },
            { label: "Executive Committee", href: "/about/committee" },
        ],
    },
    {
        label: "Societies & Chapters",
        children: [
            { label: "Computer Society", href: "/societies/cs" },
            { label: "Robotics & Automation", href: "/societies/ras" },
            { label: "Power & Energy", href: "/societies/pes" },
            { label: "Women in Engineering", href: "/societies/wie" },
        ],
    },
    { label: "Events", href: "/events" },
    { label: "Achievements", href: "/achievements" },
    { label: "Web Management Team", href: "/web-team" },
    { label: "Contact", href: "/contact" },
];

const ACCENT = "#f26522";
const BG = "#0d1117";

// ─── Dropdown Menu ────────────────────────────────────────────────────────────
function DropdownMenu({ items }: { items: NavChild[] }) {
    return (
        <div
            className="absolute top-full left-1/2 z-50 mt-3 min-w-[200px] -translate-x-1/2 overflow-hidden rounded-xl border py-1 shadow-2xl"
            style={{
                background: "rgba(13,17,23,0.97)",
                borderColor: "rgba(242,101,34,0.18)",
                backdropFilter: "blur(12px)",
            }}
        >
            {/* top accent line */}
            <div className="h-px w-full" style={{ background: ACCENT, opacity: 0.6 }} />
            {items.map((child) => (
                <Link
                    key={child.href}
                    href={child.href}
                    className="block px-5 py-2.5 text-sm font-medium text-neutral-300 transition-colors duration-150 hover:text-white"
                    style={{ fontFamily: "'Rajdhani', sans-serif", letterSpacing: "0.03em" }}
                    onMouseEnter={(e) => {
                        (e.currentTarget as HTMLAnchorElement).style.background =
                            "rgba(242,101,34,0.10)";
                    }}
                    onMouseLeave={(e) => {
                        (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                    }}
                >
                    {child.label}
                </Link>
            ))}
        </div>
    );
}

// ─── Nav Link ─────────────────────────────────────────────────────────────────
function NavLink({ item }: { item: NavItem }) {
    const [open, setOpen] = useState(false);
    const hasChildren = Boolean(item.children?.length);

    return (
        <div
            className="relative"
            onMouseEnter={() => hasChildren && setOpen(true)}
            onMouseLeave={() => hasChildren && setOpen(false)}
        >
            {hasChildren ? (
                <button
                    type="button"
                    className={cn(
                        "flex items-center gap-1 whitespace-nowrap text-sm font-semibold text-neutral-300 transition-colors duration-150 hover:text-white"
                    )}
                    style={{ fontFamily: "'Rajdhani', sans-serif", letterSpacing: "0.04em" }}
                    aria-expanded={open}
                    onClick={() => setOpen((v) => !v)}
                >
                    {item.label}
                    <ChevronDown
                        size={14}
                        className="transition-transform duration-200"
                        style={{
                            color: ACCENT,
                            transform: open ? "rotate(180deg)" : "rotate(0deg)",
                        }}
                    />
                </button>
            ) : (
                <Link
                    href={item.href ?? "#"}
                    className="whitespace-nowrap text-sm font-semibold text-neutral-300 transition-colors duration-150 hover:text-white"
                    style={{ fontFamily: "'Rajdhani', sans-serif", letterSpacing: "0.04em" }}
                >
                    {item.label}
                </Link>
            )}

            {hasChildren && open && <DropdownMenu items={item.children!} />}
        </div>
    );
}

// ─── Mobile Menu ──────────────────────────────────────────────────────────────
function MobileMenu({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-100 flex flex-col overflow-y-auto"
            style={{ background: BG }}
        >
            {/* header row */}
            <div className="flex items-center justify-between px-5 py-4">
                <IEEELogo />
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg p-2 text-neutral-400 hover:text-white"
                    aria-label="Close menu"
                >
                    <X size={22} />
                </button>
            </div>

            <div className="h-px w-full" style={{ background: "rgba(242,101,34,0.25)" }} />

            <nav className="flex flex-col gap-1 px-4 py-4">
                {NAV_ITEMS.map((item, idx) => (
                    <div key={item.label}>
                        {item.children ? (
                            <>
                                <button
                                    type="button"
                                    className="flex w-full items-center justify-between px-3 py-3 text-left text-base font-semibold text-neutral-200 hover:text-white"
                                    style={{ fontFamily: "'Rajdhani', sans-serif" }}
                                    onClick={() =>
                                        setExpandedIdx(expandedIdx === idx ? null : idx)
                                    }
                                >
                                    {item.label}
                                    <ChevronDown
                                        size={16}
                                        style={{
                                            color: ACCENT,
                                            transform:
                                                expandedIdx === idx ? "rotate(180deg)" : "rotate(0deg)",
                                            transition: "transform 0.2s",
                                        }}
                                    />
                                </button>
                                {expandedIdx === idx && (
                                    <div className="ml-4 flex flex-col gap-0.5 border-l pl-3" style={{ borderColor: "rgba(242,101,34,0.3)" }}>
                                        {item.children.map((child) => (
                                            <Link
                                                key={child.href}
                                                href={child.href}
                                                onClick={onClose}
                                                className="py-2.5 text-sm font-medium text-neutral-400 hover:text-white"
                                                style={{ fontFamily: "'Rajdhani', sans-serif" }}
                                            >
                                                {child.label}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            <Link
                                href={item.href ?? "#"}
                                onClick={onClose}
                                className="block px-3 py-3 text-base font-semibold text-neutral-200 hover:text-white"
                                style={{ fontFamily: "'Rajdhani', sans-serif" }}
                            >
                                {item.label}
                            </Link>
                        )}
                    </div>
                ))}
            </nav>

            <div className="mt-auto px-5 pb-8 pt-4">
                <Link
                    href="https://ieee.org"
                    onClick={onClose}
                    className="block w-full rounded-full py-3 text-center text-sm font-bold text-white"
                    style={{ background: ACCENT, fontFamily: "'Rajdhani', sans-serif", letterSpacing: "0.05em" }}
                >
                    IEEE Portal
                </Link>
            </div>
        </div>
    );
}

// ─── Logo ─────────────────────────────────────────────────────────────────────
function IEEELogo() {
    return (
        <Link
            href="/"
            className="flex items-center gap-2"
            aria-label="IEEE CUET Home"
        >
            <Image
                src="/logos/ieee-logo-removebg.webp" // put your actual path
                alt="IEEE CUET Logo"
                width={120}
                height={60}
                priority
            />
        </Link>
    );
}

// ─── Main Navbar ──────────────────────────────────────────────────────────────
export default function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // prevent body scroll when mobile menu open
    useEffect(() => {
        document.body.style.overflow = mobileOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [mobileOpen]);

    return (
        <>
            <header
                className={cn(
                    "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
                    scrolled
                        ? "border-b shadow-lg"
                        : "border-b border-transparent"
                )}
                style={{
                    background: scrolled
                        ? "rgba(13,17,23,0.97)"
                        : "rgba(13,17,23,0.92)",
                    borderColor: scrolled ? "rgba(242,101,34,0.15)" : "transparent",
                    backdropFilter: "blur(14px)",
                }}
            >
                <nav className="relative mx-auto flex py-4 max-w-7xl items-center justify-between px-5">
                    {/* Logo */}
                    <IEEELogo />

                    {/* Desktop Nav Links */}
                    <ul className="hidden items-center gap-6 lg:flex xl:gap-8">
                        {NAV_ITEMS.map((item) => (
                            <li key={item.label}>
                                <NavLink item={item} />
                            </li>
                        ))}
                    </ul>

                    {/* IEEE Portal CTA */}
                    <div className="hidden items-center lg:flex">
                        <Link
                            href="https://ieee.org"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-full px-5 py-2 text-sm font-bold text-white transition-transform duration-150 hover:scale-105 active:scale-95"
                            style={{
                                background: ACCENT,
                                fontFamily: "'Rajdhani', sans-serif",
                                letterSpacing: "0.06em",
                                boxShadow: "0 0 20px rgba(242,101,34,0.4)",
                            }}
                        >
                            IEEE Portal
                        </Link>
                    </div>

                    {/* Mobile hamburger */}
                    <button
                        type="button"
                        className="flex items-center justify-center rounded-lg p-2 text-neutral-300 hover:text-white lg:hidden"
                        onClick={() => setMobileOpen(true)}
                        aria-label="Open menu"
                    >
                        <Menu size={22} />
                    </button>
                </nav>

                {/* Bottom accent line */}
                <div
                    className="h-px w-full"
                    style={{ background: "linear-gradient(90deg, transparent, rgba(242,101,34,0.4) 40%, rgba(242,101,34,0.4) 60%, transparent)" }}
                />
            </header>

            {/* Mobile Menu */}
            <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
        </>
    );
}