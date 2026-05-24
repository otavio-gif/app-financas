import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/get-user";

export default async function Home() {
  const user = await getUser();
  redirect(user ? "/dashboard" : "/login");
}
