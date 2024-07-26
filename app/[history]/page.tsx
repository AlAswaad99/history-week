import HistoryComponent from "../../components/HistoryPage/HistoryComponent";

export default function Page({ params }: { params: { history: string } }) {
  return (
    <div className="">
      <HistoryComponent history={params.history} />
    </div>
  );
}
