import type { Metadata } from "next";

export const metadata: Metadata = { title: "Datenschutz", robots: { index: false } };

export default function DatenschutzPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 text-ink-soft">
      <h1 className="text-3xl font-semibold tracking-wide text-ink">Datenschutzerklärung</h1>
      <div className="mt-6 space-y-4 leading-relaxed">
        <p>
          Für die Terminbuchung erheben wir nur die Daten, die wir zur Durchführung des Termins
          benötigen: Vorname, Nachname, E-Mail-Adresse und Telefonnummer.
        </p>
        <p>
          Deine Daten werden ausschliesslich für die Terminverwaltung sowie für Bestätigungen und
          Erinnerungen per E-Mail/SMS verwendet und nicht an Dritte weitergegeben. Für den Versand
          setzen wir technische Dienstleister (E-Mail- und SMS-Provider) ein.
        </p>
        <p>
          Du kannst jederzeit Auskunft über deine gespeicherten Daten verlangen oder deren Löschung
          beantragen: smilehochzwei@gmail.com
        </p>
        {/* TODO: Vollständige Datenschutzerklärung nach CH-DSG mit dem Studio finalisieren */}
      </div>
    </div>
  );
}
