import type { ApiCategory } from "@/types/api";

export type CategoryGroup = { parent: ApiCategory; children: ApiCategory[] };

export function groupCategories(categories: ApiCategory[]): CategoryGroup[] {
  return categories
    .filter((category) => category.parent_id === null)
    .map((parent) => ({
      parent,
      children: categories.filter((category) => category.parent_id === parent.id),
    }));
}
