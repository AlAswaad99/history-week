"use client";
import {
  ChevronDownIcon,
  DownloadCloud,
  Home,
  ListCollapse,
  Share2Icon,
} from "lucide-react";
import dynamic from "next/dynamic";
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
import Spinner from "../Blocks/Spinner";

// Dynamic import to avoid SSR issues
const PDFViewer = dynamic(() => import("./PDFViewer"), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center min-h-[400px]">
      <Spinner />
    </div>
  ),
});

function PDFComponent() {
  const router = useRouter();
  //   const { periodName, eventName, filenumber } = router.query;
  const { history, period, section, id } = useParams<{
    history: string;
    period: string;
    section: string;
    id: string;
  }>();

  // console.log("history", history);
  // console.log("period", period);
  // console.log("section", section);
  // console.log("number", id);
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
  const [isIos, setIsIos] = useState(false);

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

        // console.log("tempPeriod", tempPeriod);

        setPeriodInfo(tempPeriod);
        setPeriodEvent(tempEvent);
        setPeriodEventsPDFs(tempEvent.pdfs);
        setPDFSource(`/${history}/${period}/${section}/${id}.pdf`);
      };

      fetchData();
    }
  }, [period, section, id]);

  useEffect(() => {
    const platform = navigator.platform.toLowerCase();
    console.log("platform", platform);
    if (
      platform.includes("iphone") ||
      platform.includes("ipad") ||
      platform.includes("ipod")
    ) {
      setIsIos(true);
    } else if (platform.includes("android")) {
      setIsIos(false);
    } else {
      setIsIos(false);
    }
  }, []);

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

  // console.log("periodInfo", periodInfo);
  // console.log("periodEvent", periodEvent);
  // console.log("periodEventsPDFss", periodEventsPDFs);
  return (
    <>
      {periodInfo && periodEvent && periodEventsPDFs && (
        <div className="w-full min-h-screen bg-gray-50">
          {/* Header Section with Breadcrumb */}
          <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-4 sm:pb-6">
            <div className="max-w-7xl mx-auto">
              <Breadcrumb className="w-full mb-4 sm:mb-6">
                <BreadcrumbList className="w-full">
                  <BreadcrumbItem className="hidden sm:flex">
                    <BreadcrumbLink href="/" className="hover:text-[#1e1b47] transition-colors">
                      <Home size={18} />
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden sm:flex" />
                  <BreadcrumbItem>
                    <BreadcrumbLink href={`/${history}`} className="hover:text-[#1e1b47] transition-colors">
                      {isDesktop ? currentHistory?.name : <BreadcrumbEllipsis />}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href={`/${history}/${period}`} className="hover:text-[#1e1b47] transition-colors">
                      <span className="truncate max-w-[120px] sm:max-w-none">
                        {periodInfo.title}
                      </span>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="flex items-center gap-1 text-[#1e1b47] hover:text-[#1e1b47]/80 transition-colors">
                        <span className="truncate max-w-[150px] sm:max-w-none">
                          {periodEventsPDFs[id].name}
                        </span>
                        <ChevronDownIcon size={16} />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-64 sm:w-80">
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
                                ? "text-[#1e1b47] bg-[#1e1b47]/5"
                                : "hover:bg-gray-50"
                            }
                          >
                            <span className="truncate">{card.name}</span>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </div>
          {/* Main Content Area */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
              
              {/* Desktop Sidebar */}
              <div className="hidden lg:block lg:w-80 xl:w-96 flex-shrink-0">
                <div className="sticky top-32">
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-[#1e1b47] mb-4 border-b border-gray-100 pb-3">
                      ማውጫ
                    </h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {periodEventsPDFs.map((card: any, index: number) => (
                        <div
                          key={index}
                          className={`group p-3 cursor-pointer flex justify-between items-center rounded-xl transition-all duration-200 ${
                            index === currentIndex
                              ? "bg-[#1e1b47] text-white shadow-md"
                              : "hover:bg-gray-50 hover:shadow-sm"
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
                          <div className="font-medium text-sm flex-1 mr-3 leading-snug">
                            {card.name}
                          </div>
                          <Link
                            id="download-button"
                            className="flex-shrink-0 z-10"
                            href={`/${history}/${period}/${section}/${index}.pdf`}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={`${card.name}.pdf`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className={`p-2 rounded-lg transition-colors ${
                              index === currentIndex 
                                ? "hover:bg-white/20 text-white" 
                                : "hover:bg-gray-200 text-gray-600"
                            }`}>
                              <DownloadCloud size={16} />
                            </div>
                          </Link>
                        </div>
                      ))}
                    </div>
                    
                    <Button
                      className="w-full mt-6 py-3 bg-[#1e1b47] hover:bg-[#1e1b47]/90 text-white rounded-xl font-medium transition-colors"
                      disabled={isloading}
                      onClick={() => {
                        handleDownloadAll(`/${history}/${period}/${section}`);
                      }}
                    >
                      {isloading ? "በመዘገየት ላይ..." : "ሁሉንም አውርድ"}
                    </Button>
                  </div>
                </div>
              </div>
              {/* Mobile Navigation */}
              <Drawer>
                {/* Fixed Mobile Action Bar */}
                <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 px-4 py-3 shadow-lg">
                  <div className="flex items-center justify-between max-w-md mx-auto">
                    <div className="flex gap-2">
                      <ShareButton />
                      <Link
                        id="download-button"
                        className="flex items-center justify-center w-11 h-11 bg-[#1e1b47] text-white rounded-xl shadow-sm hover:bg-[#1e1b47]/90 transition-colors"
                        href={`/${history}/${period}/${section}/${id}.pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={`${periodEventsPDFs[id].name}.pdf`}
                      >
                        <DownloadCloud size={18} />
                      </Link>
                    </div>

                    <DrawerTrigger className="flex items-center gap-2 px-4 py-2.5 bg-[#1e1b47] text-white text-sm font-medium rounded-xl shadow-sm hover:bg-[#1e1b47]/90 transition-colors">
                      <ListCollapse size={18} />
                      ማውጫ
                    </DrawerTrigger>
                  </div>
                </div>
                
                {/* Mobile Drawer Content */}
                <DrawerContent className="max-h-[80vh]">
                  <DrawerHeader className="px-6 py-4 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-[#1e1b47]">ማውጫ</h3>
                  </DrawerHeader>
                  
                  <div className="px-6 py-4 overflow-y-auto max-h-96">
                    <div className="space-y-3">
                      {periodEventsPDFs.map((card: any, index: number) => (
                        <div
                          key={index}
                          className={`p-4 cursor-pointer flex justify-between items-center rounded-xl transition-all ${
                            index === currentIndex
                              ? "bg-[#1e1b47] text-white shadow-md"
                              : "bg-gray-50 hover:bg-gray-100"
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
                          <div className="font-medium text-sm flex-1 mr-3 leading-snug">
                            {card.name}
                          </div>
                          <Link
                            id="download-button"
                            className="flex-shrink-0 z-10"
                            href={`/${history}/${period}/${section}/${index}.pdf`}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={`${card.name}.pdf`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className={`p-2 rounded-lg transition-colors ${
                              index === currentIndex 
                                ? "hover:bg-white/20 text-white" 
                                : "hover:bg-gray-200 text-gray-600"
                            }`}>
                              <DownloadCloud size={16} />
                            </div>
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <DrawerFooter className="px-6 py-4 border-t border-gray-100">
                    <Button
                      className="w-full py-3 bg-[#1e1b47] hover:bg-[#1e1b47]/90 text-white rounded-xl font-medium"
                      disabled={isloading}
                      onClick={() => {
                        handleDownloadAll(`/${history}/${period}/${section}`);
                      }}
                    >
                      {isloading ? "በመዘገየት ላይ..." : "ሁሉንም አውርድ"}
                    </Button>
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>

              {/* PDF Content Area */}
              <div className="flex-1 lg:flex-shrink">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  <PDFViewer filename={pdfSource} />
                </div>
              </div>
            </div>
            
            {/* Mobile bottom spacing to account for fixed action bar */}
            <div className="lg:hidden h-20" />
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
    <div className="relative">
      <button
        className="flex items-center justify-center w-11 h-11 bg-[#1e1b47] text-white rounded-xl shadow-sm hover:bg-[#1e1b47]/90 transition-colors"
        onClick={shareLink}
        title="Share"
      >
        <Share2Icon size={18} />
      </button>
      {copySuccess && (
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
          {copySuccess}
        </div>
      )}
    </div>
  );
};

export default PDFComponent;
