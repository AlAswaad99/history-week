"use client";
import { AnimatePresence } from "framer-motion";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import HistoryCard from "../Blocks/HistoryCard";

export default function HistoriesSection({ slides }: { slides: any[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    const updateScrollState = () => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft + clientWidth < scrollWidth);
      }
    };

    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", updateScrollState);
      updateScrollState();
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", updateScrollState);
      }
    };
  }, []);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };
  return (
    <div className="w-full max-w-screen-xl 2xl:max-w-screen-2xl mx-auto md:mt-24 mt-10 md:px-20 xl:px-0 px-10 mb-10 ">
      <div className="flex justify-between items-end mb-4">
        <div className="w-full">
          <p className="text-xl">Histories</p>
          <h1 className="md:text-5xl text-2xl  md:mt-4 mt-2 text-black">
            ካጅድፍ ክስድጅፍ
          </h1>
        </div>{" "}
        <div className="lg:flex w-full justify-end hidden gap-3">
          <button
            type="button"
            onClick={scrollLeft}
            className="p-4 rounded-full border-2 border-orange-500 bg-transparent"
          >
            {<ChevronLeftIcon size={25} className=" text-orange-500" />}
          </button>
          <button
            type="button"
            onClick={scrollLeft}
            className="p-4 rounded-full bg-orange-500"
          >
            {<ChevronRightIcon size={25} className=" text-white" />}
          </button>
        </div>
      </div>
      <AnimatePresence mode="popLayout">
        <div
          ref={scrollRef}
          className="flex md:flex-nowrap flex-wrap gap-4 overflow-x-scroll pb-6 scrollbar-hide"
        >
          {slides.map((v, index) => (
            <HistoryCard
              key={index}
              img={v.thumbnail}
              description={v.description}
              title={v.name}
              url={v.url}
              date={v.date}
            />
          ))}
        </div>
      </AnimatePresence>
    </div>
  );
}
