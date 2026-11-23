import { redirect } from "next/navigation";

export default function ProviderRequestsRedirect() {
  redirect("/dashboard/provider");
}
