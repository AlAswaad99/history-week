import PeriodComponent from "../../../components/PeriodPage/PeriodComponent";

export default function Page({ params }: { params: { period: string } }) {
  return (
    <div className="max-w-screen-2xl mx-auto min-h-screen ">
      <PeriodComponent />
    </div>
  );
}
