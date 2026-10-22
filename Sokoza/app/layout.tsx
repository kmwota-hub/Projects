import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title:"Sokoza — What do you need in Juja?",
  description:"Juja's local demand discovery and commerce platform.",
  manifest:"/manifest.webmanifest"
};
export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en"><body>{children}</body></html>;
}
