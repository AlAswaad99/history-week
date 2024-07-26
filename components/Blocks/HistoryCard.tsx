import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export default function HistoryCard({
  img,
  title,
  description,
  url,
  date,
}: {
  img: string;
  title: string;
  description: string;
  url: string;
  date: string;
}) {
  return (
    <motion.div
      className="hover z-20 rounded-3xl overflow-hidden shadow-lg max-w-96 bg-white"
      transition={{ ease: 'easeInOut', duration: 0.5 }}
      layoutId={`card-${url}`} // Unique identifier for the layout transition
    >
      <Link href={url}>
        <div className="">
          <Image
            src={img}
            alt={title}
            width={1200}
            height={1200}
            className="w-full transition-transform duration-300 transform hover:scale-110 "
          />
        </div>
        <div className="px-6 py-4 items-end h-full">
          <div className={`font-bold lg:text-4xl mt-6 text-2xl flex items-end`}>
            {title}
          </div>
          <div className="md:text-sm text-xs ">
            <span className="font-yanon font-semibold"> {date}</span>
          </div>
          <p className="text-gray-700 text-xs mt-4 font-droid">
            {description}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
