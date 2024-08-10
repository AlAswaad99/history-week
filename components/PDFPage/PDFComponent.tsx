"use client";
import {
  ChevronDownIcon,
  DownloadCloud,
  Home,
  ListCollapse,
  Share2Icon,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTrigger,
} from "../../components/ui/drawer";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import jsonData from "../../public/data.json";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
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
  const [isloading, setisLoading] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

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
  }, [period, section, id]);

  const handleDownloadAll = async (directory: string) => {
    setisLoading(true);
    const response = await fetch(
      `/api/download-all?dir=${encodeURIComponent(directory)}`
    );
    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = section + ".zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("ትዕዛዝዎ ተሳክቷል");

      setisLoading(false);
    } else {
      console.error("Failed to download files");
      toast.error("ትዕዛዝዎ አልተሳካም");

      setisLoading(false);
    }
  };

  console.log("periodInfo", periodInfo);
  console.log("periodEvent", periodEvent);
  console.log("periodEventsPDFss", periodEventsPDFs);
  return (
    <>
      {periodInfo && periodEvent && periodEventsPDFs && (
        <div className="w-full mt-28">
          <Breadcrumb className="w-full flex justify-start md:mb-8 pl-4 md:pl-0">
            <BreadcrumbList className="w-full">
              <BreadcrumbItem className="sm:flex hidden">
                {/* <BreadcrumbEllipsis /> */}
                {isDesktop && (
                  <BreadcrumbLink href="/">
                    <Home />
                  </BreadcrumbLink>
                )}
                {!isDesktop && <BreadcrumbEllipsis />}
              </BreadcrumbItem>
              <BreadcrumbSeparator className="sm:flex hidden" />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/${history}`}>
                  {/* {currentHistory?.name} */}
                  {isDesktop && currentHistory?.name}
                  {!isDesktop && <BreadcrumbEllipsis />}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/${history}/${period}`}>
                  {periodInfo.title}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {/* <BreadcrumbPage>{periodEventsPDFs[id].name}</BreadcrumbPage> */}
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-1 text-ellipsis text-[#1e1b47]">
                    {periodEventsPDFs[id].name}
                    <ChevronDownIcon />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {periodEventsPDFs.map((card: any, index: number) => (
                      <DropdownMenuItem
                        key={index}
                        onClick={() => {
                          router.push(
                            `/${history}/${period}/${section}/${index}`
                          );
                        }}
                        className={
                          card.name === periodEventsPDFs[id].name
                            ? "text-[#1e1b47]"
                            : ""
                        }
                      >
                        {card.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex min-h-screen flex-col xl:flex-row w-full mx-auto  ">
            <div className="flex flex-col xl:flex-row w-full h-full xl:pt-0">
              <div className=" min-w-96 text-ellipsis xl:block xl:sticky xl:top-28 hidden xl:mr-4 xl:overflow-x-visible overflow-x-auto  items-stretch h-1/2 ">
                <div className=" py-4 px-4 rounded-3xl bg-white">
                  {periodEventsPDFs.map((card: any, index: number) => (
                    <div
                      key={index}
                      className={` p-4 px-4 cursor-pointer flex justify-between gap-x-5 xl:gap-x-0 font-semibold items-center whitespace-normal break-words flex-shrink-0 rounded-3xl ${
                        index === currentIndex
                          ? "bg-[#1e1b47]/20 hover:bg-[#1e1b47]/20"
                          : "hover:bg-gray-200"
                      }`}
                      onClick={() => {
                        router.replace(
                          `/${history}/${period}/${section}/${index}`
                        );
                        setCurrentIndex(index);
                        setPDFSource(
                          `/${history}/${period}/${section}/${index}.pdf`
                        );
                      }}
                    >
                      <div className="font-sans">{card.name}</div>
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
                  <Button
                    className="rounded-3xl w-full mt-4 mb-0 py-5 bg-[#1e1b47]"
                    disabled={isloading}
                    onClick={() => {
                      handleDownloadAll(`/${history}/${period}/${section}`);
                    }}
                  >
                    ሁሉንም አውርድ {isloading ? "..." : ""}
                  </Button>
                </div>
              </div>
              <Drawer>
                <div className="xl:hidden sticky flex justify-between bottom-10 right-0 top-[calc(100vh-4rem)] z-50 w-full px-4 mb-2">
                  <div className="flex justify-start w-full gap-1 ">
                    <ShareButton />
                    <Link
                      id="download-button"
                      className=" z-10 p-2 bg-[#1e1b47] text-white  rounded-full "
                      href={`/${history}/${period}/${section}/${id}.pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={`${periodEventsPDFs[id].name}.pdf`}
                    >
                      <div className="hover:bg-black/25 p-2 rounded-full text-xs">
                        {/* <Image
                        src="/downloads.png"
                        alt="Download"
                        width={20}
                        height={20}
                      /> */}
                        <DownloadCloud size={20} />
                      </div>
                    </Link>
                  </div>

                  <DrawerTrigger className="py-2 px-10 flex items-center gap-x-1 bg-[#1e1b47] text-xs text-white rounded-full">
                    <ListCollapse size={20}/>
                    ማውጫ
                  </DrawerTrigger>
                </div>
                <DrawerContent>
                  <DrawerHeader>
                    {periodEventsPDFs.map((card: any, index: number) => (
                      <div
                        key={index}
                        className={`p-4 px-8 cursor-pointer text-start flex flex-1 justify-between gap-x-5 xl:gap-x-0 font-semibold items-center whitespace-normal break-words flex-shrink-0 rounded-3xl ${
                          index === currentIndex
                            ? "bg-[#1e1b47]/20 hover:bg-[#1e1b47]/20"
                            : "hover:bg-gray-200"
                        }`}
                        onClick={() => {
                          router.replace(
                            `/${history}/${period}/${section}/${index}`
                          );
                          setCurrentIndex(index);
                          setPDFSource(
                            `/${history}/${period}/${section}/${index}.pdf`
                          );
                        }}
                      >
                        <div className="font-sans w-full ">{card.name}</div>
                        <Link
                          id="download-button"
                          className=" flex justify-end z-10 "
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
                    {/* <DrawerTitle>Are you absolutely sure?</DrawerTitle>
                  <DrawerDescription>
                    This action cannot be undone.
                  </DrawerDescription> */}
                  </DrawerHeader>
                  <DrawerFooter>
                    <Button
                      className="rounded-3xl py-5 bg-[#1e1b47]"
                      disabled={isloading}
                      onClick={() => {
                        handleDownloadAll(`/${history}/${period}/${section}`);
                      }}
                    >
                      ሁሉንም አውርድ {isloading ? "..." : ""}
                    </Button>
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>

              <div className="w-full  -mt-10 md:-mt-0">
                <Sample filename={pdfSource} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const ShareButton = () => {
  const router = useRouter();
  const [copySuccess, setCopySuccess] = useState("");

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentUrl).then(
      () => {
        setCopySuccess("Link copied!");
        setTimeout(() => setCopySuccess(""), 2000);
      },
      (err) => {
        console.error("Failed to copy: ", err);
      }
    );
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: document.title,
          text: "Check out this link:",
          url: currentUrl,
        });
      } catch (err) {
        console.error("Error sharing: ", err);
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <button
      className="bg-[#1e1b47] text-white  py-2 px-4 rounded-full shadow-md flex items-center"
      onClick={shareLink}
    >
      <Share2Icon size={20} />
      {}
    </button>
    // {copySuccess && (
    //   <span className="ml-4 text-green-500">{copySuccess}</span>
    // )}
  );
};

export default PDFComponent;
