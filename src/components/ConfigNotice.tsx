'use client';

import React from 'react';
import { AlertCircle, Database, ExternalLink } from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase/client';

export function ConfigNotice() {
  const configured = isSupabaseConfigured();

  if (configured) return null;

  return (
    <div className="mb-6 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 p-4 sm:p-5 text-amber-900 dark:text-amber-200 shadow-xs">
      <div className="flex items-start gap-3.5">
        <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 shrink-0">
          <Database size={20} />
        </div>
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold">Supabase Setup Required</h3>
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-amber-200/80 dark:bg-amber-800/80 text-amber-900 dark:text-amber-100">
              Action Needed
            </span>
          </div>
          <p className="text-xs text-amber-800 dark:text-amber-300/90 leading-relaxed">
            Please configure your Supabase URL and Anon Key in <code className="font-mono px-1 py-0.5 bg-amber-100 dark:bg-amber-900/60 rounded">.env.local</code> to enable authentication and save live expenses to PostgreSQL.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-semibold">
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 hover:underline"
            >
              Open Supabase Dashboard
              <ExternalLink size={13} />
            </a>
            <span className="text-amber-400 dark:text-amber-600">•</span>
            <span className="text-slate-600 dark:text-slate-400 font-normal">
              SQL Migration file is ready in <code className="font-mono text-emerald-600 dark:text-emerald-400">supabase/migrations/</code>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
