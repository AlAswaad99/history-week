import { redirect } from "next/navigation";
import jsonData from "../../../../public/data.json";

export default function SectionPage({
  params,
  searchParams,
}: {
  params: { history: string; period: string; section: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // const router = useRouter();
  console.log("params", params);

  const { history, period, section } = params;

  const currentHistory = jsonData.data.filter((h) => h.url.includes(history));
  if (currentHistory.length === 0) {
    redirect("/");
  }

  const folderName = period?.replace("/", "");
  const tempSection = currentHistory[0]?.histories.find(
    (p) => p.folderName === folderName
  );
  if (!tempSection) {
    redirect("/");
  }

  if (tempSection) {
    // console.log("in here");
    // const redirecteHistory();
    redirect(`/${history}/${period}/${section}/0`);
  }
  //   else if (session?.user.type === "client") router.push("/dashboard/orders");
  return <></>;
}
