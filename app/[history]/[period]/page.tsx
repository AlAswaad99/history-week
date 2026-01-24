import PeriodComponent from "../../../components/PeriodPage/PeriodComponent";

export default function Page({ params }: { params: { period: string } }) {
  return (
    <div className="max-w-screen-2xl mx-auto min-h-screen px-0 md:px-20 lg:px-20 xl:px-20">
      <PeriodComponent />
    </div>
  );
}
