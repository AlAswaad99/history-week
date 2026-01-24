"use client";

import dynamic from "next/dynamic";
import Spinner from "../Blocks/Spinner";

// Dynamic import with SSR completely disabled
// This ensures the PDF.js library is NEVER loaded on the server
const PDFViewerClient = dynamic(
  () => import("./PDFViewerClient"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center min-h-[400px]">
            <Spinner />
          </div>
        </div>
      </div>
    ),
  }
);

export default function PDFViewer({ filename }: { filename: string }) {
  return <PDFViewerClient filename={filename} />;
}
