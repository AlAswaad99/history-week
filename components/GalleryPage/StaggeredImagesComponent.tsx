"use client";
import { X } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useState } from "react";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { useSwipeable } from "react-swipeable";

const StaggeredImagesComponent = () => {
  const { history } = useParams<{
    history: string;
  }>();

  const churchHistoryImageUrls = [
    "/gallery/church-history/IMG_3901-min.jpg",
    "/gallery/church-history/IMG_3903-min.jpg",
    "/gallery/church-history/IMG_3906-min.jpg",
    "/gallery/church-history/IMG_3907-min.jpg",
    "/gallery/church-history/IMG_3909-min.jpg",
    "/gallery/church-history/IMG_3911-min.jpg",
    "/gallery/church-history/photo_2024-08-11_00-38-10.jpg",
    "/gallery/church-history/photo_2024-08-11_00-38-44.jpg",
    "/gallery/church-history/IMG_3913-min.jpg",
    "/gallery/church-history/IMG_3923-min.jpg",
    "/gallery/church-history/IMG_3924-min.jpg",
    "/gallery/church-history/IMG_3925-min.jpg",
    "/gallery/church-history/photo_1_2024-08-05_06-12-20.jpg",
    "/gallery/church-history/photo_1_2024-08-05_06-12-27.jpg",
    "/gallery/church-history/photo_1_2024-08-05_06-12-39.jpg",
    "/gallery/church-history/photo_2_2024-08-05_06-12-20.jpg",
    "/gallery/church-history/photo_2_2024-08-05_06-12-27.jpg",
    "/gallery/church-history/photo_2_2024-08-05_06-12-39.jpg",
    "/gallery/church-history/photo_3_2024-08-05_06-12-39.jpg",
    "/gallery/church-history/photo_4_2024-08-05_06-12-39.jpg",
    "/gallery/church-history/photo_5_2024-08-05_06-12-39.jpg",
    "/gallery/church-history/photo_2024-08-06_04-46-25.jpg",
    "/gallery/church-history/photo_2024-08-06_04-46-31.jpg",
    "/gallery/church-history/photo_2024-08-06_04-46-41.jpg",
    "/gallery/church-history/photo_2024-08-06_04-46-43.jpg",
    "/gallery/church-history/photo_2024-08-06_04-46-44.jpg",
    "/gallery/church-history/photo_2024-08-11_00-38-56.jpg",
    "/gallery/church-history/photo_2024-08-11_00-39-17.jpg",
    "/gallery/church-history/photo_2024-08-11_00-39-22.jpg",
    "/gallery/church-history/photo_2024-08-11_00-40-05.jpg",
  ];
  

  const bibleHistoryImageUrls = [
    "/gallery/bible-history/photo_1_2024-08-06_04-59-32.jpg",
    "/gallery/bible-history/photo_2_2024-08-06_04-59-32.jpg",
    "/gallery/bible-history/photo_3_2024-08-06_04-59-32.jpg",
    "/gallery/bible-history/photo_4_2024-08-06_04-59-32.jpg",
    "/gallery/bible-history/photo_2024-08-10_23-37-30.jpg",
    "/gallery/bible-history/photo_2024-08-10_23-37-38.jpg",
    "/gallery/bible-history/photo_2024-08-10_23-37-44.jpg",
    "/gallery/bible-history/photo_2024-08-10_23-37-53.jpg",
    "/gallery/bible-history/photo_5_2024-08-06_04-59-32.jpg",
    "/gallery/bible-history/photo_6_2024-08-06_04-59-32.jpg",
    "/gallery/bible-history/photo_7_2024-08-06_04-59-32.jpg",
    "/gallery/bible-history/photo_8_2024-08-06_04-59-32.jpg",
    "/gallery/bible-history/photo_9_2024-08-06_04-59-32.jpg",
    "/gallery/bible-history/photo_10_2024-08-06_04-59-32.jpg",
    "/gallery/bible-history/photo_11_2024-08-06_04-59-32.jpg",
    "/gallery/bible-history/photo_12_2024-08-06_04-59-32.jpg",
    "/gallery/bible-history/photo_13_2024-08-06_04-59-32.jpg",
    "/gallery/bible-history/photo_14_2024-08-06_04-59-32.jpg",
    "/gallery/bible-history/photo_2024-08-10_23-31-35.jpg",
    "/gallery/bible-history/photo_2024-08-10_23-31-40.jpg",
    "/gallery/bible-history/photo_2024-08-10_23-31-52.jpg",
    "/gallery/bible-history/photo_2024-08-10_23-32-39.jpg",
    "/gallery/bible-history/photo_2024-08-10_23-33-00.jpg",
    "/gallery/bible-history/photo_2024-08-10_23-33-17.jpg",
    "/gallery/bible-history/photo_2024-08-10_23-33-19.jpg",
    "/gallery/bible-history/photo_2024-08-10_23-33-27.jpg",
    "/gallery/bible-history/photo_2024-08-10_23-33-31.jpg",
    "/gallery/bible-history/photo_2024-08-10_23-33-34.jpg",
    "/gallery/bible-history/photo_2024-08-10_23-33-36.jpg",
    "/gallery/bible-history/photo_2024-08-10_23-33-39.jpg",
    "/gallery/bible-history/photo_2024-08-10_23-32-52.jpg",
    "/gallery/bible-history/photo_2024-08-10_23-34-48.jpg",
  ];
  
  const images =
    history === "church-history"
      ? churchHistoryImageUrls
      : bibleHistoryImageUrls;

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
  const handlers = useSwipeable({
    onSwipedLeft: nextImage,
    onSwipedRight: prevImage,
    preventScrollOnSwipe: true,
    // swipeDuration: 200,
    // trackTouch: true,
    trackMouse: true,
  });

  return (
    <div {...handlers}>
      {currentIndex !== null && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-30"
          onClick={closeImage}
        >
          <span
            className="absolute top-32 right-4 z-40 text-white text-5xl cursor-pointer"
            onClick={closeImage}
          >
            <X size={30}/>
          </span>
          <div className="relative z-40 h-3/4 w-[90%] max-h-screen max-w-screen">
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
