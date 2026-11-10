import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

/*
 * Self-hosted (OFL-1.1 files from Fontsource 5.3.0, latin subset, licences
 * alongside in ./fonts). next/font/google downloads the fonts during
 * `next build`, and Google intermittently answered with URLs Next's loader
 * can't parse, failing Vercel builds at random.
 */
const archivo = localFont({
  src: [
    { path: "./fonts/archivo-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/archivo-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./fonts/archivo-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "./fonts/archivo-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-archivo",
  display: "swap",
  adjustFontFallback: "Arial",
});

const newsreader = localFont({
  src: [
    { path: "./fonts/newsreader-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/newsreader-latin-400-italic.woff2", weight: "400", style: "italic" },
    { path: "./fonts/newsreader-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./fonts/newsreader-latin-500-italic.woff2", weight: "500", style: "italic" },
  ],
  variable: "--font-newsreader",
  display: "swap",
  adjustFontFallback: "Times New Roman",
});

const petitFormalScript = localFont({
  src: "./fonts/petit-formal-script-latin-400-normal.woff2",
  weight: "400",
  style: "normal",
  variable: "--font-script-face",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Panel de administración · Shirley Madero",
  description: "Gestión de obras e información de contacto de Shirley Madero",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // The font variables go on <html>, not <body>: globals.css consumes them
    // from :root, and a custom property referenced where it isn't yet defined
    // makes the whole declaration invalid at computed-value time.
    <html
      lang="es"
      className={`${archivo.variable} ${newsreader.variable} ${petitFormalScript.variable}`}
    >
      <body className="antialiased">{children}</body>
    </html>
  );
}
