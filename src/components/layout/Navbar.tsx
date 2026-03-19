'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Brain, History, BarChart3, Zap, Menu, X } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { href: '/', label: 'New Quiz', icon: Zap },
  { href: '/history', label: 'History', icon: History },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 glass-card border-b border-white/[0.06]">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group" id="navbar-logo">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl gradient-text" style={{ fontFamily: 'Outfit, sans-serif' }}>
            QuizAI
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                id={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.05]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </div>

        <button
          id="navbar-mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-xl btn-ghost text-gray-400"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="md:hidden border-t border-white/[0.06] px-4 py-3 space-y-1 animate-fade-in-up">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-500/20 text-indigo-400'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.05]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
