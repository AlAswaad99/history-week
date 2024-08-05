import Image from "next/image";
import Link from "next/link";

// const journeys = [
//   {
//     img: "/bible-history/BIBLE MUSEUM_Poster_1.5m x 1.5m.jpg",
//     title: "Montreux",
//     subtitle: "12 Travelmates",
//   },
//   {
//     img: "/church-history/banner.jpg",
//     title: "Reykjavik",
//     subtitle: "8 Travelmates",
//   },
// ];

const GallerySection = ({ slides }: { slides: any[] }) => {
  return (
    <div className="   text-center  ">
      <div className="w-full">
        {/* <div className="w-full ">
          <p className="text-xl">Histories</p>
          <h1 className="md:text-5xl text-2xl  md:mt-4 mt-2 text-black">
            ካጅድፍ ክስድጅፍ
          </h1>
        </div> */}
        {/* <div className="grid md:grid-cols-1 lg:grid-cols-1 gap-6"> */}
        <div className="h-full">
          {/* {slides.map((journey) => (
            <Link href={`/gallery${journey.url}`} key={journey.title}>
              <div
                key={journey.name}
                className="relative max-h-96 overflow-hidden group cursor-pointer"
              >
                <Image
                  src={journey.thumbnail}
                  alt={journey.name}
                  //   layout="responsive"
                  width={1200}
                  height={800}
                  className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black opacity-50"></div>

                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-xl font-semibold">{journey.name}</h3>
                  <p className="text-sm">{journey.date}</p>
                </div>
              </div>
            </Link>
          ))} */}
          {/* <Link href={`/gallery`}> */}
          <div className="relative overflow-hidden group cursor-pointer rounded-t-3xl h-full min-h-96 max-h-[40rem]">
            <Image
              src="/gallery/collage.jpg"
              alt="Gallery"
              width={1200}
              height={800}
              className="w-full h-full min-h-96 object-cover transform transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black group-hover:opacity-70 transition-opacity duration-300 md:opacity-20 opacity-60"></div>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-white lg:opacity-0 transition-opacity duration-300 group-hover:opacity-100 gap-8">
              <h3 className="lg:text-8xl text-5xl font-habesha-bold font-semibold px-4">የሙዚየም አልበም</h3>
              <Link
                href={`/gallery`}
                className="lg:w-1/6 w-1/2 py-2 rounded-3xl text-center bg-[#1e1b47] text-white hover:bg-[#1e1b47] hover:text-white"
              >
                <p>ይመልከቱ</p>
              </Link>
            </div>
          </div>
          {/* </Link> */}
        </div>
      </div>
    </div>
  );
};

export default GallerySection;
