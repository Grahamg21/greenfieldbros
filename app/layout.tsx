import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Greenfield Bros",
  description: "Gaming, golf, and tech — the Greenfield Bros.",
  metadataBase: new URL("https://greenfieldbros.com"),
  openGraph: {
    title: "Greenfield Bros",
    description: "Gaming, golf, and tech — the Greenfield Bros.",
    url: "https://greenfieldbros.com",
    siteName: "Greenfield Bros",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
