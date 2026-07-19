"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/supabase/user";
import { redirect } from "next/navigation";

const NEUTRAL_COLOR = "#6E675E";

async function requireUser() {
  const user = await getUser();
  if (!user) redirect("/login");
  return user;
}

export async function createMonth(params: { month: string; copyFromMonthId?: string }) {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: monthRow, error } = await supabase
    .from("budget_months")
    .insert({ user_id: user.id, month: params.month })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  if (params.copyFromMonthId) {
    const { data: sourceCategories } = await supabase
      .from("budget_month_categories")
      .select("category_id, budget, sort_order")
      .eq("month_id", params.copyFromMonthId);

    if (sourceCategories && sourceCategories.length > 0) {
      await supabase.from("budget_month_categories").insert(
        sourceCategories.map((c) => ({
          month_id: monthRow.id,
          category_id: c.category_id,
          budget: c.budget,
          sort_order: c.sort_order,
        })),
      );
    }
  }

  revalidatePath("/budget");
  revalidatePath("/budget/categories");
  revalidatePath("/budget/months");
  redirect(`/budget?month=${params.month}`);
}

export async function addExpense(params: {
  monthId: string;
  categoryId: string;
  description: string;
  amount: number;
  expenseDate: string;
}) {
  const user = await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.from("budget_expenses").insert({
    user_id: user.id,
    month_id: params.monthId,
    category_id: params.categoryId,
    description: params.description,
    amount: params.amount,
    expense_date: params.expenseDate,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/budget");
  revalidatePath("/budget/categories");
  revalidatePath("/budget/months");
}

export async function deleteExpense(expenseId: string) {
  await requireUser();
  const supabase = await createClient();
  await supabase.from("budget_expenses").delete().eq("id", expenseId);
  revalidatePath("/budget");
  revalidatePath("/budget/categories");
  revalidatePath("/budget/months");
}

export async function addCategory(params: {
  monthId: string;
  name: string;
  color: string;
  budget: number;
}) {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: category, error } = await supabase
    .from("budget_categories")
    .insert({ user_id: user.id, name: params.name, color: params.color })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  const { data: existing } = await supabase
    .from("budget_month_categories")
    .select("sort_order")
    .eq("month_id", params.monthId)
    .order("sort_order", { ascending: false })
    .limit(1);
  const nextOrder = (existing?.[0]?.sort_order ?? -1) + 1;

  await supabase.from("budget_month_categories").insert({
    month_id: params.monthId,
    category_id: category.id,
    budget: params.budget,
    sort_order: nextOrder,
  });

  revalidatePath("/budget");
  revalidatePath("/budget/categories");
  revalidatePath("/budget/months");
}

export async function updateCategory(params: {
  categoryId: string;
  monthId: string;
  name: string;
  color: string;
  budget: number;
}) {
  await requireUser();
  const supabase = await createClient();

  await supabase
    .from("budget_categories")
    .update({ name: params.name, color: params.color })
    .eq("id", params.categoryId);

  await supabase
    .from("budget_month_categories")
    .update({ budget: params.budget })
    .eq("category_id", params.categoryId)
    .eq("month_id", params.monthId);

  revalidatePath("/budget");
  revalidatePath("/budget/categories");
  revalidatePath("/budget/months");
}

export async function deleteCategory(params: { categoryId: string; reassignTo?: string }) {
  const user = await requireUser();
  const supabase = await createClient();

  if (params.reassignTo) {
    await supabase
      .from("budget_expenses")
      .update({ category_id: params.reassignTo })
      .eq("user_id", user.id)
      .eq("category_id", params.categoryId);
  }

  const { error } = await supabase
    .from("budget_categories")
    .delete()
    .eq("id", params.categoryId);
  if (error) throw new Error(error.message);

  revalidatePath("/budget");
  revalidatePath("/budget/categories");
  revalidatePath("/budget/months");
}

export async function reorderCategories(params: { monthId: string; orderedCategoryIds: string[] }) {
  await requireUser();
  const supabase = await createClient();

  await Promise.all(
    params.orderedCategoryIds.map((categoryId, index) =>
      supabase
        .from("budget_month_categories")
        .update({ sort_order: index })
        .eq("month_id", params.monthId)
        .eq("category_id", categoryId),
    ),
  );

  revalidatePath("/budget");
  revalidatePath("/budget/categories");
  revalidatePath("/budget/months");
}

export interface ImportRow {
  categoryName: string;
  description: string;
  amount: number;
  expenseDate: string;
}

export async function importExpenses(params: { monthId: string; rows: ImportRow[] }) {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: existingCategories } = await supabase
    .from("budget_categories")
    .select("id, name")
    .eq("user_id", user.id);

  const byName = new Map(
    (existingCategories ?? []).map((c) => [c.name.trim().toLowerCase(), c.id]),
  );

  const { data: existingMonthCategories } = await supabase
    .from("budget_month_categories")
    .select("category_id")
    .eq("month_id", params.monthId);
  const monthCategoryIds = new Set((existingMonthCategories ?? []).map((c) => c.category_id));

  for (const row of params.rows) {
    const key = row.categoryName.trim().toLowerCase();
    let categoryId = byName.get(key);

    if (!categoryId) {
      const { data: created, error } = await supabase
        .from("budget_categories")
        .insert({ user_id: user.id, name: row.categoryName.trim(), color: NEUTRAL_COLOR })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      categoryId = created.id;
      byName.set(key, categoryId);
    }

    if (!monthCategoryIds.has(categoryId)) {
      await supabase.from("budget_month_categories").insert({
        month_id: params.monthId,
        category_id: categoryId,
        budget: 0,
        sort_order: monthCategoryIds.size,
      });
      monthCategoryIds.add(categoryId);
    }

    await supabase.from("budget_expenses").insert({
      user_id: user.id,
      month_id: params.monthId,
      category_id: categoryId,
      description: row.description,
      amount: row.amount,
      expense_date: row.expenseDate,
    });
  }

  revalidatePath("/budget");
  revalidatePath("/budget/categories");
  revalidatePath("/budget/months");
}
