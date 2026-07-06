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

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-teal-50 to-white">
        <div className="mx-auto max-w-5xl px-4 py-20 text-center sm:py-28">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Willkommen bei Smile<sup>2</sup>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
            Professionelle Zahnaufhellung – für ein strahlendes, selbstbewusstes Lächeln. Mit
            modernsten Methoden, viel Feingefühl und individueller Betreuung.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/buchen"
              className="rounded-full bg-teal-600 px-8 py-3 text-lg font-medium text-white shadow-sm transition hover:bg-teal-700"
            >
              Jetzt Termin buchen
            </Link>
          </div>
        </div>
      </section>

      {/* USPs */}
      <section id="ueber-uns" className="mx-auto max-w-5xl scroll-mt-20 px-4 py-16">
        <h2 className="text-center text-3xl font-semibold text-slate-900">
          Was Smile<sup>2</sup> auszeichnet
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {USPS.map((usp) => (
            <div key={usp.title} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <h3 className="font-semibold text-teal-700">{usp.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{usp.text}</p>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-10 max-w-3xl text-center leading-relaxed text-slate-600">
          Mein Name ist Dilara und ich bin seit 11 Jahren in der Zahnmedizin tätig. Mein Ziel ist
          es, dass du glücklich mit deinem Lächeln bist – ich begleite dich Schritt für Schritt zu
          einem Ergebnis, das gesund, schonend und schön ist.
        </p>
      </section>

      {/* Kooperation */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-16 text-center">
          <h2 className="text-2xl font-semibold text-slate-900">
            Kooperation mit Zahnarzt Dr. Mahlberg in Gossau
          </h2>
          <p className="mx-auto mt-4 max-w-3xl leading-relaxed text-slate-600">
            Smile<sup>2</sup> arbeitet eng mit der Praxis von Dr. Mahlberg zusammen, agiert dabei
            jedoch als eigenständiges Studio. Du profitierst von einem hochspezialisierten Angebot,
            ergänzt durch fachärztliche Unterstützung – effizient und unkompliziert.
          </p>
        </div>
      </section>

      {/* Kontakt */}
      <section id="kontakt" className="mx-auto max-w-5xl scroll-mt-20 px-4 py-16">
        <div className="grid gap-10 sm:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Kontakt</h2>
            <p className="mt-4 text-slate-600">
              📍 Feldlistrasse 17, 9000 St. Gallen
              <br />
              📞{" "}
              <a href="tel:+41765677693" className="hover:text-teal-700">
                076 567 76 93
              </a>
              <br />
              ✉️{" "}
              <a href="mailto:smilehochzwei@gmail.com" className="hover:text-teal-700">
                smilehochzwei@gmail.com
              </a>
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Öffnungszeiten</h2>
            <table className="mt-4 text-slate-600">
              <tbody>
                <tr>
                  <td className="pr-6 font-medium">Mo</td>
                  <td>09:00–13:00 / 14:00–18:00</td>
                </tr>
                <tr>
                  <td className="pr-6 font-medium">Di & Mi</td>
                  <td>geschlossen</td>
                </tr>
                <tr>
                  <td className="pr-6 font-medium">Do</td>
                  <td>09:00–13:00 / 14:00–19:00</td>
                </tr>
                <tr>
                  <td className="pr-6 font-medium">Fr</td>
                  <td>09:00–13:00 / 14:00–18:00</td>
                </tr>
                <tr>
                  <td className="pr-6 font-medium">Sa</td>
                  <td>10:00–14:00</td>
                </tr>
                <tr>
                  <td className="pr-6 font-medium">So</td>
                  <td>geschlossen</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="mt-12 text-center">
          <Link
            href="/buchen"
            className="rounded-full bg-teal-600 px-8 py-3 text-lg font-medium text-white shadow-sm transition hover:bg-teal-700"
          >
            Jetzt Termin buchen
          </Link>
        </div>
      </section>
    </>
  );
}
