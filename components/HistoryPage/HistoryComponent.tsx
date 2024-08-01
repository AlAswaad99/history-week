"use client";
import { Home } from "lucide-react";
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
      <HistoryDetailComponent history={currentHistory} />
      <div className="flex flex-wrap align md:mt-8 gap-10 px-10 py-20 md:w-full w-screen md:justify-start justify-center bg-white rounded-3xl md:-mx-0 -mx-4">
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
    </div>
  );
}
