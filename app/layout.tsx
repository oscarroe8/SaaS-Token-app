import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'OpenAI API Usage Dashboard',
  description: 'Track OpenAI API organisation token usage and costs.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
