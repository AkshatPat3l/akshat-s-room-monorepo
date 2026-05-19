import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Akshat's Room - 3D Isometric Monorepo Portfolio",
  description: "An interactive 3D WebGL isometric space and system architecture monorepo portfolio built with Next.js, Fastify, Express, and Turborepo.",
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
