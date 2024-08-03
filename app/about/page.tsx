import AboutUsComponent from "../../components/AboutUsPage/AboutUsComponent";

export default function Page({ params }: { params: { history: string } }) {
  return (
    <div className="min-h-screen">
      <AboutUsComponent />
    </div>
  );
}
