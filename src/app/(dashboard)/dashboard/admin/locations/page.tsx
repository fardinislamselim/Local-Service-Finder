import { redirect } from "next/navigation";

export default function AdminLocationsRedirect() {
  redirect("/dashboard/admin");
}
