import { Images, InfoIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed lg:px-20 px-4 top-0 z-50 py-4 bg-[#1e1b47]/90 backdrop-blur-sm text-white left-0 right-0 self-center flex justify-between rounded-b-3xl">
      <div className="w-full flex max-w-screen-2xl mx-auto items-center justify-between">
        <Link className="bg-white rounded-full max-w-16 lg:min-h-12 min-h-12" href="/">
          <div className="p-2">
            <Image
              src="/logo.png"
              alt="mkc logo"
              loading="lazy"
              width={200}
              height={200}
              className="object-fill lg:h-12 h-10 ml-0.5 w-full"
            />
          </div>
        </Link>
        <div className="flex gap-6 flex-row-reverse items-center">
        <Link href="/gallery">
          <Images size={30} />
        </Link>
        <Link href="/about">
          <InfoIcon size={30} />
        </Link>
        </div>
       
      </div>
    </nav>
  );
}
