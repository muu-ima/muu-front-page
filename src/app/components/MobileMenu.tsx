// src/app/components/MobileMenu.tsx
"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";

export default function MobileMenu({
    open,
    close,
}: { open: boolean; close: () => void }) {
    // ESCで閉じる & スクロールロック
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
        document.addEventListener("keydown", onKey);
        document.documentElement.style.overflow = open ? "hidden" : "";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.documentElement.style.overflow = "";
        };
    }, [open, close]);

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 backdrop-blur"
                    onClick={close} // 背景クリックで閉じる
                >
                    <nav className="text-center">
                        <ul className="space-y-8">
                            {[
                                { href: "#product", label: "Shopify(BE)" },
                                { href: "#about", label: "CalcUS(BE)" },
                                { href: "#contact", label: "CalcUS" },
                                { href: "#calc", label: "CalcUS(Reverse)" },
                                { href: "#reservation", label: "Resevation" },
                            ].map((item) => (
                                <li key={item.href}>
                                    <a
                                        href={item.href}
                                        onClick={close}
                                        className="text-3xl sm:text-5xl font-semibold text-white hover:text-white/70 transition"
                                    >
                                        {item.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
