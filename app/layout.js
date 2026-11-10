import "./globals.css";

export const metadata = {
  title: "ApplyGuard — Check a job offer before you pay, reply or sign",
  description: "Paste a job link, recruiter message, screenshot or offer letter. Get an evidence-based safety report with concrete warning signs and verification steps.",
  metadataBase: new URL("https://applyguard.app"),
  openGraph: {
    title: "ApplyGuard — Job & Internship Scam Checker",
    description: "Got an offer? Check it before you pay, reply or sign. Evidence-based analysis for students and job seekers.",
    url: "https://applyguard.app",
    siteName: "ApplyGuard",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ApplyGuard — Job & Internship Scam Checker",
    description: "Evidence-based job offer and recruiter verification.",
  },
};

export const viewport = {
  themeColor: "#111318",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-display antialiased min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
