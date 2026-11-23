import { redirect } from "next/navigation";

export default function PaymentsFailRedirect() {
  redirect("/payment/failed");
}
