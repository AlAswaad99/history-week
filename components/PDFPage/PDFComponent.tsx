"use client";
import { DownloadCloud } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import jsonData from "../../public/data.json";
import Sample from "./PDFViewer";

function PDFComponent() {
  const router = useRouter();
  //   const { periodName, eventName, filenumber } = router.query;
  const { history, period, section, id } = useParams<{
    history: string;
    period: string;
    section: string;
    id: string;
  }>();

  console.log("history", history);
  console.log("period", period);
  console.log("section", section);
  console.log("number", id);
  const currentHistory = jsonData.data.filter((h) =>
    h.url.includes(history)
  )[0];
  const [periodInfo, setPeriodInfo] = useState<any>(null);
  const [periodEvent, setPeriodEvent] = useState<any>(null);
  const [periodEventsPDFs, setPeriodEventsPDFs] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState(Number.parseInt(id));
  const [pdfSource, setPDFSource] = useState<string>("");
  const folderName = period?.replace("/", "");

  useEffect(() => {
    if (period && section) {
      const fetchData = async () => {
        const tempPeriod = currentHistory?.histories.find(
          (p) => p.folderName === folderName
        );
        if (!tempPeriod) {
          router.push("/");
          return;
        }
        const tempEvent = tempPeriod.subFolders.find(
          (p) => p.folderName === section
        );

        if (!tempEvent) {
          router.push("/");
          return;
        }
        if (!id) {
          router.push(`/${history}/${period}/${section}/0`);
          return;
        }
        if (Number.parseInt(id) > tempEvent.pdfs.length - 1) {
          router.push("/");
          return;
        }

        console.log("tempPeriod", tempPeriod);

        setPeriodInfo(tempPeriod);
        setPeriodEvent(tempEvent);
        setPeriodEventsPDFs(tempEvent.pdfs);
        setPDFSource(`/${history}/${period}/${section}/${id}.pdf`);
      };

      fetchData();
    }
  }, [period, section, id, router]);

  console.log("periodInfo", periodInfo);
  console.log("periodEvent", periodEvent);
  console.log("periodEventsPDFs", periodEventsPDFs);
  return (
    <>
      {periodInfo && periodEvent && periodEventsPDFs && (
        <div className="flex min-h-screen flex-col xl:flex-row w-full mx-auto  xl:pt-32 ">
          <div className="flex flex-col xl:flex-row w-full xl:pt-0 pt-24 ">
            <div className=" min-w-96 text-ellipsis xl:block xl:static flex xl:mr-4 p-4 xl:overflow-x-visible overflow-x-auto ">
              {periodEventsPDFs.map((card: any, index: number) => (
                <div
                  key={index}
                  className={`p-4 px-8 cursor-pointer flex justify-between gap-x-5 xl:gap-x-0 font-semibold items-center whitespace-normal break-words flex-shrink-0 rounded-3xl ${
                    index === currentIndex
                      ? "bg-orange-100 hover:bg-orange-100"
                      : "hover:bg-gray-200"
                  }`}
                  onClick={() => {
                    router.replace(`/${history}/${period}/${section}/${index}`);
                    setCurrentIndex(index);
                    setPDFSource(
                      `/${history}/${period}/${section}/${index}.pdf`
                    );
                  }}
                >
                  <div className="font-Nokia">{card.name}</div>
                  <Link
                    id="download-button"
                    className=" w-1/3 flex justify-end z-10 "
                    href={`/${history}/${period}/${section}/${index}.pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={`${card.name}.pdf`}
                  >
                    <div className="hover:bg-black/25 p-2 rounded-full">
                      {/* <Image
                        src="/downloads.png"
                        alt="Download"
                        width={20}
                        height={20}
                      /> */}
                      <DownloadCloud />
                    </div>
                  </Link>
                </div>
              ))}
            </div>
            <div className="w-full">
              <Sample filename={pdfSource} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default PDFComponent;
