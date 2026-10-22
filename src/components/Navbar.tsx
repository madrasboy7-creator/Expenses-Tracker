'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ReceiptText,
  BarChart3,
  Settings as SettingsIcon,
  Plus,
  Sun,
  Moon,
  IndianRupee,
  LogOut,
} from 'lucide-react';
import { useTheme } from '@/lib/context/ThemeContext';
import { useAuth } from '@/lib/auth/AuthContext';

interface NavbarProps {
  onOpenAddExpense?: () => void;
}

export function Navbar({ onOpenAddExpense }: NavbarProps) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { user, signOut, isConfigured } = useAuth();

  const navItems = [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'Expenses', href: '/expenses', icon: ReceiptText },
    { label: 'Reports', href: '/reports', icon: BarChart3 },
    { label: 'Settings', href: '/settings', icon: SettingsIcon },
  ];

  return (
    <>
      {/* Desktop & Tablet Top Navigation */}
      <header className="sticky top-0 z-30 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#090d16]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo */}
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                  <IndianRupee size={20} strokeWidth={2.6} />
                </div>
                <div>
                  <div className="text-base font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                    Lucifer Tracker
                    <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
                      INR
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 -mt-0.5">
                    Monthly Expense Tracker
                  </div>
                </div>
              </Link>

              {/* Desktop Nav Links */}
              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-slate-100 text-slate-900 dark:bg-slate-800/80 dark:text-emerald-400 font-semibold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <Icon size={16} className={isActive ? 'text-emerald-600 dark:text-emerald-400' : ''} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-2.5">
              {/* Quick Add Expense Button */}
              {onOpenAddExpense && (
                <button
                  type="button"
                  onClick={onOpenAddExpense}
                  id="navbar-add-expense-btn"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-medium shadow-sm shadow-emerald-600/30 transition-all active:scale-95 cursor-pointer"
                >
                  <Plus size={16} strokeWidth={2.5} />
                  <span>Add Expense</span>
                </button>
              )}

              {/* Theme Toggle Button */}
              <button
                type="button"
                onClick={toggleTheme}
                aria-label="Toggle Theme"
                id="theme-toggle-btn"
                className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {/* User indicator / quick sign out */}
              {user && (
                <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
                  <span
                    className="text-xs text-slate-500 dark:text-slate-400 max-w-[140px] truncate"
                    title={user.email || ''}
                  >
                    {user.email}
                  </span>
                  <button
                    type="button"
                    onClick={() => signOut()}
                    title="Log out"
                    aria-label="Log out"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-[#090d16]/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800/80 px-2 py-1 safe-area-pb">
        <div className="flex items-center justify-around h-14">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center w-full py-1 text-[11px] font-medium transition-colors ${
                  isActive
                    ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.3 : 1.8} />
                <span className="mt-0.5">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
