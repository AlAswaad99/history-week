"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { pdfjs } from "react-pdf";

const PdfAsImages = ({ uri }: { uri: string }) => {
  const [images, setImages] = useState<string[]>([]);
  const [pdf, setPdf] = useState<any>(null);
  const [totalPages, setTotalPages] = useState<number>(0);

  // Load the PDF document and set it to state
  useEffect(() => {
    const loadPdf = async () => {
      try {
        const pdfDocument = await pdfjs.getDocument({ url: uri }).promise;
        setPdf(pdfDocument);
      } catch (error) {
        console.error("Error loading PDF for image rendering:", error);
      }
    };

    loadPdf();
  }, [uri]);

  // Convert PDF pages to images one by one and display them as soon as they are ready
  useEffect(() => {
    const renderPdfAsImages = async () => {
      const canvas = document.createElement("canvas");

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2 });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: canvas.getContext("2d")!,
          viewport: viewport,
        };

        await page.render(renderContext).promise;
        const img = canvas.toDataURL("image/png");

        // Update state incrementally to display each image as soon as it's rendered
        setImages((prevImages) => [...prevImages, img]);

        // Optionally, update the totalPages as well
        setTotalPages(pdf.numPages);
      }
    };

    if (pdf) {
      renderPdfAsImages();
    }
  }, [pdf]);

  return (
    <div className="mb-16">
      {images.map((image, index) => (
        <div key={index} className="pdf-page-image">
          <Image
            width={1920}
            height={1080}
            src={image}
            alt={`Page ${index + 1}`}
            className="rounded-3xl shadow-md md:mb-4 mb-2"
          />
          {/* <div className="page-info">
            Page {index + 1} of {totalPages}
          </div> */}
        </div>
      ))}
    </div>
  );
};

export default PdfAsImages;
