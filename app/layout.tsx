import type { Metadata } from "next";
import { Josefin_Sans } from "next/font/google";
import Link from "next/link";
import { baseUrl } from "@/lib/base-url";
import "./globals.css";

const josefin = Josefin_Sans({
  variable: "--font-josefin",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl()),
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
    <html lang="de-CH" className={`${josefin.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-cream font-sans text-ink">
        <header className="sticky top-0 z-20 border-b border-sand bg-cream/95 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
            <Link
              href="/"
              className="text-lg font-semibold uppercase tracking-[0.25em] text-ink"
            >
              Smile<sup>2</sup>
            </Link>
            <nav className="flex items-center gap-7 text-sm tracking-wide">
              <Link href="/#ueber-uns" className="hidden text-ink-soft transition hover:text-ink sm:block">
                Über uns
              </Link>
              <Link href="/#kontakt" className="hidden text-ink-soft transition hover:text-ink sm:block">
                Kontakt
              </Link>
              <Link
                href="/buchen"
                className="rounded-[3px] bg-brand px-5 py-2.5 font-medium tracking-wide text-white transition hover:bg-brand-dark"
              >
                Termin buchen
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-sand bg-sand">
          <div className="mx-auto grid max-w-5xl gap-8 px-4 py-12 text-sm text-ink-soft sm:grid-cols-3">
            <div>
              <p className="font-semibold uppercase tracking-[0.2em] text-ink">
                Smile<sup>2</sup>
              </p>
              <p className="mt-3 leading-relaxed">
                Feldlistrasse 17
                <br />
                9000 St. Gallen
              </p>
              <p className="mt-3 leading-relaxed">
                <a href="tel:+41765677693" className="transition hover:text-ink">
                  076 567 76 93
                </a>
                <br />
                <a href="mailto:smilehochzwei@gmail.com" className="transition hover:text-ink">
                  smilehochzwei@gmail.com
                </a>
              </p>
            </div>
            <div>
              <p className="font-semibold uppercase tracking-[0.2em] text-ink">Öffnungszeiten</p>
              <p className="mt-3 leading-relaxed">
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
              <p className="font-semibold uppercase tracking-[0.2em] text-ink">Rechtliches</p>
              <p className="mt-3 flex flex-col gap-1.5">
                <Link href="/impressum" className="transition hover:text-ink">
                  Impressum
                </Link>
                <Link href="/datenschutz" className="transition hover:text-ink">
                  Datenschutz
                </Link>
              </p>
              <p className="mt-5 text-xs text-ink-soft/70">
                © {new Date().getFullYear()} Smilehochzwei™
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
