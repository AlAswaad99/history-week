import { motion } from "framer-motion";

// Gradient/shimmer variants matching the location page aesthetic.
// Extend this list for more gradient types (e.g. 'cyan', 'emerald').
export type PageScrollerVariant = "default" | "shimmer";

const VARIANT_STYLES: Record<
  PageScrollerVariant,
  {
    trackClass: string;
    trackStyle?: React.CSSProperties;
    dotClass: string;
    dotStyle?: React.CSSProperties;
  }
> = {
  default: {
    trackClass: "border-2 border-secondary",
    dotClass: "bg-white",
  },
  shimmer: {
    trackClass: "border-0 overflow-visible",
    trackStyle: {
      background:
        "linear-gradient(135deg, #0d0a1a 0%, #0d0a1a 100%)",
      boxShadow:
        "inset 0 0 0 2px transparent, 0 0 24px rgba(245,158,11,0.15)",
    },
    dotClass: "",
    dotStyle: {
      background:
        "linear-gradient(135deg, #f59e0b 0%, #fde68a 30%, #d97706 55%, #fbbf24 75%, #f59e0b 100%)",
      backgroundSize: "200% auto",
      animation: "shimmer-gradient 5s ease-in-out infinite",
      boxShadow: "0 0 20px rgba(251,191,36,0.4)",
    },
  },
};

interface PageScrollerProps {
  next: string;
  direction: string;
  /** Visual variant: 'default' or 'shimmer' (gradient + shimmer like location hero). */
  variant?: PageScrollerVariant;
}

const PageScroller = ({ next, direction, variant = "default" }: PageScrollerProps) => {
  const styles = VARIANT_STYLES[variant];
  const isShimmer = variant === "shimmer";

  return (
    <div className={`${direction !== "up" ? "xs:bottom-5" : "xs:bottom-2"}`}>
      {direction === "down" && (
        <div className="h-16 cursor-pointer">
          {/* Gradient border wrapper for shimmer: outer div is the gradient "border" */}
          {isShimmer ? (
            <div
              className="w-[calc(1.75rem+4px)] h-[calc(4rem+4px)] rounded-3xl p-[2px] flex justify-center"
              style={{
                background:
                  "linear-gradient(135deg, #f59e0b 0%, #fde68a 30%, #d97706 55%, #fbbf24 75%, #f59e0b 100%)",
                backgroundSize: "200% auto",
                animation: "shimmer-gradient 5s ease-in-out infinite",
                boxShadow: "0 0 28px rgba(245,158,11,0.25)",
              }}
            >
              <div
                className="w-7 h-16 rounded-[22px] flex justify-center items-center"
                style={{
                  background: "rgba(13,10,26,0.98)",
                }}
              >
                <motion.div
                  animate={{ y: [0, 35, 0] }}
                  transition={{
                    duration: 1.7,
                    repeat: Infinity,
                    repeatType: "loop",
                    ease: "easeInOut",
                  }}
                  className="w-3 h-3 -mt-8 rounded-full"
                  style={styles.dotStyle}
                />
              </div>
            </div>
          ) : (
            <div
              className={`w-7 z-50 h-16 rounded-3xl flex justify-center items-center p-2 ${styles.trackClass}`}
              style={styles.trackStyle}
            >
              <motion.div
                animate={{ y: [0, 35, 0] }}
                transition={{
                  duration: 1.7,
                  repeat: Infinity,
                  repeatType: "loop",
                  ease: "easeInOut",
                }}
                className={`w-3 h-3 -mt-8 rounded-full ${styles.dotClass}`}
                style={styles.dotStyle}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PageScroller;
