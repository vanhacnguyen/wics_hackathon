import { Suspense } from "react";
import ResultsClient from "./ResultClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-slate-600">Loading results…</div>}>
      <ResultsClient />
    </Suspense>
  );
}
