import localFont from "next/font/local";
import Footer from "../components/Blocks/Footer";
import Navbar from "../components/Blocks/Navbar";
import { Toaster } from "../components/ui/sonner";
import "./globals.css";

// const nokiaBold = localFont({ src: "../public/fonts/NokiaBOLD.ttf", variable:"--font-nokia-bold" });
// const nokiaLight = localFont({
//   src: "../public/fonts/NOKIAPUREHEADLINE_ULTRALIGHT.otf",
// });
// const droid = localFont({
//   src: "../public/fonts/DROIDSANSETHIOPIC-REGULAR.ttf",
// });
// const yanon = localFont({
//   src: "../public/fonts/YANONEKAFFEESATZ-REGULAR.ttf",
// });
// const klavika = localFont({ src: "../public/fonts/KLAVIKAREGULAR-OSF.ttf" });

// Define local fonts
const nokiaBold = localFont({
  weight: "400",
  variable: "--font-nokia-bold",
  src: "../public/fonts/nokia-bold.ttf",
});

const nokiaLight = localFont({
  weight: "100",
  variable: "--font-nokia-light",
  src: "../public/fonts/nokia-pure-headline.otf",
});

const droid = localFont({
  weight: "400", // Adjust weight if necessary
  variable: "--font-droid",
  src: "../public/fonts/droid-sans-ethiopic-regular.ttf",
});

const yanon = localFont({
  weight: "400", // Adjust weight if necessary
  variable: "--font-yanon",
  src: "../public/fonts/yanon-kaffee-satz-regular.ttf",
});

const klavika = localFont({
  weight: "400", // Adjust weight if necessary
  variable: "--font-klavika",
  src: "../public/fonts/klavika-regular.ttf",
});

const habeshaDistort = localFont({
  variable: "--font-habesha-distort",
  src: "../public/fonts/habesha-serif-distort.ttf",
});

const habeshaBlack = localFont({
  variable: "--font-habesha-black",
  src: "../public/fonts/habesha-serif-black.ttf",
});

const habeshaBold = localFont({
  variable: "--font-habesha-bold",
  src: "../public/fonts/habesha-serif-bold.ttf",
});

const habeshalight = localFont({
  variable: "--font-habesha-light",
  src: "../public/fonts/habesha-serif-light.ttf",
});

const habeshaOutline = localFont({
  variable: "--font-habesha-outline",
  src: "../public/fonts/habesha-serif-outline.ttf",
});

const habeshaRegular = localFont({
  variable: "--font-habesha-regular",
  src: "../public/fonts/habesha-serif-regular.ttf",
});

const habeshaThin = localFont({
  variable: "--font-habesha-thin",
  src: "../public/fonts/habesha-serif-thin.ttf",
});

const habeshaTypewriter = localFont({
  variable: "--font-habesha-typewriter",
  src: "../public/fonts/habesha-serif-typewriter.ttf",
});

export const metadata = {
  title: "History Week",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-US">
      <body
        className={`${nokiaBold.variable} ${nokiaLight.variable} ${droid.variable} ${yanon.variable} ${klavika.variable} ${habeshaDistort.variable} ${habeshaBlack.variable} ${habeshaBold.variable} ${habeshalight.variable} ${habeshaOutline.variable} ${habeshaRegular.variable} ${habeshaThin.variable} ${habeshaTypewriter.variable} font-sans`}
      >
        <Navbar />
        <Toaster />

        {children}
        <Footer />
      </body>
    </html>
  );
}
