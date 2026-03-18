import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'QuizAI — AI-Powered Quiz Generator',
  description:
    'Generate intelligent quizzes on any topic using Google Gemini AI. Test your knowledge with personalized multiple-choice questions.',
  keywords: ['quiz', 'AI', 'learning', 'education', 'knowledge test'],
  authors: [{ name: 'QuizAI' }],
  openGraph: {
    title: 'QuizAI — AI-Powered Quiz Generator',
    description: 'Generate intelligent quizzes on any topic using AI.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        {/* Background ambient orbs */}
        <div className="bg-orb w-96 h-96 top-0 left-0 bg-indigo-600" />
        <div className="bg-orb w-80 h-80 bottom-20 right-10 bg-violet-600" />
        <div className="bg-orb w-64 h-64 top-1/2 left-1/2 bg-purple-700" />
        {children}
      </body>
    </html>
  );
}
