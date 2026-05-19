import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Infobus System Analytics',
  description: 'Visualizing microservice transaction allocations and API processing profiles.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
