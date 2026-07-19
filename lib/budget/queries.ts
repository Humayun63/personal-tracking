import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface BudgetCategory {
  id: string;
  name: string;
  color: string;
  archived: boolean;
}

export interface BudgetMonth {
  id: string;
  month: string;
}

export interface MonthCategory {
  id: string;
  category_id: string;
  name: string;
  color: string;
  budget: number;
  sort_order: number;
}

export interface BudgetExpense {
  id: string;
  category_id: string;
  description: string;
  amount: number;
  expense_date: string;
  created_at: string;
}

export async function getAllCategories(userId: string): Promise<BudgetCategory[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("budget_categories")
    .select("id, name, color, archived")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  return data ?? [];
}

export async function getMonths(userId: string): Promise<BudgetMonth[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("budget_months")
    .select("id, month")
    .eq("user_id", userId)
    .order("month", { ascending: false });
  return data ?? [];
}

export async function getMonthByLabel(userId: string, month: string): Promise<BudgetMonth | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("budget_months")
    .select("id, month")
    .eq("user_id", userId)
    .eq("month", month)
    .maybeSingle();
  return data;
}

export async function getMonthCategories(monthId: string): Promise<MonthCategory[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("budget_month_categories")
    .select("id, category_id, budget, sort_order, budget_categories(name, color)")
    .eq("month_id", monthId)
    .order("sort_order", { ascending: true });

  return (data ?? []).map((row) => {
    const category = Array.isArray(row.budget_categories)
      ? row.budget_categories[0]
      : row.budget_categories;
    return {
      id: row.id,
      category_id: row.category_id,
      budget: Number(row.budget),
      sort_order: row.sort_order,
      name: category?.name ?? "Unknown",
      color: category?.color ?? "#6E675E",
    };
  });
}

export async function getExpenses(monthId: string): Promise<BudgetExpense[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("budget_expenses")
    .select("id, category_id, description, amount, expense_date, created_at")
    .eq("month_id", monthId)
    .order("expense_date", { ascending: false })
    .order("created_at", { ascending: false });
  return (data ?? []).map((row) => ({ ...row, amount: Number(row.amount) }));
}

export async function countExpensesByCategory(
  userId: string,
  categoryId: string,
): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("budget_expenses")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("category_id", categoryId);
  return count ?? 0;
}
