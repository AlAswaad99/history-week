import { ChevronRightIcon } from "lucide-react";
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

const GalleriesComponent = ({ slides }: { slides: any[] }) => {
  return (
    <div className="max-w-screen-xl 2xl:max-w-screen-2xl mx-auto text-center rounded-3xl px-4 lg:px-0 pb-10 mt-28">
      <div className="w-full ">
        {/* <div className="w-full ">
          <p className="text-xl">Histories</p>
          <h1 className="md:text-5xl text-2xl  md:mt-4 mt-2 text-black">
            ካጅድፍ ክስድጅፍ
          </h1>
        </div> */}
        {/* <div className="grid md:grid-cols-1 lg:grid-cols-1 gap-6"> */}
        <div className="gap-y-8 space-y-8">
          {slides.map((journey, index) => (
            <div
              key={journey.name}
              className="relative max-h-[30rem] mb-8 overflow-hidden group rounded-3xl transition-all duration-500 lg:w-3/4 w-full hover:w-full"
            >
              <Link href={`/gallery${journey.url}`}>
                <Image
                  src={journey.thumbnail}
                  alt={journey.name}
                  //   layout="responsive"
                  width={1200}
                  height={800}
                  className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black opacity-50 group-hover:opacity-60 duration-500"></div>
                <div className="absolute bottom-8 left-8 text-start lg:opacity-0 block group-hover:opacity-100 transition-all duration-500 text-white">
                  <h3 className="text-xl lg:text-2xl font-semibold font-habesha-bold">
                    {journey.name}
                  </h3>
                  <p className="text-sm lg:text-lg font-habesha-light">ፎቶዎች</p>
                </div>
                <div className="absolute bottom-8 right-8 lg:opacity-0 block group-hover:opacity-100 transition-all duration-500 text-white">
                  <button
                    type="button"
                    // onClick={scrollLeft}
                    className="lg:p-5 p-3 rounded-full bg-[#1e1b47]"
                  >
                    <Link href={`/gallery${journey.url}`}>
                      <ChevronRightIcon size={28} className=" text-white" />
                    </Link>
                    {/* {<ChevronRightIcon size={25} className=" text-white" />} */}
                  </button>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GalleriesComponent;
