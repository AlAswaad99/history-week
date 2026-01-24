"use client";

import { useResizeObserver } from "@wojtekmaj/react-hooks";
import { useCallback, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

import "./Sample.css";

import type { PDFDocumentProxy } from "pdfjs-dist";
import Spinner from "../Blocks/Spinner";

// Set up PDF.js worker - use CDN for reliability
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs`;

const options = {
  cMapUrl: "https://unpkg.com/pdfjs-dist@4.4.168/cmaps/",
  standardFontDataUrl: "https://unpkg.com/pdfjs-dist@4.4.168/standard_fonts/",
};

const resizeObserverOptions = {};
const maxWidth = 1800;

type PDFFile = string | File | null;

export default function PDFViewerClient({ filename }: { filename: string }) {
  const [file, setFile] = useState<PDFFile>(
    filename || "/early-history/introduction/1.pdf"
  );
  const [numPages, setNumPages] = useState<number>();
  const [containerRef, setContainerRef] = useState<HTMLElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>();
  const [error, setError] = useState<string | null>(null);

  const onResize = useCallback<ResizeObserverCallback>((entries) => {
    const [entry] = entries;

    if (entry) {
      setContainerWidth(entry.contentRect.width);
    }
  }, []);

  useResizeObserver(containerRef, resizeObserverOptions, onResize);

  function onDocumentLoadSuccess({
    numPages: nextNumPages,
  }: PDFDocumentProxy): void {
    setNumPages(nextNumPages);
    setError(null);
  }

  function onDocumentLoadError(err: Error): void {
    console.error("PDF loading error:", err);
    setError("Failed to load PDF. Please try again.");
  }

  // Show error message if PDF failed to load
  if (error) {
    return (
      <div className="w-full pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col justify-center items-center min-h-[400px] text-center">
            <div className="text-red-500 text-lg font-medium mb-4">{error}</div>
            <button
              onClick={() => {
                setError(null);
                window.location.reload();
              }}
              className="px-4 py-2 bg-[#1e1b47] text-white rounded-lg hover:bg-[#1e1b47]/90 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="w-full" ref={setContainerRef}>
          <Document
            file={file}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={<Spinner />}
            options={options}
            className="flex flex-col justify-center items-center w-full"
          >
            {Array.from(new Array(numPages), (el, index) => (
              <Page
                key={`page_${index + 1}`}
                pageNumber={index + 1}
                loading={<Spinner />}
                width={
                  containerWidth && containerWidth > maxWidth
                    ? maxWidth
                    : containerWidth ? containerWidth - 32 : undefined
                }
                className="mb-4 sm:mb-6 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-200"
              />
            ))}
          </Document>
        </div>
      </div>
    </div>
  );
}
