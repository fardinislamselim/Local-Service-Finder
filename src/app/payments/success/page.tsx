import { redirect } from "next/navigation";

export default function PaymentsSuccessRedirect() {
  redirect("/payment/success");
}
