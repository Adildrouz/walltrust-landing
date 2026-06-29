import { JsonLd } from "./JsonLd";

export interface FaqItem {
  question: string;
  answer: string;
}

/**
 * Renders a visible FAQ section AND the matching FAQPage JSON-LD.
 * (Google retired FAQ rich results in 2026, but the markup still helps
 * LLM/AI-search citation and keeps the visible content in sync.)
 */
export function Faq({ items }: { items: FaqItem[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.question,
      acceptedAnswer: { "@type": "Answer", text: it.answer },
    })),
  };

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight">Frequently asked questions</h2>
      <div className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
        {items.map((it) => (
          <div key={it.question} className="p-5">
            <h3 className="font-semibold text-slate-900">{it.question}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{it.answer}</p>
          </div>
        ))}
      </div>
      <JsonLd data={jsonLd} />
    </section>
  );
}
