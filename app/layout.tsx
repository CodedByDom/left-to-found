import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Left to Found",
  description: "A public photo project. Physical photographs placed in public spaces, left to be found.",
  openGraph: {
    title: "Left to Found",
    description: "Physical photographs placed in public spaces, left to be found.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="shell">
          <header className="site-header">
            <Link href="/" className="wordmark">
              Left to Found
            </Link>
            <div className="header-dot" />
          </header>

          <main className="content">{children}</main>

          <footer className="site-footer">
            <div className="footer-rule" />
          </footer>
        </div>
      </body>
    </html>
  );
}
