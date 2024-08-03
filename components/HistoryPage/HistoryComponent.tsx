"use client";
import { ChevronRightIcon, Home } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import jsonData from "../../public/data.json";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";
import HistoryDetailComponent from "./HistoryDetailsComponent";

export default function HistoryComponent({ history }: { history: string }) {
  const currentHistory = jsonData.data.filter((h) =>
    h.url.includes(history)
  )[0];
  //   console.log("history", history);
  //   console.log("histories", histories);
  return (
    <div className="flex flex-col max-w-screen-2xl md:px-0 px-4 mx-auto mt-28 items-start w-full justify-center ">
      <Breadcrumb className="w-full flex justify-start mb-8 pl-2">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">
              <Home />
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage> {currentHistory?.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <HistoryDetailComponent history={currentHistory} url={history} />
      <div className="flex flex-wrap align my-4 gap-10 px-10 py-10 md:w-full w-screen md:justify-start justify-center bg-white rounded-3xl md:-mx-0 -mx-4">
        {currentHistory?.histories.map((card, index) => (
          <div
            key={index}
            className={`bg-white cursor-pointer rounded-3xl w-64 shadow-md transition duration-300 transform hover:shadow-lg hover:scale-105 flex flex-col justify-between `}
          >
            <Link href={`/${history}/${card.folderName}`}>
              <div className="w-64 h-64">
                <Image
                  src={`/${history}/${card.folderName}/${card.cardImage}`}
                  alt="Card"
                  width={1200}
                  height={1200}
                  className="w-full h-full object-cover rounded-t-3xl "
                />
              </div>

              <div className="p-6">
                <h2 className="text-2xl font-semibold">{card.title}</h2>
                <p className="text-gray-600 font-yanon font-semibold">
                  {card.timePeriod}
                </p>
              </div>
            </Link>
          </div>
        ))}
      </div>
      <div
        key={currentHistory!.name}
        className="relative max-h-[30rem] mb-8 overflow-hidden group rounded-3xl transition-all duration-500 w-full hover:w-full"
      >
        <Image
          src={currentHistory!.thumbnail}
          alt={currentHistory!.name}
          //   layout="responsive"
          width={1200}
          height={800}
          className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black opacity-40 group-hover:opacity-60 duration-500"></div>
        <div className="absolute bottom-8 left-8 text-start lg:opacity-0 block group-hover:opacity-100 transition-all duration-500 text-white">
          <h3 className="text-xl lg:text-2xl font-semibold">{currentHistory!.name}</h3>
          <p className="text-sm lg:text-lg">ፎቶዎች</p>
        </div>
        <div className="absolute bottom-8 right-8 lg:opacity-0 block group-hover:opacity-100 transition-all duration-500 text-white">
          <button
            type="button"
            // onClick={scrollLeft}
            className="lg:p-5 p-3 rounded-full bg-[#1e1b47]"
          >
            <Link href={`/gallery${currentHistory!.url}`}>
              <ChevronRightIcon size={28} className=" text-white" />
            </Link>
            {/* {<ChevronRightIcon size={25} className=" text-white" />} */}
          </button>
        </div>
      </div>
      {/* <Link
        href={`/gallery${currentHistory!.url}`}
        className="md:-mx-0 -mx-4 md:w-full w-screen"
      >
        <div
          key={currentHistory!.name}
          className="relative max-h-[40rem] mb-8 overflow-hidden group cursor-pointer rounded-3xl transition-all duration-500 "
        >
          <Image
            src={currentHistory!.thumbnail}
            alt={currentHistory!.name}
            //   layout="responsive"
            width={1200}
            height={800}
            className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black opacity-50 group-hover:opacity-60 duration-500"></div>
          <div className="absolute bottom-4 left-4 hidden group-hover:block transition-all duration-500 text-white">
            <h3 className="text-xl font-semibold">{currentHistory!.name}</h3>
            <p className="text-sm">{currentHistory!.date}</p>
          </div>
        </div>
      </Link> */}
    </div>
  );
}
