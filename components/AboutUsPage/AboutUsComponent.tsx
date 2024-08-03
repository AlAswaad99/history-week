import Image from "next/image";
import Link from "next/link";

const AboutUsComponent = () => {
  return (
    <div className="bg-gray-200 md:pt-0 min-h-screen flex lg:flex-row flex-col lg:justify-center mt-24 lg:mt-0 items-center">
      <div className=" relative w-full lg:h-screen bg-red-400">
        {/* <div className="absolute inset-0 bg-black opacity-50"></div> */}

        <div className="w-full h-full">
          <Image
            src="/GQ8A9171.jpg" // Replace with your image URL or path
            alt="Church Image"
            width={1200}
            height={800}
            className="w-full h-full lg:object-cover object-cover shadow-lg"
          />
        </div>
      </div>

      <div className="w-full p-4 ">
        <div className="p-6 h-3/4 flex flex-col justify-center lg:pr-32">
          <p className="lg:text-2xl font-droid">
            በቤቴል የዓለም ብርሃን መሠረተ ክርስቶስ አጥቢያ ቤተክርስቲያን፤{" "}
            <br className="hidden lg:block" />
            በወጣቶች የአገልግሎት ዘርፍ አስተባባሪነት ፤ በወጣቶች አገልግሎት የትምህርት ዝግጅት ክፍል{" "}
            <span className="font-Nokia font-semibold">(Bible Team)</span>{" "}
            የተዘጋጀ።
          </p>

          <div className="flex gap-8 mt-8 text-3xl items-center w-full lg:justify-start justify-center">
            <Link
              href="https://www.instagram.com/byb_bibleteam?igsh=dXgxOWxtdWoweGFm"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1e1b47] hover:underline text-xl"
            >
              <Image src={"/insta.svg"} alt="instagram" width={40} height={40}/>
            </Link>
            <Link
              href="https://fb.watch/m_DT72_uom/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1e1b47] hover:underline text-xl"
            >
              <Image src={"/facebook.svg"} alt="facebook" width={40} height={40}/>{" "}
            </Link>
            <Link
              href="https://youtube.com/@bethelmkc?si=qVVqiPFnphfCui_c"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1e1b47] hover:underline text-xl"
            >
              <Image src={"/youtube.svg"} alt="youtube" width={60} height={80}/>{" "}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUsComponent;
