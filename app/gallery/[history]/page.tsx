import StaggeredImagesComponent from "../../../components/GalleryPage/StaggeredImagesComponent";

export default function Page({ params }: { params: { history: string } }) {
  return (
    <div className="min-h-screen">
      <StaggeredImagesComponent />
    </div>
  );
}
