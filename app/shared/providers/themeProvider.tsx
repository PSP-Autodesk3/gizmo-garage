"use client";
// Here is the general ref I used for implementing the theme provider: https://staticmania.com/blog/guide-to-creating-a-darklight-mode-toggle-in-next-js

import { ThemeProvider as NextThemeProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";

export default function ThemeProvider({ children, ...props }: ThemeProviderProps) {
    return <NextThemeProvider {...props}>{children}</NextThemeProvider>;
}