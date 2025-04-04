import type { Metadata } from "next";
import {ThemeProvider} from "@/app/shared/providers/themeProvider";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ThemeSwitcher from "./shared/components/themeSwitcher";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gizmo Garage",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://developer.api.autodesk.com/modelderivative/v2/viewers/7.*/style.min.css" type="text/css"></link>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} 
        antialiased bg-indigo-100 dark:bg-slate-950`}
      >
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ThemeSwitcher />
            {children}
          </ThemeProvider>
      </body>
    </html>
  );
}
