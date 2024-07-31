import HistoryComponent from "../../components/HistoryPage/HistoryComponent";

export default function Page({ params }: { params: { history: string } }) {
  return (
    <div className="max-w-screen-2xl mx-auto ">
      <HistoryComponent history={params.history} />
    </div>
  );
}
