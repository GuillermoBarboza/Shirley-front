import type { Metadata } from "next";
import { Archivo, Newsreader, Petit_Formal_Script } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-archivo",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
});

const petitFormalScript = Petit_Formal_Script({
  subsets: ["latin"],
  weight: "400",
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
