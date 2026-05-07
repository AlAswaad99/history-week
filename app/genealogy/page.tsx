import GenealogyClient from "../../components/genealogy/GenealogyClient";

export const metadata = {
  title: "Biblical Genealogy · የመጽሐፍ ቅዱስ የዘር ሐረግ",
  description:
    "Interactive biblical family tree in Amharic and English with search, filters, and printable selections.",
};

export default function GenealogyPage() {
  return (
    <main className="genealogy-scope pt-20">
      <GenealogyClient />
    </main>
  );
}
