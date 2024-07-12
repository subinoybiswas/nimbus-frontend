import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { MantineProvider } from "@mantine/core";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nimbus",
  description: "Get your images from Cloud",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <MantineProvider>{children}</MantineProvider>
      </body>
    </html>
  );
}
