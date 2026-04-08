import type { Metadata } from "next";
import { BookingFlow } from "@/components/book-call/BookingFlow";

export const metadata: Metadata = {
  title: "Book a Strategy Call",
  description:
    "Schedule your free 30-minute AI strategy session with Deluxify. Secure your slot with a fully refundable deposit.",
};

export default function BookCallPage() {
  return <BookingFlow />;
}
