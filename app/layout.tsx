import './globals.css'; // Ye line sabse zaroori hai

export const metadata = {
  title: 'AI Content Creator',
  description: 'Create scripts and visuals with AI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <nav className="p-4 bg-gray-900 text-white font-bold text-xl border-b border-gray-700">
          🎬 AI Content Creator
        </nav>
        {children}
      </body>
    </html>
  );
}
