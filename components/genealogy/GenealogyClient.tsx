"use client";

import dynamic from "next/dynamic";

const BiblicalGenealogyApp = dynamic(() => import("./BiblicalGenealogyApp"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center min-h-[calc(100svh-5rem)] text-[#451a03]">
      <div
        className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-[#D4AF37] animate-spin mb-4"
        aria-hidden
      />
      <h2 className="text-lg font-semibold">Loading Biblical Genealogy...</h2>
      <p className="text-sm text-gray-500 mt-1">
        Preparing the family tree visualization
      </p>
    </div>
  ),
});

export default function GenealogyClient() {
  return <BiblicalGenealogyApp />;
}
