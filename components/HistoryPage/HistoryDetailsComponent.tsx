"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

export default function HistoryDetailComponent({
  history,
  url,
}: {
  history: any;
  url: string;
}) {
  useEffect(() => {
    const handleRouteChange = () => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    };
    handleRouteChange();
  }, []);

  return (
    <>
      {history && (
        <motion.div
          layoutId={`card-${history.url}`}
          className="lg:p-4 rounded-3xl lg:bg-white "
        >
          <div className="flex lg:flex-row flex-col">
            <div className="rounded-3xl w-full">
              <Image
                src={history.thumbnail}
                alt={history.name}
                width={1200}
                height={1200}
                className="w-full rounded-3xl"
              />
            </div>
            <div className="lg:px-6 px-2 my-2 w-full">
              <div className="font-bold text-4xl font-habesha-bold">
                {history.name}
              </div>
              <div className="text-sm mt-2">
                <span className="font-yanon font-semibold">{history.date}</span>
              </div>
              <p className="text-gray-700 text-base mt-4 font-droid">
                {history.description.split("<br/>")[0]}
              </p>
              <p className="text-gray-700 text-base mt-4 font-droid">
                {history.description.split("<br/>")[1]}
              </p>
              <div className="w-1/3 lg:mt-8 mt-2 py-2 rounded-3xl text-center bg-[#1e1b47] text-white">
                <Link
                  href={`/${url}/${history.histories[0].folderName}`}
                  className=" "
                >
                  <p>ይጎብኙ</p>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
}

// // Fetch data for the page
// export async function getStaticProps(context: any) {
//   // Replace with your data fetching logic
//   const data = {
//     img: "path_to_image",
//     title: "Sample Title",
//     description: "Sample Description",
//     date: "Sample Date",
//   };

//   return {
//     props: data,
//   };
// }

// // Define static paths for the page
// export async function getStaticPaths() {
//   // Replace with your paths fetching logic
//   return {
//     paths: [
//       { params: { id: '1' } },
//       { params: { id: '2' } },
//     ],
//     fallback: false,
//   };
// }
