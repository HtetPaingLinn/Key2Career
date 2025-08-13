import "./globals.css";
import "./roadmap-styles.css";

export const metadata = {
  title: "Key2Career",
  description: "Your key to a successful career.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
