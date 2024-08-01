"use client";
import { ChevronRight, Home } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import jsonData from "../../public/data.json";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";

const PeriodComponent = () => {
  const { history, period } = useParams<{ history: string; period: string }>();
  const currentHistory = jsonData.data.filter((h) =>
    h.url.includes(history)
  )[0];

  const router = useRouter();

  const [periodInfo, setPeriodInfo] = useState<any>(null);
  const [periodEvents, setPeriodEvents] = useState<any>(null);
  const [mainImage, setMainImage] = useState<string>("");
  const [fullscreenImage, setFullscreenImage] = useState("");

  const folderName = period?.replace("/", "");

  console.log("period", period);
  console.log("history", history);

  useEffect(() => {
    if (period) {
      const tempPeriod = currentHistory?.histories.find(
        (p) => p.folderName === folderName
      );
      if (!tempPeriod) {
        router.push("/");
        return;
      }

      setPeriodInfo(tempPeriod);
      setPeriodEvents(tempPeriod.subFolders);
      setMainImage(`${folderName}/${tempPeriod.images[0]}`);
    }
  }, [period, router]);

  const openFullscreen = (imageUrl: string) => {
    setFullscreenImage(imageUrl);
  };

  const closeFullscreen = () => {
    setFullscreenImage("");
  };

  const handleImageClick = (image: string) => {
    setMainImage(`${folderName}/${image}`);
  };

  return (
    <>
      {periodInfo && periodEvents && (
        <div className="flex flex-col mx-auto items-center w-full md:px-0 px-4 mt-28 justify-center pb-16 lg:pt-0">
          <div className="w-full ">
            <Breadcrumb className="w-full flex justify-start mb-0 md:mb-8">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">
                    <Home />
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/${history}`}>
                    {currentHistory?.name}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage> {periodInfo.title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <h2 className="md:mb-1 md:mt-0 mt-4 font-sans">{currentHistory?.name}</h2>
            <h2 className="text-4xl font-semibold mb-2 font-sans">
              {periodInfo.title}
            </h2>
            <p className="text-gray-600 mb-4 md:text-lg font-droid text-justify">
              {periodInfo.desc}
            </p>
          </div>
          {mainImage && (
            <div className="w-full">
              <Image
                src={`/${history}/${mainImage}`}
                alt="Main"
                width={1800}
                height={1600}
                className="w-full h-full rounded-3xl object-cover mb-4 cursor-pointer"
                onClick={() => openFullscreen(`/${history}/${mainImage}`)}
              />
              <div className="flex justify-start w-full">
                {periodInfo.images.map((image: string, index: number) => (
                  <div className="w-32 h-auto  mr-4">
                    <Image
                      key={index}
                      src={`/${history}/${folderName}/${image}`}
                      alt={`Thumbnail ${index + 1}`}
                      width={264}
                      height={264}
                      className=" gap-10 rounded-2xl object-fill h-full w-full  cursor-pointer"
                      onClick={() => handleImageClick(image)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex flex-col gap-y-4 mt-8 w-full md:justify-start justify-center">
            {periodEvents.map((card: any, zindex: number) => (
              <Link
                key={zindex}
                href={`/${history}/${period}/${card.folderName}/0`}
              >
                <div className="bg-white cursor-pointer rounded-3xl shadow-md transition duration-300 transform hover:shadow-lg hover:scale-105 flex flex-col justify-between hover:bg-orange-100">
                  <div>
                    <div className="flex items-center justify-between p-6">
                      <h2 className="text-2xl font-semibold font-Nokia">
                        {card.name}
                      </h2>
                      <ChevronRight />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          {fullscreenImage && (
            <FullscreenImage
              imageUrl={fullscreenImage}
              onClose={closeFullscreen}
            />
          )}
        </div>
      )}
    </>
  );
};

const FullscreenImage = ({
  imageUrl,
  onClose,
}: {
  imageUrl: string;
  onClose: () => void;
}) => {
  return (
    <div
      className="fixed top-0 left-0 w-screen h-full bg-black bg-opacity-90 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div className="md:w-3/4 w-full">
        <Image
          src={`${imageUrl}`}
          alt="Fullscreen"
          width={1800}
          height={1600}
          className="w-full z-100 cursor-pointer"
          onClick={() => {}}
        />
      </div>

      <button
        className="absolute top-4 right-4 text-lg text-white"
        onClick={onClose}
      >
        X
      </button>
    </div>
  );
};

export default PeriodComponent;
