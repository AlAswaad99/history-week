"use client";
import Image from "next/image";
import { useState } from "react";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";

const StaggeredImagesComponent = () => {
  // const [images] = useState(
  //   Array.from({ length: 50 }).map((_, index) => ({
  //     src: `https://picsum.photos/1080/${Math.floor(
  //       Math.random() * (1300 - 200 + 1) + 200
  //     )}`,
  //   }))
  // );
  const images = [
    "/gallery/photo_1_2024-08-05_06-12-20.jpg",
    "/gallery/photo_1_2024-08-05_06-12-27.jpg",
    "/gallery/photo_1_2024-08-05_06-12-39.jpg",
    "/gallery/photo_2_2024-08-05_06-12-39.jpg",
    "/gallery/photo_2_2024-08-05_06-12-39.jpg",
    "/gallery/photo_3_2024-08-05_06-12-39.jpg",
    "/gallery/photo_3_2024-08-05_06-12-39.jpg",
    "/gallery/photo_4_2024-08-05_06-12-39.jpg",
    "/gallery/photo_5_2024-08-05_06-12-39.jpg",
  ];

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
    <div className="md:pt-40 w-full pt-24 pb-4 px-4 max-w-screen-xl 2xl:max-w-screen-2xl mx-auto">
      <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3 }}>
        <Masonry gutter="1rem" className="">
          {images.map((image, index) => (
            <div
              key={index}
              className=" relative w-full h-full cursor-pointer"
              onClick={() => openImage(index)}
            >
              <div className="absolute rounded-3xl inset-0 bg-black opacity-50"></div>

              <Image
                src={`${image}`}
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
  images: string[];
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
              src={`${images[currentIndex]!}`}
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

export default StaggeredImagesComponent;
