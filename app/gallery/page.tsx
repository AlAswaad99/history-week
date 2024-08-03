import GalleriesComponent from "../../components/GalleryPage/GalleriesComponent";
import jsonData from '../../public/data.json';

export default function Page({ params }: { params: { history: string } }) {
  const slides = jsonData.data;

  return (
    <div className="min-h-screen">
      <GalleriesComponent slides={slides} />
    </div>
  );
}
