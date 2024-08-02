import type { EmblaOptionsType } from "embla-carousel";
import GalleriesSection from "../components/LandingPage/GalleriesSection";
import HistoriesSection from "../components/LandingPage/HistoriesSection";
import LandingSection from "../components/LandingPage/LandingSection";
import jsonData from '../public/data.json';

export default function Page() {
  const OPTIONS: EmblaOptionsType = {
    dragFree: true,
    loop: true,
    duration: 70,
  };
  const SLIDE_COUNT = 5;
  const SLIDES = Array.from(Array(SLIDE_COUNT).keys());
  const slides = jsonData.data;

  return (
    <div className="">
      <LandingSection slides={SLIDES} options={OPTIONS} />
      <HistoriesSection slides={slides}/>
      <GalleriesSection slides={slides}/>
    </div>
  );
}
