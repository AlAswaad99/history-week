"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect } from "react";

export default function HistoryDetailComponent({ history }: { history: any }) {
  useEffect(() => {
    const handleRouteChange = () => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    };
    handleRouteChange();
  }, []);

  return (
    <motion.div layoutId={`card-${history.url}`} className="bg-white rounded-3xl py-20 px-10 lg:mt-32 lg:pt-20 pt-32 ">
      <div className="flex lg:flex-row flex-col">
        <div className="rounded-3xl">
          <Image
            src={history.thumbnail}
            alt={history.name}
            width={1200}
            height={1200}
            className="w-full rounded-3xl"
          />
        </div>
        <div className="px-6 my-6">
          <div className="font-bold text-4xl">{history.name}</div>
          <div className="text-sm mt-2">
            <span className="font-yanon font-semibold">{history.date}</span>
          </div>
          <p className="text-gray-700 text-base mt-4 font-droid">
            {history.description}
          </p>
        </div>
      </div>
    </motion.div>
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
