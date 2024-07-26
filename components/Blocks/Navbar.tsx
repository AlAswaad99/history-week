import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="absolute md:px-20 px-10 top-0 z-50 py-4 bg-black/20 text-white left-0 right-0 self-center flex justify-between">
      <div className="w-full flex max-w-screen-2xl mx-auto items-center justify-between">
        <Link className="bg-white rounded-full" href="/">
          <div className="h-12">
            <Image
              src="/logo.png"
              alt="mkc logo"
              loading="lazy"
              width={200}
              height={200}
              className="object-fill h-12 w-full"
            />
          </div>
        </Link>
        <div>Home</div>
      </div>
    </nav>
  );
}
