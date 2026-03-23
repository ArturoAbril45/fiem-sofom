import "./globals.css";

export const metadata = {
  title: "FIEM SOFOM",
  description: "Sistema financiero FIEM S.A. de C.V. SOFOM E.N.R.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg", apple: "/favicon.svg" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
