// src/app/components/MenuButton.tsx
"use client";

import { motion } from "framer-motion";

export default function MenuButton({
    open,
    toggle,
}: { open: boolean; toggle: () => void }) {
    return (
        <button
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={toggle}
            className="relative z-[60] flex h-10 w-10 flex-col items-center justify-center"
        >
            {/* 上のバー */}
            <motion.span
                className="block h-0.5 w-8 rounded bg-white"
                animate={open ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.25 }}
            />
            {/* 下のバー */}
            <motion.span
                className="mt-2 block h-0.5 w-8 rounded bg-white"
                animate={open ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.25 }}
            />
        </button>
    );
}
