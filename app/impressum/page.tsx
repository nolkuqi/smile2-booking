import type { Metadata } from "next";

export const metadata: Metadata = { title: "Impressum", robots: { index: false } };

export default function ImpressumPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 text-slate-700">
      <h1 className="text-2xl font-semibold text-slate-900">Impressum</h1>
      <div className="mt-6 space-y-4 leading-relaxed">
        <p>
          Smile² – Zahnbleaching-Studio
          <br />
          Feldlistrasse 17
          <br />
          9000 St. Gallen
          <br />
          Schweiz
        </p>
        <p>
          Telefon: 076 567 76 93
          <br />
          E-Mail: smilehochzwei@gmail.com
        </p>
        {/* TODO: Inhaberin, UID und weitere Pflichtangaben mit dem Studio ergänzen */}
      </div>
    </div>
  );
}
