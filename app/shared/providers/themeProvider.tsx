"use client";
// Here is the general ref I used for implementing the theme provider: https://ui.shadcn.com/docs/dark-mode/next

import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({
    children,
    ...props
  }: React.ComponentProps<typeof NextThemesProvider>) {
    return <NextThemesProvider {...props}>{children}</NextThemesProvider>
  }