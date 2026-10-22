'use client';

import React, { useState } from 'react';
import {
  User,
  KeyRound,
  Sun,
  Moon,
  Download,
  LogOut,
  AlertCircle,
  CheckCircle2,
  Loader2,
  FileSpreadsheet,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { ConfigNotice } from '@/components/ConfigNotice';
import { useAuth } from '@/lib/auth/AuthContext';
import { useTheme } from '@/lib/context/ThemeContext';
import { createClient } from '@/lib/supabase/client';
import { useExpenses } from '@/lib/expenses/useExpenses';
import { downloadExpensesCsv } from '@/lib/expenses/csv';

export default function SettingsPage() {
  const { user, signOut, isConfigured } = useAuth();
  const { theme, setTheme } = useTheme();
  const { allExpenses } = useExpenses();

  // Password reset state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const supabase = createClient();

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 6 characters long' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    if (!isConfigured) {
      setPasswordMsg({ type: 'error', text: 'Supabase is not configured' });
      return;
    }

    setPasswordLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setPasswordMsg({ type: 'success', text: 'Password successfully updated!' });
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update password';
      setPasswordMsg({ type: 'error', text: msg });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleExportAllCsv = () => {
    downloadExpensesCsv(allExpenses, 'all_expenses.csv');
  };

  return (
    <div className="min-h-screen flex flex-col pb-20 md:pb-8">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        <ConfigNotice />

        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your account, theme preferences, and data exports.
          </p>
        </div>

        <div className="space-y-6">
          {/* Section 1: Account Email */}
          <div className="bg-white dark:bg-slate-900/80 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-6 shadow-xs">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
                <User size={18} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Account Email
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Your authenticated account address
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white">
              {user?.email || (isConfigured ? 'Not signed in' : 'Local Preview Mode')}
            </div>
          </div>

          {/* Section 2: Password Reset Option */}
          <div className="bg-white dark:bg-slate-900/80 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-6 shadow-xs">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
                <KeyRound size={18} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Change Password
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Update your personal account password
                </p>
              </div>
            </div>

            {passwordMsg && (
              <div
                className={`mb-4 p-3.5 rounded-xl border flex items-start gap-2.5 text-xs ${
                  passwordMsg.type === 'error'
                    ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-300'
                }`}
              >
                {passwordMsg.type === 'error' ? (
                  <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-500" />
                ) : (
                  <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-500" />
                )}
                <span>{passwordMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
              <div>
                <label
                  htmlFor="new-pwd"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  New Password
                </label>
                <input
                  id="new-pwd"
                  type="password"
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="block w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label
                  htmlFor="confirm-pwd"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Confirm New Password
                </label>
                <input
                  id="confirm-pwd"
                  type="password"
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={passwordLoading || !newPassword}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white text-xs sm:text-sm font-semibold shadow-sm shadow-emerald-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                {passwordLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <span>Update Password</span>
                )}
              </button>
            </form>
          </div>

          {/* Section 3: Light/Dark Theme Selection */}
          <div className="bg-white dark:bg-slate-900/80 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-6 shadow-xs">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
                {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Theme Selection
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Choose your preferred appearance
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 max-w-sm">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`flex items-center justify-center gap-2 p-3.5 rounded-2xl border text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'border-emerald-500 bg-emerald-50/50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Sun size={18} className={theme === 'light' ? 'text-emerald-600' : ''} />
                <span>Light Theme</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`flex items-center justify-center gap-2 p-3.5 rounded-2xl border text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'border-emerald-500 bg-emerald-50/50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Moon size={18} className={theme === 'dark' ? 'text-emerald-400' : ''} />
                <span>Dark Theme</span>
              </button>
            </div>
          </div>

          {/* Section 4: CSV Export */}
          <div className="bg-white dark:bg-slate-900/80 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-6 shadow-xs">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
                <FileSpreadsheet size={18} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  CSV Data Export
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Export your complete expense records to a clean, standard CSV file
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 max-w-lg">
              Includes Expense Date, Category, Description, and Amount in INR. RFC 4180 compliant with UTF-8 BOM for Microsoft Excel and Google Sheets.
            </p>

            <button
              type="button"
              onClick={handleExportAllCsv}
              disabled={allExpenses.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs transition-colors cursor-pointer"
            >
              <Download size={16} className="text-emerald-600 dark:text-emerald-400" />
              <span>Export All Expenses ({allExpenses.length} records)</span>
            </button>
          </div>

          {/* Section 5: Logout */}
          <div className="bg-white dark:bg-slate-900/80 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-6 shadow-xs">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center text-rose-600 dark:text-rose-400">
                <LogOut size={18} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Sign Out
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Safely end your authenticated session on this browser
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => signOut()}
              id="settings-logout-btn"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-98 text-white text-xs sm:text-sm font-semibold shadow-sm shadow-rose-600/30 transition-all cursor-pointer"
            >
              <LogOut size={16} />
              <span>Sign Out of Account</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
