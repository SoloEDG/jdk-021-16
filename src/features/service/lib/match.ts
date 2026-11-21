import type { Combo, Dish, RecipeId, Role } from "../../../shared/types";
import { recipes, roleList } from "../../../shared/catalog";
export interface SlotMatch {
  slot: Role;
  want: RecipeId | null;
  got: Dish | null;
  state: "ok" | "missing" | "wrong" | "extra";
}
export function matchPlate(spec: Combo["spec"], components: Dish[]) {
  const slots: SlotMatch[] = [];
  for (const slot of roleList) {
    const want = spec[slot] ?? null;
    const got =
      components.find((d) => recipes[d.recipe].role === slot) ?? null;
    if (want && got) {
      slots.push({
        slot,
        want,
        got,
        state: got.recipe === want ? "ok" : "wrong",
      });
    } else if (want) {
      slots.push({ slot, want, got: null, state: "missing" });
    } else if (got) {
      slots.push({ slot, want: null, got, state: "extra" });
    }
  }
  const matched = slots.filter((s) => s.state === "ok");
  const required = roleList.filter((s) => spec[s]).length;
  return {
    slots,
    matched,
    required,
    hasAnyMatch: matched.length > 0,
    full: slots.length > 0 && slots.every((s) => s.state === "ok"),
  };
}
