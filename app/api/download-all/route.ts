import { promises as fs } from "fs";
import JSZip from "jszip";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import jsonData from "../../../public/data.json";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const dir = url.searchParams.get("dir");

  // Ensure the directory path is a string and sanitize it
  if (typeof dir !== "string") {
    return NextResponse.json(
      { error: "Invalid directory path" },
      { status: 400 }
    );
  }

  // Ensure the directory is within the public folder to prevent directory traversal attacks
  const directoryPath = path.join(process.cwd(), "public", dir);

  var split = dir.split("/");

  const zip = new JSZip();

  try {
    var history = split[1];
    var period = split[2];
    var section = split[3];
    const currentHistory = jsonData.data.filter((h) =>
      h.url.includes(history!)
    )[0];
    const tempPeriod = currentHistory?.histories.find(
      (p) => p.folderName === period
    );
    // console.log('tempPeriod', tempPeriod)
    // console.log('period', period)
    // console.log('history', history)
    // console.log('dir', dir)

    const tempEvent = tempPeriod!.subFolders.find(
      (p) => p.folderName === section
    );
    var count = 0;
    const files = await fs.readdir(directoryPath);
    for (const file of files) {
      const filePath = path.join(directoryPath, file);
      const data = await fs.readFile(filePath);
      var filename = `${tempEvent?.pdfs[count]!.name}.pdf`;
    //   console.log("filename", filename);
      zip.file(filename!, data);
      count++;
    }

    const content = await zip.generateAsync({ type: "nodebuffer" });
    const response = new NextResponse(content, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": "attachment; filename=all_files.zip",
      },
    });
    return response;
  } catch (err) {
    console.log("err", err);
    return NextResponse.json(
      { error: "Failed to generate zip file" },
      { status: 500 }
    );
  }
}

// export const config = {
//   api: {
//     bodyParser: false, // Disabling body parsing as it's not required
//   },
// };
