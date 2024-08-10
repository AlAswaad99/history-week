"use client";

import { useResizeObserver } from "@wojtekmaj/react-hooks";
import { useCallback, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

import "./Sample.css";

import type { PDFDocumentProxy } from "pdfjs-dist";
import Spinner from "../Blocks/Spinner";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

const options = {
  cMapUrl: "/cmaps/",
  standardFontDataUrl: "/standard_fonts/",
};

const resizeObserverOptions = {};

const maxWidth = 1800;

type PDFFile = string | File | null;

export default function Sample({ filename }: { filename: string }) {
  const [file, setFile] = useState<PDFFile>(
    filename || "/early-history/introduction/1.pdf"
  );
  const [numPages, setNumPages] = useState<number>();
  const [containerRef, setContainerRef] = useState<HTMLElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>();

  const onResize = useCallback<ResizeObserverCallback>((entries) => {
    const [entry] = entries;

    if (entry) {
      setContainerWidth(entry.contentRect.width);
    }
  }, []);

  useResizeObserver(containerRef, resizeObserverOptions, onResize);

  function onFileChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const { files } = event.target;

    const nextFile = files?.[0];

    if (nextFile) {
      setFile(nextFile);
    }
  }

  function onDocumentLoadSuccess({
    numPages: nextNumPages,
  }: PDFDocumentProxy): void {
    setNumPages(nextNumPages);
  }

  return (
    <div className="Example pb-16">
      {/* <header>
        <h1>react-pdf sample page</h1>
      </header> */}
      <div className="Example__container">
        {/* <div className="Example__container__load">
          <label htmlFor="file">Load from file:</label>{" "}
          <input id="file" onChange={onFileChange} type="file" />
        </div> */}
        <div className="w-full" ref={setContainerRef}>
          <Document
            file={file}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={<Spinner />}
            options={options}
            className="flex flex-col justify-center items-center min-h-screen"
          >
            {Array.from(new Array(numPages), (el, index) => (
              <Page
                key={`page_${index + 1}`}
                pageNumber={index + 1}
                loading={<Spinner />}
                width={
                  containerWidth && containerWidth > maxWidth
                    ? maxWidth
                    : containerWidth
                }
                className="bg-green-400 lg:mb-4 mb-2 rounded-3xl "
                _className="rounded-3xl"
                // _className="text-red"
              />
            ))}
          </Document>
        </div>
      </div>
    </div>
  );
}
