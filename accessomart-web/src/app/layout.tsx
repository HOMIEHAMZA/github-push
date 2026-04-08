import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { GlassNavbar } from "@/components/ui/GlassNavbar";
import { Footer } from "@/components/ui/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Toast } from "@/components/ui/Toast";
import { GuestAuthProvider } from "@/components/providers/GuestAuthProvider";
import { VerificationBanner } from "@/components/auth/VerificationBanner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Accessomart | Premium Electronics & Gaming",
  description: "The digital curator for elite electronics and gaming gear.",
   verification: {
    google: "AHU4OaTJ9YWPB_5Xp_WjTHRMZmSTBHCLvojeTLlDy6c"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} dark antialiased`}
    >
      <body className="bg-surface text-on-surface font-sans min-h-screen flex flex-col">
        <GuestAuthProvider>
          <VerificationBanner />
          <GlassNavbar />
          <main className="flex-1 mt-32">
            {children}
          </main>
          <Footer />
          <CartDrawer />
          <Toast />
        </GuestAuthProvider>
      </body>
    </html>
  );
}
