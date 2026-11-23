import { redirect } from "next/navigation";

export default function PaymentsCancelRedirect() {
  redirect("/payment/failed");
}
