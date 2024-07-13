import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { MantineProvider } from "@mantine/core";
import "@mantine/dropzone/styles.css";
import Providers from "./providers";
import { getSession } from "@/lib/auth";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nimbus",
  description: "Get your images from Cloud",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  return (
    <html lang="en">
      <Providers session={session}>
        <body className={inter.className}>
          <MantineProvider>{children}</MantineProvider>
        </body>
      </Providers>
    </html>
  );
}
