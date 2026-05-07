import Link from "next/link";
import { ArrowRight, GitBranch } from "lucide-react";

export default function GenealogySection() {
  return (
    <section
      className="w-full mx-auto md:py-24 py-12 lg:px-20 px-4 xl:px-0"
      id="genealogy"
    >
      <div className="max-w-screen-xl 2xl:max-w-screen-2xl mx-auto">
        <Link
          href="/genealogy"
          className="group block relative overflow-hidden rounded-3xl border border-[#1e1b47]/15 bg-gradient-to-br from-[#fffaf0] via-[#fef3c7] to-[#f0f9ff] shadow-sm hover:shadow-xl transition-shadow"
        >
          <div className="grid md:grid-cols-[1fr_auto] gap-6 md:gap-10 items-center p-6 md:p-12">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1e1b47] text-white text-xs md:text-sm mb-4">
                <GitBranch size={14} />
                <span>Interactive · Amharic + English</span>
              </div>
              <h2 className="md:text-5xl text-2xl font-habesha-bold text-black leading-tight">
                የመጽሐፍ ቅዱስ የዘር ሐረግ
              </h2>
              <p className="mt-2 md:text-2xl text-lg text-[#1e1b47] font-medium">
                Biblical Genealogy Tree
              </p>
              <p className="mt-4 max-w-xl text-sm md:text-base text-gray-700 leading-relaxed">
                Explore the family tree from Adam to the apostles. Search any
                name in Amharic or English, filter by book, follow the
                Messianic line, and print custom genealogy cards.
              </p>
            </div>

            <div className="flex md:justify-end">
              <span className="inline-flex items-center gap-2 px-5 py-3 md:px-7 md:py-4 rounded-full bg-[#1e1b47] text-white text-sm md:text-base font-semibold shadow-md group-hover:translate-x-1 transition-transform">
                Open Genealogy
                <ArrowRight size={18} />
              </span>
            </div>
          </div>

          <div className="pointer-events-none absolute -right-12 -top-12 w-48 h-48 rounded-full bg-[#D4AF37]/20 blur-3xl" />
          <div className="pointer-events-none absolute -left-16 -bottom-16 w-56 h-56 rounded-full bg-[#1e3a8a]/10 blur-3xl" />
        </Link>
      </div>
    </section>
  );
}
