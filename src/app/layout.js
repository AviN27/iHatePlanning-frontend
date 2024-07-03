import { Inter, Montserrat, Lato, Nunito, Figtree } from "next/font/google";
import localFont from 'next/font/local'
import React from 'react';
// import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const montserrat = Montserrat({ 
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-montserrat"
});

const lato = Lato({ 
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-lato" 
});

const nunito = Nunito({ 
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-nunito" 
});

const figtree = Figtree({ 
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-figtree" 
});

const honkGoogle = localFont({
  src: '../app/assets/Honk-Regular-VariableFont_MORF,SHLN.ttf',
  variable: '--font-honk',
})

export const metadata = {
  title: "ihateplanning",
  description: "A planner for the unorganized",
};

export default function RootLayout({ children }) {

  return (
      <html lang="en">
        <body className={`${inter.className} ${montserrat.variable} ${lato.variable} ${figtree.variable} ${nunito.variable} ${honkGoogle.variable}`}>
          {children}
        </body>
      </html>
  );
}
