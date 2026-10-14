import type { Metadata, Viewport } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { SidebarProvider } from '@/components/SidebarContext';
import { ToastProvider } from '@/components/ToastContext';

export const metadata: Metadata = {
  title: 'ForgeSight AI — AMD-Powered Industrial Intelligence & Predictive Maintenance',
  description: 'Detect. Explain. Predict. Prevent. Production-grade industrial telemetry intelligence and predictive maintenance powered by AMD ROCm.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden selection:bg-amber-500 selection:text-white">
        <ToastProvider>
          <SidebarProvider>
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
              <Header />
              <main className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-6 min-w-0">
                {children}
              </main>
            </div>
          </SidebarProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
