import { Expense } from '@/types/expense';

/**
 * Escapes a single CSV value according to RFC 4180:
 * - If value contains comma, double quote, or newline, wrap in quotes.
 * - Any double quote inside must be escaped by doubling it ("").
 */
function escapeCsvValue(val: string | number | null | undefined): string {
  if (val === null || val === undefined) {
    return '';
  }
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Generates an RFC 4180 compliant CSV string from a list of expenses.
 * Headers: Date, Category, Description, Amount (INR)
 */
export function generateExpensesCsv(expenses: Expense[]): string {
  const headers = ['Date', 'Category', 'Description', 'Amount (INR)'];
  const rows = expenses.map((expense) => {
    return [
      escapeCsvValue(expense.expense_date),
      escapeCsvValue(
        expense.category === 'Other' && expense.custom_category
          ? `Other: ${expense.custom_category}`
          : expense.category
      ),
      escapeCsvValue(expense.description || ''),
      escapeCsvValue(Number(expense.amount).toFixed(2)),
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\r\n');
}

/**
 * Triggers a browser download of the generated CSV file.
 */
export function downloadExpensesCsv(expenses: Expense[], filename = 'expenses.csv'): void {
  const csvContent = generateExpensesCsv(expenses);
  // Add UTF-8 BOM so Excel on Windows opens Indian text and special characters seamlessly
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
