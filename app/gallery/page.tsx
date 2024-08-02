import { redirect } from "next/navigation";

export default function Page({ params }: { params: { history: string } }) {
  redirect("/");
}
