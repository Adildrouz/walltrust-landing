import { Check } from "lucide-react";

export interface ComparisonRow {
  feature: string;
  competitor: string;
  walltrust: string;
  /** highlight the WallTrust cell with a check + emphasis */
  win?: boolean;
}

export function ComparisonTable({
  competitorName,
  rows,
}: {
  competitorName: string;
  rows: ComparisonRow[];
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-left">
            <th className="px-4 py-3 font-medium text-slate-500">Feature</th>
            <th className="px-4 py-3 font-medium text-slate-700">{competitorName}</th>
            <th className="px-4 py-3 font-semibold text-primary">WallTrust</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.feature} className="border-b border-slate-100 last:border-0">
              <td className="px-4 py-3 font-medium text-slate-700">{row.feature}</td>
              <td className="px-4 py-3 text-slate-600">{row.competitor}</td>
              <td className="px-4 py-3 font-medium text-slate-900">
                <span className="inline-flex items-center gap-1.5">
                  {row.win && <Check size={15} className="shrink-0 text-emerald-600" />}
                  {row.walltrust}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
