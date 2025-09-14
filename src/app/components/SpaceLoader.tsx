// src/app/components/SpaceLoader.tsx
"use client";
import { Html, useProgress } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";

export default function SpaceLoader() {
    const { progress, active } = useProgress(); // 0 → 100
    const pct = Math.round(progress);

    return (
        <Html fullscreen>
            <AnimatePresence>
                <motion.div
                    key="loader"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.4 } }}
                    className="flex h-full w-full items-center justify-center bg-black"
                >
                    <div className="text-center">
                        {/* ロゴ／タイトル的に */}
                        <div className="text-white/90 text-2xl font-semibold tracking-tight">muu.studio</div>

                        {/* プログレスバー */}
                        <div className="mt-6 h-1 w-64 overflow-hidden rounded-full bg-white/10">
                            <div
                                className="h-full bg-white"
                                style={{ width: `${pct}%`, transition: "width 200ms linear" }}
                            />
                        </div>
                        <div className="mt-3 text-sm text-white/60">{pct}%</div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </Html>
    );
}
