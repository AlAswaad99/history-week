"use client";
import type {
  EmblaCarouselType,
  EmblaEventType,
  EmblaOptionsType,
} from "embla-carousel";
import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import React, { useCallback, useEffect, useRef } from "react";
import PageScroller from "../Blocks/PageScroller";

const TWEEN_FACTOR_BASE = 0.5;

type PropType = {
  slides: number[];
  options?: EmblaOptionsType;
};

// const preloadImages = (srcArray: any[]) => {
//   const promises = srcArray.map((src) => {
//     return new Promise((resolve, reject) => {
//       const img = new Image();
//       img.src = src;
//       img.onload = resolve;
//       img.onerror = reject;
//     });
//   });

//   return Promise.all(promises);
// };

const LandingSection: React.FC<PropType> = (props) => {
  const { options } = props;
  const section1Ref = useRef(null);
  // const section2Ref = useRef(null);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -80; // Your offset value
      const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };
  const slides = [
    "/church-history/banner.jpg",
    "/church-history/modern/modern.jpg",
    "/church-history/early-history/early-history.jpg",
    "/church-history/reformation/reformation.jpg",
    // Add more image paths as needed
  ];

  //

  // useEffect(() => {

  //   // preloadImages(imageList)
  //   //   .then((res) => {
  //   //     console.log("res", res);
  //   //     setIsLoaded(true);
  //   //     setSlides(imageList);
  //   //   })
  //   //   .catch((err) => console.error("Failed to load images", err));
  // }, []);
  const [emblaRef, emblaApi] = useEmblaCarousel(options, [
    Autoplay({ playOnInit: true, delay: 5000 }),
  ]);
  const tweenFactor = useRef(0);
  const tweenNodes = useRef<HTMLElement[]>([]);

  //   const { selectedIndex, scrollSnaps, onDotButtonClick } =
  //     useDotButton(emblaApi);

  // const {
  //   prevBtnDisabled,
  //   nextBtnDisabled,
  //   onPrevButtonClick,
  //   onNextButtonClick,
  // } = usePrevNextButtons(emblaApi);

  const setTweenNodes = useCallback((emblaApi: EmblaCarouselType): void => {
    tweenNodes.current = emblaApi.slideNodes().map((slideNode) => {
      return slideNode.querySelector(".embla__parallax__layer") as HTMLElement;
    });
  }, []);

  const setTweenFactor = useCallback((emblaApi: EmblaCarouselType) => {
    tweenFactor.current = TWEEN_FACTOR_BASE * emblaApi.scrollSnapList().length;
  }, []);

  const tweenParallax = useCallback(
    (emblaApi: EmblaCarouselType, eventName?: EmblaEventType) => {
      const engine = emblaApi.internalEngine();
      const scrollProgress = emblaApi.scrollProgress();
      const slidesInView = emblaApi.slidesInView();
      const isScrollEvent = eventName === "scroll";

      emblaApi.scrollSnapList().forEach((scrollSnap, snapIndex) => {
        let diffToTarget = scrollSnap - scrollProgress;
        const slidesInSnap = engine.slideRegistry[snapIndex];

        slidesInSnap!.forEach((slideIndex) => {
          if (isScrollEvent && !slidesInView.includes(slideIndex)) return;

          if (engine.options.loop) {
            engine.slideLooper.loopPoints.forEach((loopItem) => {
              const target = loopItem.target();

              if (slideIndex === loopItem.index && target !== 0) {
                const sign = Math.sign(target);

                if (sign === -1) {
                  diffToTarget = scrollSnap - (1 + scrollProgress);
                }
                if (sign === 1) {
                  diffToTarget = scrollSnap + (1 - scrollProgress);
                }
              }
            });
          }

          const translate = diffToTarget * (-1 * tweenFactor.current) * 100;
          const tweenNode = tweenNodes.current[slideIndex];
          tweenNode!.style.transform = `translateX(${translate}%)`;
        });
      });
    },
    []
  );

  useEffect(() => {
    if (!emblaApi) return;

    setTweenNodes(emblaApi);
    setTweenFactor(emblaApi);
    tweenParallax(emblaApi);

    emblaApi
      .on("reInit", setTweenNodes)
      .on("reInit", setTweenFactor)
      .on("reInit", tweenParallax)
      .on("scroll", tweenParallax)
      .on("slideFocus", tweenParallax);
  }, [emblaApi, tweenParallax]);

  return (
    <div className="w-full h-screen ">
      <div className=" w-full h-screen lg:px-20 px-4 z-10 bg-black/50 rounded-b-3xl absolute flex text-white items-center pb-20 justify-between">
        <div className="max-w-screen-2xl mx-auto w-full flex justify-between items-end h-full">
          <div className="mb-20">
            <h1 className="lg:text-[20rem] text-9xl font-habesha-bold text-white">
              ታሪክ
            </h1>
            <h2 className="lg:text-8xl text-5xl font-habesha-regular  mb-16 m-0 p-0">
              የእግዚአብሔር <br className="lg:hidden block" /> እጅ ፅሑፍ
            </h2>
            <h1 className="mt-4 md:w-2/3 md:text-lg text-sm font-extralight font-droid text-white opacity-60">
              "የዱሮውን ዘመን አስብ፥ የብዙ ትውልድንም ዓመታት አስተውል፤ አባትህን ጠይቅ፥ ያስታውቅህማል፤
              ሽማግሌዎችህን ጠይቅ፥ ይነግሩህማል።" <br className="lg:hidden block" />-{" "}
              <span className="font-bold">ዘዳግም 32:7</span>
            </h1>
            {/* <div className="lg:w-1/5 w-1/2 mt-8 py-2 rounded-3xl text-center bg-[#1e1b47]">
              <Link href={"/"} className=" ">
                <p>Start</p>
              </Link>
            </div> */}
          </div>
          
          <div
            className="flex justify-center gap-4 absolute bottom-0 left-0 right-0 mb-10  items-center"
            onClick={() => scrollToSection("histories")}
          >
            {/* <p style={{ writingMode: "vertical-lr" }}>Scroll to see more</p> */}
            <PageScroller direction="down" next="histories" />
          </div>
        </div>
      </div>

      <div className="embla rounded-3xl">
        <div className="embla__viewport " ref={emblaRef}>
          <div className="embla__container h-screen ">
            {slides.map((v, index) => (
              <div className="embla__slide w-screen" key={index}>
                <div className="embla__parallax w-full">
                  <div className="embla__parallax__layer w-full">
                    <Image
                      className="embla__slide__img embla__parallax__img w-full"
                      src={v}
                      width={1200}
                      height={1200}
                      alt="Your alt text"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* <div className="absolute bottom-0 z-20 flex h-full  left-0 right-0 w-full bg-transparent">
            <div className="embla__controls w-full ">
              <div className="embla__buttons w-screen flex justify-between">
                <PrevButton
                  onClick={onPrevButtonClick}
                  disabled={prevBtnDisabled}
                />
                <NextButton
                  onClick={onNextButtonClick}
                  disabled={nextBtnDisabled}
                />
              </div>
            </div>
          </div> */}
    </div>
  );
};

export default LandingSection;
