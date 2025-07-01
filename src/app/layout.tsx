import type { Metadata } from 'next';
import './globals.css';
import { AppLayout } from '@/components/app-layout';
import { Toaster } from "@/components/ui/toaster";
import { DataProvider } from '@/contexts/data-context';

export const metadata: Metadata = {
  title: 'ERP Paralelo Esclarecido',
  description: 'Plataforma de gestão interna para sua empresa.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br" suppressHydrationWarning className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Share+Tech+Mono&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <DataProvider>
          <AppLayout>{children}</AppLayout>
        </DataProvider>
        <Toaster />
      </body>
    </html>
  );
}
