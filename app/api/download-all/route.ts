import JSZip from "jszip";
import { NextRequest, NextResponse } from "next/server";
import jsonData from "../../../public/data.json";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const dir = url.searchParams.get("dir");

  if (typeof dir !== "string") {
    return NextResponse.json(
      { error: "Invalid directory path" },
      { status: 400 }
    );
  }

  const split = dir.split("/");

  const zip = new JSZip();

  try {
    const history = split[1];
    const period = split[2];
    const section = split[3];
    const currentHistory = jsonData.data.filter((h) =>
      h.url.includes(history!)
    )[0];
    const tempPeriod = currentHistory?.histories.find(
      (p) => p.folderName === period
    );
    const tempEvent = tempPeriod!.subFolders.find(
      (p) => p.folderName === section
    );

    const baseUrl = `${url.origin}${dir}`;

    for (const pdf of tempEvent!.pdfs) {
      const pdfUrl = `${baseUrl}/${pdf.index}.pdf`;
      const response = await fetch(pdfUrl);
      if (!response.ok) continue;
      const data = await response.arrayBuffer();
      zip.file(`${pdf.name}.pdf`, new Uint8Array(data));
    }

    const content = await zip.generateAsync({ type: "blob" });
    return new NextResponse(content, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": "attachment; filename=all_files.zip",
      },
    });
  } catch (err) {
    console.log("err", err);
    return NextResponse.json(
      { error: "Failed to generate zip file" },
      { status: 500 }
    );
  }
}
