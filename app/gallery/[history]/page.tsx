import GalleryComponent from "../../../components/GalleryPage/GalleryComponent";

export default function Page({ params }: { params: { history: string } }) {
  return (
    <div className="">
      <GalleryComponent />
    </div>
  );
}
