"use client";
import Image from "next/image";
import { useState } from "react";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";

const GalleryComponent = () => {
  // const [images] = useState(
  //   Array.from({ length: 50 }).map((_, index) => ({
  //     src: `https://picsum.photos/1080/${Math.floor(
  //       Math.random() * (1300 - 200 + 1) + 200
  //     )}`,
  //   }))
  // );

  var images = [
    {
      src: "bible-history/BIBLE MUSEUM_Poster_1.5m x 1.5m.jpg",
    },
    {
      src: "church-history/banner.jpg",
    },
    {
      src: "bible-history/BIBLE MUSEUM_Poster_1.5m x 1.5m.jpg",
    },
    {
      src: "church-history/banner.jpg",
    },
    {
      src: "bible-history/BIBLE MUSEUM_Poster_1.5m x 1.5m.jpg",
    },
    {
      src: "church-history/banner.jpg",
    },
    {
      src: "bible-history/BIBLE MUSEUM_Poster_1.5m x 1.5m.jpg",
    },
    {
      src: "church-history/banner.jpg",
    },
    {
      src: "bible-history/BIBLE MUSEUM_Poster_1.5m x 1.5m.jpg",
    },
    {
      src: "church-history/banner.jpg",
    },
    {
      src: "bible-history/BIBLE MUSEUM_Poster_1.5m x 1.5m.jpg",
    },
    {
      src: "church-history/banner.jpg",
    },
    {
      src: "bible-history/BIBLE MUSEUM_Poster_1.5m x 1.5m.jpg",
    },
    {
      src: "church-history/banner.jpg",
    },
    {
      src: "bible-history/BIBLE MUSEUM_Poster_1.5m x 1.5m.jpg",
    },
    {
      src: "church-history/banner.jpg",
    },
    {
      src: "bible-history/BIBLE MUSEUM_Poster_1.5m x 1.5m.jpg",
    },
    {
      src: "church-history/banner.jpg",
    },
    {
      src: "bible-history/BIBLE MUSEUM_Poster_1.5m x 1.5m.jpg",
    },
    {
      src: "church-history/banner.jpg",
    },
    {
      src: "bible-history/BIBLE MUSEUM_Poster_1.5m x 1.5m.jpg",
    },
    {
      src: "church-history/banner.jpg",
    },
    {
      src: "bible-history/BIBLE MUSEUM_Poster_1.5m x 1.5m.jpg",
    },
    {
      src: "church-history/banner.jpg",
    },
    {
      src: "bible-history/BIBLE MUSEUM_Poster_1.5m x 1.5m.jpg",
    },
    {
      src: "church-history/banner.jpg",
    },
    {
      src: "bible-history/BIBLE MUSEUM_Poster_1.5m x 1.5m.jpg",
    },
    {
      src: "church-history/banner.jpg",
    },
  ];

  images = images.concat(images).concat(images).concat(images).concat(images);

  const [currentIndex, setCurrentIndex] = useState<number | null>(null);

  const openImage = (index: number) => {
    setCurrentIndex(index);
  };

  const closeImage = () => {
    setCurrentIndex(null);
  };

  const nextImage = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === null || prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === null || prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  return (
    <div className="md:pt-40 w-full pt-20">
      <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3 }}>
        <Masonry gutter="4px" className="">
          {images.map((image, index) => (
            <div
              key={index}
              className=" relative w-full h-full cursor-pointer"
              onClick={() => openImage(index)}
            >
              <div className="absolute rounded-3xl  inset-0 bg-black opacity-50"></div>

              <Image
                src={`/${image.src}`}
                alt={`Image ${index}`}
                width={1080}
                height={1920}
                objectFit="cover"
                className=" w-full h-full rounded-3xl"
              />
            </div>
          ))}
        </Masonry>
      </ResponsiveMasonry>

      {currentIndex !== null && (
        <CustomGallery
          images={images}
          currentIndex={currentIndex}
          closeImage={closeImage}
          nextImage={nextImage}
          prevImage={prevImage}
        />
      )}
    </div>
  );
};

const CustomGallery = ({
  images,
  currentIndex,
  closeImage,
  nextImage,
  prevImage,
}: {
  images: { src: string }[];
  currentIndex: number;
  closeImage: () => void;
  nextImage: () => void;
  prevImage: () => void;
}) => {
  return (
    <div>
      <div className="flex flex-wrap justify-between "></div>

      {currentIndex !== null && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-30"
          onClick={closeImage}
        >
          <span
            className="absolute top-5 right-10 z-40 text-white text-5xl cursor-pointer"
            onClick={closeImage}
          >
            &times;
          </span>
          <div className="relative z-40 h-3/4 w-[90%] max-h-screen max-w-screen ">
            <Image
              src={`/${images[currentIndex]!.src}`}
              alt={`Image ${currentIndex}`}
              layout="fill"
              objectFit="contain"
              className="rounded-3xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryComponent;
