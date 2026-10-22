import React from 'react';
import { ExpenseCategory } from '@/types/expense';
import {
  Utensils,
  Car,
  ShoppingBag,
  GraduationCap,
  Film,
  MoreHorizontal,
  LucideIcon,
} from 'lucide-react';

export const CATEGORY_CONFIG: Record<
  ExpenseCategory,
  {
    icon: LucideIcon;
    color: string;
    bgLight: string;
    bgDark: string;
    borderLight: string;
    borderDark: string;
    textLight: string;
    textDark: string;
  }
> = {
  Food: {
    icon: Utensils,
    color: '#f59e0b',
    bgLight: 'bg-amber-50',
    bgDark: 'dark:bg-amber-950/40',
    borderLight: 'border-amber-200',
    borderDark: 'dark:border-amber-800/40',
    textLight: 'text-amber-700',
    textDark: 'dark:text-amber-300',
  },
  Transportation: {
    icon: Car,
    color: '#3b82f6',
    bgLight: 'bg-blue-50',
    bgDark: 'dark:bg-blue-950/40',
    borderLight: 'border-blue-200',
    borderDark: 'dark:border-blue-800/40',
    textLight: 'text-blue-700',
    textDark: 'dark:text-blue-300',
  },
  Shopping: {
    icon: ShoppingBag,
    color: '#8b5cf6',
    bgLight: 'bg-purple-50',
    bgDark: 'dark:bg-purple-950/40',
    borderLight: 'border-purple-200',
    borderDark: 'dark:border-purple-800/40',
    textLight: 'text-purple-700',
    textDark: 'dark:text-purple-300',
  },
  Education: {
    icon: GraduationCap,
    color: '#6366f1',
    bgLight: 'bg-indigo-50',
    bgDark: 'dark:bg-indigo-950/40',
    borderLight: 'border-indigo-200',
    borderDark: 'dark:border-indigo-800/40',
    textLight: 'text-indigo-700',
    textDark: 'dark:text-indigo-300',
  },
  Entertainment: {
    icon: Film,
    color: '#ec4899',
    bgLight: 'bg-pink-50',
    bgDark: 'dark:bg-pink-950/40',
    borderLight: 'border-pink-200',
    borderDark: 'dark:border-pink-800/40',
    textLight: 'text-pink-700',
    textDark: 'dark:text-pink-300',
  },
  Other: {
    icon: MoreHorizontal,
    color: '#64748b',
    bgLight: 'bg-slate-100',
    bgDark: 'dark:bg-slate-800/50',
    borderLight: 'border-slate-200',
    borderDark: 'dark:border-slate-700',
    textLight: 'text-slate-700',
    textDark: 'dark:text-slate-300',
  },
};

interface CategoryBadgeProps {
  category: ExpenseCategory;
  customCategory?: string | null;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function CategoryBadge({
  category,
  customCategory,
  showIcon = true,
  size = 'md',
}: CategoryBadgeProps) {
  const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.Other;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs font-medium px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-medium px-3 py-1.5 gap-2',
  }[size];

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  }[size];

  const label =
    category === 'Other' && customCategory?.trim()
      ? `Other: ${customCategory.trim()}`
      : category;

  return (
    <span
      className={`inline-flex items-center rounded-full border transition-colors ${sizeClasses} ${config.bgLight} ${config.bgDark} ${config.borderLight} ${config.borderDark} ${config.textLight} ${config.textDark}`}
      title={label}
    >
      {showIcon && <Icon size={iconSizes} strokeWidth={2.2} className="shrink-0" />}
      <span className="truncate max-w-[150px]">{label}</span>
    </span>
  );
}
