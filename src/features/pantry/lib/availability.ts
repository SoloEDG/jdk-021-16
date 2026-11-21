import type { Game, RecipeId } from "../../../shared/types";
import { recipes } from "../../../shared/catalog";
export function preparationIssue(g: Game, r: RecipeId): string {
  if (g.stock[recipes[r].ingredient] < 1) return "食材不足，请采购";
  if (recipes[r].station === null) {
    if (g.dishes.filter((d) => d.plateId === null).length >= 8)
      return "出餐台已满，请先装盘或上菜";
  } else if (g.portions.length >= 6) return "备料台已满（6份）";
  return "";
}
