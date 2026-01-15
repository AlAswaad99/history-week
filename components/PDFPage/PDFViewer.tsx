"use client";

import { useResizeObserver } from "@wojtekmaj/react-hooks";
import { useCallback, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

import "./Sample.css";

import type { PDFDocumentProxy } from "pdfjs-dist";
import Spinner from "../Blocks/Spinner";

if (typeof Promise.withResolvers === 'undefined') {
  if (window)
      // @ts-expect-error This does not exist outside of polyfill which this is doing
      window.Promise.withResolvers = function () {
          let resolve, reject;
          const promise = new Promise((res, rej) => {
              resolve = res;
              reject = rej;
          });
          return { promise, resolve, reject };
      };
}

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

const options = {
  cMapUrl: "/cmaps/",
  standardFontDataUrl: "/standard_fonts/",
};

const resizeObserverOptions = {};

const maxWidth = 1800;

type PDFFile = string | File | null;

export default function PDFViewer({ filename }: { filename: string }) {
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
                className="bg-green-400 lg:mb-4 mb-2 rounded-3xl shadow-md "
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

// "use client";

// import { useEffect, useState } from "react";
// import { Document, Page, pdfjs } from "react-pdf";

// import "react-pdf/dist/esm/Page/AnnotationLayer.css";
// import "react-pdf/dist/esm/Page/TextLayer.css";

// import "./Sample.css";

// // Set the PDF.js worker source
// pdfjs.GlobalWorkerOptions.workerSrc = new URL(
//   "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
//   import.meta.url
// ).toString();

// const options = {
//   cMapUrl: "/cmaps/",
//   standardFontDataUrl: "/standard_fonts/",
// };

// const resizeObserverOptions = {};

// const maxWidth = 1800;

// const PDFViewer = ({ filename }: { filename: string }) => {
//   const [file, setFile] = useState<PDFFile>(
//     filename || "/early-history/introduction/1.pdf"
//   );
//   const [isIos, setIsIos] = useState(false);
//   const [images, setImages] = useState<string[]>([]);
//   const [renderAsImages, setRenderAsImages] = useState(false);
//   const [pdf, setPdf] = useState<any>(null);
//   const [totalPages, setTotalPages] = useState<number>(0);
//   useEffect(() => {
//     const platform = navigator.platform.toLowerCase();
//     console.log('platform', platform)
//     if (
//       platform.includes("iphone") ||
//       platform.includes("ipad") ||
//       platform.includes("ipod")
//     ) {
//       setIsIos(true);
//     } else if (platform.includes("android")) {
//       setIsIos(false);
//     } else {
//       setIsIos(false);
//     }
//   }, []);

//   // Function to handle fallback to image rendering in case of failure
//   const fallbackToImageRendering = async () => {
//     setRenderAsImages(true);
//     try {
//       const pdfDocument = await pdfjs.getDocument({ url: filename }).promise;
//       setPdf(pdfDocument);
//     } catch (error) {
//       console.error("Error loading PDF for image rendering:", error);
//     }
//   };

//   // Function to render PDF as images
//   const renderPdfAsImages = async () => {
//     const imagesList: string[] = [];
//     const canvas = document.createElement("canvas");

//     for (let i = 1; i <= pdf.numPages; i++) {
//       const page = await pdf.getPage(i);
//       const viewport = page.getViewport({ scale: 2 });
//       canvas.height = viewport.height;
//       canvas.width = viewport.width;

//       const renderContext = {
//         canvasContext: canvas.getContext("2d")!,
//         viewport: viewport,
//       };

//       await page.render(renderContext).promise;
//       const img = canvas.toDataURL("image/png");
//       imagesList.push(img);
//     }

//     setImages(imagesList);
//     setTotalPages(pdf.numPages);
//   };

//   useEffect(() => {
//     if (renderAsImages && pdf) {
//       renderPdfAsImages();
//     }
//   }, [renderAsImages, pdf]);

//   return (
//     <div className="pdf-viewer">
//       {!renderAsImages && (
//         <Document
//           file={filename}
//           onLoadSuccess={({ numPages }) => setTotalPages(numPages)}
//           onLoadError={(error) => {
//             console.error("Error loading PDF with react-pdf:", error);
//             fallbackToImageRendering();
//           }}
//         >
//           {Array.from({ length: totalPages }, (_, index) => (
//             <Page key={`page_${index + 1}`} pageNumber={index + 1} />
//           ))}
//         </Document>
//       )}

//       {renderAsImages && (
//         <div>
//           {images.map((image, index) => (
//             <div key={index} className="pdf-page-image">
//               <img src={image} alt={`Page ${index + 1}`} />
//               <div className="page-info">
//                 Page {index + 1} of {totalPages}
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default PDFViewer;
