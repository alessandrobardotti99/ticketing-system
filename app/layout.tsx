import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/components/auth-provider"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "TicketFlow - Professional Ticketing System",
  description: "Modern ticketing system for managing tasks and support tickets",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function getCookie(name) {
                  const value = '; ' + document.cookie;
                  const parts = value.split('; ' + name + '=');
                  if (parts.length === 2) {
                    const part = parts.pop();
                    if (!part) return null;
                    const cookieValue = part.split(';').shift();
                    return cookieValue || null;
                  }
                  return null;
                }

                function applyTheme() {
                  const storageKey = 'ticketflow-theme';
                  const theme = getCookie(storageKey) || 'system';
                  const root = document.documentElement;
                  
                  root.classList.remove('light', 'dark');
                  
                  if (theme === 'system') {
                    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                    root.classList.add(systemTheme);
                  } else {
                    root.classList.add(theme);
                  }
                }

                // Applica il tema immediatamente quando il documento è pronto
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', applyTheme);
                } else {
                  applyTheme();
                }
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider defaultTheme="system" storageKey="ticketflow-theme">
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}