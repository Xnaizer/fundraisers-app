
import "./globals.css";
import { Readex_Pro } from "next/font/google";
import ClientLayout from "@/components/ClientLayout"; 

const readex = Readex_Pro({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-readex",
});

export const metadata = {
  title: "Fundraisers",
  description: "Crowdfunding on blockchain",
  icons: {
    icon: "/Fundraisers-icon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={readex.variable}>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
