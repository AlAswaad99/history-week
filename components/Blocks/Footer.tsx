import Link from "next/link";

function Footer() {
  //   const [ethiopianDate, setEthiopianDate] = useState({
  //     ethiopianDay: 1,
  //     ethiopianMonth: 1,
  //     ethiopianYear: 2014,
  //   });

  function gregorianToEthiopian(year: number, month: number, day: number) {
    const ethiopianStartYear = 1575; // Ethiopian calendar starts around the year 1900
    const gregorianStartYear = 1583; // Gregorian calendar starts in the year 1583

    // Calculate the number of days between the two calendar systems
    const daysDifference =
      (year - gregorianStartYear) * 365 +
      Math.floor((year - gregorianStartYear) / 4) +
      dayOfYear(year, month, day);

    // Add the days difference to the Ethiopian start year
    const ethiopianYear = ethiopianStartYear + Math.floor(daysDifference / 365);

    // Calculate the Ethiopian month and day
    const ethiopianDayOfYear = daysDifference % 365;
    const ethiopianMonth = Math.floor(ethiopianDayOfYear / 30) + 1;
    const ethiopianDay = (ethiopianDayOfYear % 30) + 1;

    return {
      ethiopianDay: ethiopianDay,
      ethiopianMonth: ethiopianMonth,
      ethiopianYear: ethiopianYear,
    };
  }

  // Function to calculate the day of the year for a given Gregorian date
  function dayOfYear(year: number, month: number, day: number) {
    const daysInMonth = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    if (isLeapYear(year)) {
      daysInMonth[2] = 29; // February has 29 days in a leap year
    }

    let dayOfYear = day;
    for (let i = 1; i < month; i++) {
      dayOfYear += daysInMonth[i]!;
    }

    return dayOfYear;
  }

  // Function to check if a year is a leap year
  function isLeapYear(year: number) {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }

  // Example usage:
  const gregorianDate = new Date(); // January 1, 2022
  const gregorianYear = gregorianDate.getFullYear();
  const gregorianMonth = gregorianDate.getMonth() + 1; // Months are 0-indexed
  const gregorianDay = gregorianDate.getDate();

  const ethiopianDate = gregorianToEthiopian(
    gregorianYear,
    gregorianMonth,
    gregorianDay
  );

  //   setEthiopianDate(ethiopianDate);

  //   useEffect(() => {

  //   }, []);

  return (
    <footer className="bg-[#1e1b47] text-white text-center md:no-underline underline hover:underline p-4 font-Nokia font-thin text-sm">
      <Link href="#">
        &copy; {ethiopianDate.ethiopianYear} ቤቴል የዓለም ብርሃን መሠረተ ክርስቶስ ቤተክርስቲያን
      </Link>
    </footer>
  );
}

export default Footer;
