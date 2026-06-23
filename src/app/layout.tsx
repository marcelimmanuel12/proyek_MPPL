import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "SehatKu — Monitoring Kesehatan Berkelanjutan dengan AI",
  description:
    "Platform monitoring kesehatan personal dengan AI: pengingat obat, konsultasi gejala, komunitas, dan peta rumah sakit.",
  openGraph: {
    title: "SehatKu — Monitoring Kesehatan Berkelanjutan dengan AI",
    description:
      "Platform monitoring kesehatan personal dengan AI: pengingat obat, konsultasi gejala, komunitas, dan peta rumah sakit.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SehatKu — Monitoring Kesehatan Berkelanjutan dengan AI",
    description:
      "Platform monitoring kesehatan personal dengan AI: pengingat obat, konsultasi gejala, komunitas, dan peta rumah sakit.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Manrope:wght@300;400;500;600;700&display=swap"
        />
      </head>
      <body>
        <Providers>
          {children}
          <Toaster richColors position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
