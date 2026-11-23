import { redirect } from "next/navigation";

export default function ProviderActiveRedirect() {
  redirect("/dashboard/provider");
}
