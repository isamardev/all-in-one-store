import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { CartProvider } from "@/lib/cart";

export const metadata: Metadata = {
  title: "All In One Store",
  description: "Online Shopping Store",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">
        <CartProvider>
          <Toaster position="top-right" />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
