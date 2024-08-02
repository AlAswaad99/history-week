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

const GalleriesSection = ({slides}: {slides: any[]}) => {
  return (
    <div>
      <div className="w-screen">
        <div className="w-full max-w-screen-xl 2xl:max-w-screen-2xl mx-auto text-center">
          <p className="text-xl">Histories</p>
          <h1 className="md:text-5xl text-2xl  md:mt-4 mt-2 text-black">
            ካጅድፍ ክስድጅፍ
          </h1>
        </div>{" "}
        {/* <div className="grid md:grid-cols-1 lg:grid-cols-1 gap-6"> */}
        <div className="">
          {slides.map((journey) => (
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
          ))}
        </div>
      </div>
    </div>
  );
};

export default GalleriesSection;
