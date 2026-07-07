import Link from "next/link";

const USPS = [
  {
    title: "Schonend & wirksam",
    text: "Kosmetische Zahnaufhellung, abgestimmt auf deine Zahnstruktur – gesund, schonend und schön.",
  },
  {
    title: "Persönliche Beratung",
    text: "Ehrlich, individuell und diskret. Zuerst wird alles kontrolliert, dann besprechen wir gemeinsam jeden Schritt.",
  },
  {
    title: "Erfahrung & Fachkompetenz",
    text: "11 Jahre Zahnmedizin, gelernte Prophylaxeassistentin mit gezielten Weiterbildungen in kosmetischer Zahnaufhellung.",
  },
];

function CtaButton({ children }: { children: React.ReactNode }) {
  return (
    <Link
      href="/buchen"
      className="inline-block rounded-[3px] bg-brand px-10 py-4 text-lg font-medium tracking-wide text-white transition hover:bg-brand-dark"
    >
      {children}
    </Link>
  );
}

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-sand via-sand to-cream">
        <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:py-32">
          <p className="text-sm uppercase tracking-[0.35em] text-ink-soft">
            Zahnbleaching-Studio St. Gallen
          </p>
          <h1 className="mt-6 text-4xl font-semibold tracking-wide text-ink sm:text-5xl">
            Willkommen bei Smile<sup>2</sup>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg font-light leading-relaxed text-ink-soft">
            Professionelle Zahnaufhellung – für ein strahlendes, selbstbewusstes Lächeln. Mit
            modernsten Methoden, viel Feingefühl und individueller Betreuung.
          </p>
          <div className="mt-10">
            <CtaButton>Jetzt Termin buchen</CtaButton>
          </div>
        </div>
      </section>

      {/* USPs */}
      <section id="ueber-uns" className="mx-auto max-w-5xl scroll-mt-24 px-4 py-20">
        <h2 className="text-center text-3xl font-semibold tracking-wide text-ink">
          Was Smile<sup>2</sup> auszeichnet
        </h2>
        <div className="mx-auto mt-3 h-px w-16 bg-brand" />
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {USPS.map((usp) => (
            <div key={usp.title} className="border border-sand bg-white p-7">
              <h3 className="font-semibold tracking-wide text-ink">{usp.title}</h3>
              <p className="mt-3 text-sm font-light leading-relaxed text-ink-soft">{usp.text}</p>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-12 max-w-2xl text-center font-light leading-relaxed text-ink-soft">
          Mein Name ist Dilara und ich bin seit 11 Jahren in der Zahnmedizin tätig. Mein Ziel ist
          es, dass du glücklich mit deinem Lächeln bist – ich begleite dich Schritt für Schritt zu
          einem Ergebnis, das gesund, schonend und schön ist.
        </p>
      </section>

      {/* Kooperation */}
      <section className="bg-sand">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <h2 className="text-2xl font-semibold tracking-wide text-ink">
            Kooperation mit Zahnarzt Dr. Mahlberg in Gossau
          </h2>
          <div className="mx-auto mt-3 h-px w-16 bg-brand" />
          <p className="mt-6 font-light leading-relaxed text-ink-soft">
            Smile<sup>2</sup> arbeitet eng mit der Praxis von Dr. Mahlberg zusammen, agiert dabei
            jedoch als eigenständiges Studio. Du profitierst von einem hochspezialisierten Angebot,
            ergänzt durch fachärztliche Unterstützung – effizient und unkompliziert.
          </p>
        </div>
      </section>

      {/* Kontakt & Öffnungszeiten */}
      <section id="kontakt" className="mx-auto max-w-5xl scroll-mt-24 px-4 py-20">
        <div className="grid gap-12 sm:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold tracking-wide text-ink">Kontakt</h2>
            <div className="mt-3 h-px w-16 bg-brand" />
            <p className="mt-6 font-light leading-loose text-ink-soft">
              📍 Feldlistrasse 17, 9000 St. Gallen
              <br />
              📞{" "}
              <a href="tel:+41765677693" className="transition hover:text-ink">
                076 567 76 93
              </a>
              <br />
              ✉️{" "}
              <a href="mailto:smilehochzwei@gmail.com" className="transition hover:text-ink">
                smilehochzwei@gmail.com
              </a>
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-wide text-ink">Öffnungszeiten</h2>
            <div className="mt-3 h-px w-16 bg-brand" />
            <table className="mt-6 font-light leading-loose text-ink-soft">
              <tbody>
                <tr>
                  <td className="pr-8 font-normal text-ink">Mo</td>
                  <td>09:00–13:00 / 14:00–18:00</td>
                </tr>
                <tr>
                  <td className="pr-8 font-normal text-ink">Di & Mi</td>
                  <td>geschlossen</td>
                </tr>
                <tr>
                  <td className="pr-8 font-normal text-ink">Do</td>
                  <td>09:00–13:00 / 14:00–19:00</td>
                </tr>
                <tr>
                  <td className="pr-8 font-normal text-ink">Fr</td>
                  <td>09:00–13:00 / 14:00–18:00</td>
                </tr>
                <tr>
                  <td className="pr-8 font-normal text-ink">Sa</td>
                  <td>10:00–14:00</td>
                </tr>
                <tr>
                  <td className="pr-8 font-normal text-ink">So</td>
                  <td>geschlossen</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="mt-16 text-center">
          <CtaButton>Jetzt Termin buchen</CtaButton>
        </div>
      </section>
    </>
  );
}
