import PDFComponent from "../../../../../components/PDFPage/PDFComponent";

export default function Page({ params }: { params: { period: string } }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <PDFComponent />
    </div>
  );
}
