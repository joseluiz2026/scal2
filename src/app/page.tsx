import type { Metadata } from "next";
import HomeClient from "@/components/HomeClient";

// Manifest is scoped to this route (not the root layout) so the PWA install
// prompt only ever triggers on the login/app screen, never on /parceiros.
export const metadata: Metadata = {
  manifest: "/manifest.json",
};

export default function Home() {
  return <HomeClient />;
}
