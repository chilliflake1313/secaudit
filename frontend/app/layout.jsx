import "./globals.css";

export const metadata = {
  title: "SecAudit"
};

export default function RootLayout({ children }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
