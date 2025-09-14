import "./globals.css";

export const metadata = { title: "Demo | Delaunay-like" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-black text-white antialiased">{children}</body>
    </html>
  );
}
