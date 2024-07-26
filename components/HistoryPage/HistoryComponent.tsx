"use client";
import Image from "next/image";
import Link from "next/link";
import jsonData from "../../public/data.json";
import HistoryDetailComponent from "./HistoryDetailsComponent";

export default function HistoryComponent({ history }: { history: string }) {
  const currentHistory = jsonData.data.filter((h) => h.url.includes(history))[0];
  //   console.log("history", history);
  //   console.log("histories", histories);
  return (
    <div className="flex flex-col max-w-screen-2xl mx-auto items-start w-full justify-start mt-32 ">
      <HistoryDetailComponent
        history={currentHistory}
      />
      <div className="flex flex-wrap md:mt-8 gap-5 ">
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
                <h2 className="text-2xl font-Nokia font-semibold">
                  {card.title}
                </h2>
                <p className="text-gray-600 font-Klavika">{card.timePeriod}</p>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
