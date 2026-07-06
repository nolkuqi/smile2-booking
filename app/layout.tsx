import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"),
  title: {
    default: "Smile² – Professionelle Zahnaufhellung in St. Gallen",
    template: "%s | Smile²",
  },
  description:
    "Smile² steht für ästhetische Zahnaufhellung auf höchstem Niveau – schonend, individuell und mit Termin-Onlinebuchung. Feldlistrasse 17, St. Gallen.",
  robots: { index: true, follow: true },
  openGraph: {
    title: "Smile² – Professionelle Zahnaufhellung in St. Gallen",
    description:
      "Schonende, kosmetische Zahnaufhellung mit persönlicher Beratung. Termin online buchen – in 2 Minuten.",
    url: "/",
    siteName: "Smile²",
    locale: "de_CH",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de-CH" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-slate-800">
        <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <Link href="/" className="text-xl font-semibold tracking-tight text-teal-700">
              Smile<sup>2</sup>
            </Link>
            <nav className="flex items-center gap-6 text-sm">
              <Link href="/#ueber-uns" className="hidden text-slate-600 hover:text-teal-700 sm:block">
                Über uns
              </Link>
              <Link href="/#kontakt" className="hidden text-slate-600 hover:text-teal-700 sm:block">
                Kontakt
              </Link>
              <Link
                href="/buchen"
                className="rounded-full bg-teal-600 px-4 py-2 font-medium text-white transition hover:bg-teal-700"
              >
                Termin buchen
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-slate-100 bg-slate-50">
          <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 text-sm text-slate-600 sm:grid-cols-3">
            <div>
              <p className="font-semibold text-slate-800">
                Smile<sup>2</sup>
              </p>
              <p className="mt-2">
                Feldlistrasse 17
                <br />
                9000 St. Gallen
              </p>
              <p className="mt-2">
                <a href="tel:+41765677693" className="hover:text-teal-700">
                  076 567 76 93
                </a>
                <br />
                <a href="mailto:smilehochzwei@gmail.com" className="hover:text-teal-700">
                  smilehochzwei@gmail.com
                </a>
              </p>
            </div>
            <div>
              <p className="font-semibold text-slate-800">Öffnungszeiten</p>
              <p className="mt-2">
                Mo, Fr: 09–13 / 14–18 Uhr
                <br />
                Do: 09–13 / 14–19 Uhr
                <br />
                Sa: 10–14 Uhr
                <br />
                Di, Mi, So: geschlossen
              </p>
            </div>
            <div>
              <p className="font-semibold text-slate-800">Rechtliches</p>
              <p className="mt-2 flex flex-col gap-1">
                <Link href="/impressum" className="hover:text-teal-700">
                  Impressum
                </Link>
                <Link href="/datenschutz" className="hover:text-teal-700">
                  Datenschutz
                </Link>
              </p>
              <p className="mt-4 text-xs text-slate-400">
                © {new Date().getFullYear()} Smilehochzwei™
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
