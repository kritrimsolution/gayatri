import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata = {
  title: "Gayatri Pharma - B2B Distributor Portal",
  description: "Secure B2B distribution control panel and automated WhatsApp messaging console.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#fbfaf7] text-[#0f172a] selection:bg-[#10b981]/30 selection:text-[#0c4a43]">
        {children}
      </body>
    </html>
  );
}
