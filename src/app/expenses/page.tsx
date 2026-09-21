import { getExpenses } from '@/lib/actions';
import ExpenseTable from '@/components/ExpenseTable';
import ExpenseForm from '@/components/ExpenseForm';

export const revalidate = 0; // Dynamic server page

export default async function ExpensesPage() {
  const { expenses, totalCount } = await getExpenses({ limit: 500 });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
          All Expenses
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Detailed log of your spending. Filter by category, search by date, or log new entries.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ExpenseTable initialExpenses={expenses} totalCount={totalCount} />
        </div>
        <div className="lg:col-span-1">
          <ExpenseForm />
        </div>
      </div>
    </div>
  );
}
