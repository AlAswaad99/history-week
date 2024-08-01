import { motion } from "framer-motion";

const PageScroller = ({ next, direction }: { next: string; direction: string;}) => {
  return (
    <div className={`${direction !== "up" ? "xs:bottom-5" : "xs:bottom-2"} `}>
      {/* {direction === "up" && (
        <Link href={previous} className={`h-16`}>
          <div className="w-7 h-12 rounded-3xl border-2 border-secondary  flex justify-center items-center p-2">
            <motion.div
              animate={{
                y: [0, -12, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: "loop",
                // ease: [0.17, 0.67, 0.83, 0.67],
              }}
              className={`w-2 h-2 rounded-full bg-secondary `}
            />
          </div>
        </Link>
      )} */}
      {direction === "down" && (
        // <a href={href}>
        //   <div className="w-12 h-17 rounded-3xl border-2 border-secondary  flex justify-center items-start p-2">
        //     <motion.div
        //       animate={{
        //         x: [0, -22, 0],
        //       }}
        //       transition={{
        //         duration: 1.5,
        //         repeat: Infinity,
        //         repeatType: "loop",
        //         // ease: [0.17, 0.67, 0.83, 0.67],
        //       }}
        //       className="w-2 h-2 rounded-full bg-secondary ml-5 "
        //     />
        //   </div>
        // </a>
        <div className="h-16 cursor-pointer">
          <div className="w-7 z-50 h-20 rounded-3xl border-2 border-secondary flex justify-center items-center p-2">
            <motion.div
              animate={{
                y: [0, 31, 0],
              }}
              transition={{
                duration: 1.3,
                repeat: Infinity,
                repeatType: "loop",
                ease: [0.17, 0.67, 0.83, 0.67],
              }}
              className={`w-2 h-2 rounded-full bg-white `}
            />
          </div>
        </div>
      )}
      {/* {direction === "both" && (
        <>
          <Link href={previous} className="h-16">
            <div className="w-7 h-12 rounded-3xl border-2 border-secondary  flex justify-center items-center p-2">
              <motion.div
                animate={{
                  y: [0, -12, 0],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "loop",
                  // ease: [0.17, 0.67, 0.83, 0.67],
                }}
                className={`w-2 h-2 rounded-full bg-secondary `}
              />
            </div>
          </Link>
          <Link href={next} className="h-16">
            <div className="w-7 h-12 rounded-3xl border-2 border-secondary  flex justify-center items-center p-2">
              <motion.div
                animate={{
                  y: [0, 12, 0],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "loop",
                  // ease: [0.17, 0.67, 0.83, 0.67],
                }}
                className={`w-2 h-2 rounded-full bg-secondary `}
              />
            </div>
          </Link>
        </>
      )} */}
    </div>
  );
};

export default PageScroller;