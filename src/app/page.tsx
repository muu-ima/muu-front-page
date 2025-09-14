// src/app/page.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import MenuButton from "./components/MenuButton";
import MobileMenu from "./components/MobileMenu";

const SpaceHero = dynamic(() => import("./components/SpaceHero"), { ssr: false });


export default function Home() {
  // マウント判定（SSR→CSRの一瞬は描画しない）
  const [mounted, setMounted] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);

  // 初回セッション時のみローダー制御
  const [booting, setBooting] = useState(true);
  const [heroReady, setHeroReady] = useState(false);
  const [minTimerDone, setMinTimerDone] = useState(false);

  const MIN_VISIBLE_MS = 400;
  const SAFETY_MS = 4000; // ← セーフティ（onReadyが来なくても閉じる）
  const minTimerRef = useRef<number | null>(null);
  const safetyRef = useRef<number | null>(null);

  useEffect(() => {
    // クライアントでのみ実行
    const visited = sessionStorage.getItem("visited");
    if (visited) {
      setBooting(false); // 2回目以降：ローダー出さない
    } else {
      sessionStorage.setItem("visited", "true");
      // 最低表示時間
      minTimerRef.current = window.setTimeout(() => setMinTimerDone(true), MIN_VISIBLE_MS);
      // セーフティ
      safetyRef.current = window.setTimeout(() => setHeroReady(true), SAFETY_MS);
    }
    setMounted(true);

    return () => {
      if (minTimerRef.current) clearTimeout(minTimerRef.current);
      if (safetyRef.current) clearTimeout(safetyRef.current);
    };
  }, []);

  // 初回のみ、SpaceHero準備 & 最低表示の両方が揃ったらローダー解除
  useEffect(() => {
    if (heroReady && minTimerDone) setBooting(false);
  }, [heroReady, minTimerDone]);

  // ─────────────────────────────────────────────
  // 0) マウント前は何も描かない（= チカつき回避）
  if (!mounted) {
    return <main className="min-h-screen bg-black text-white" />;
  }

  // 1) 初回セッション中はローダーのみを描画
  if (booting) {
    return (
      <main className="relative isolate bg-black text-white">
        <AnimatePresence initial={false}>
          <motion.div
            key="page-loader"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.45 } }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black"
          >
            <div className="text-center">
              <div className="text-white/90 text-2xl font-semibold tracking-tight">muu.studio</div>
              <div className="mt-6 h-1 w-64 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-1/3 bg-white animate-[marquee_1.2s_linear_infinite]" />
              </div>
              <div className="mt-3 text-sm text-white/60">Initializing…</div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* キーフレーム（ローダーバー） */}
        <style jsx global>{`
          @keyframes marquee { 0% { transform: translateX(-100%); } 100% { transform: translateX(300%); } }
        `}</style>

        {/* ← 重要：不可視で SpaceHero をマウントして onReady を受け取る */}
        <div aria-hidden style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}>
          <SpaceHero
            onReady={() => setHeroReady(true)}
            particleCount={2600}
          >
            <div />
          </SpaceHero>
        </div>
      </main>
    );
  }

  // 2) 本体（2回目以降は最初からこちら）
  return (
    <main className="relative isolate bg-black text-white">
      {/* Header：常時ハンバーガー */}
      <header className="sticky top-0 z-[90] border-b border-white/10 bg-black/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="font-semibold">muu.studio</div>

          {/* 右側は常時ハンバーガー（PCでも） */}
          <MenuButton open={menuOpen} toggle={() => setMenuOpen((v) => !v)} />
        </div>
      </header>

      {/* フルスクリーンメニュー */}
      <MobileMenu open={menuOpen} close={() => setMenuOpen(false)} />

      {/* Hero */}
      <section className="relative mx-auto max-w-7xl px-4 py-16 sm:py-24">
        <div className="will-change-transform">
          <SpaceHero
            onReady={() => { /* 2回目以降は特に何もしない */ }}
            particleCount={2600}
          >
            <div className="pointer-events-none text-center relative z-10">
              <motion.h1
                initial={false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-5xl font-bold tracking-tight sm:text-7xl"
              >
                Fully automated<br />The ultimate machine
              </motion.h1>
              <p className="mt-4 text-white/70">
                Sustainable, cost-efficient and scalable — ready for the future.
              </p>
            </div>
          </SpaceHero>
        </div>
      </section>

      {/* 3カラム訴求 */}
      <section id="product" className="mx-auto max-w-7xl px-4 py-20">
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            {
              title: "Shopify Calculator",
              desc: "Shopify用の損益分岐点を簡単に計算できます。",
              href: "https://enyukari.capoo.jp/profit-calc/shopify-be/"
            },
            {
              title: "BreakEvenUS Calculator",
              desc: "US向け損益分岐点を簡単に計算できます。",
              href: "https://enyukari.capoo.jp/profit-calc/be-us/"
            },
            {
              title: "ProfitMarginUS Calculator",
              desc: "利益率やコスト入力により、簡単に売値を出せます。",
              href: "https://enyukari.capoo.jp/profit-calc/reverse/"
            },
          ].map((b, i) => (
            <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/[0.07]">
              <h3 className="text-xl font-semibold">{b.title}</h3>
              <p className="mt-2 text-white/70">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-10 text-center text-white/50">
        © {new Date().getFullYear()} muu.studio
      </footer>
    </main>
  );
}
