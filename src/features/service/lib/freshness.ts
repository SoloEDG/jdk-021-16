import type { Dish, Game, Plate } from "../../../shared/types";
export const EDIBLE_LINE = 30;
export function servingQuality(g: Game, d: Dish) {
  return Math.max(
    0,
    d.quality - Math.floor(Math.max(0, g.time - d.cookedAt - 15) * 2),
  );
}
export function freshnessLeft(g: Game, d: Dish) {
  const q = servingQuality(g, d);
  return q < EDIBLE_LINE ? 0 : Math.ceil((q - EDIBLE_LINE + 1) / 2);
}
export function freshLabel(g: Game, d: Dish) {
  const left = freshnessLeft(g, d);
  return left > 0 ? `${left}s 后过期` : "已过期";
}
export function counterComponents(g: Game) {
  return g.dishes.filter((d) => d.plateId === null);
}
export function plateComponents(g: Game, plateId: number) {
  return g.dishes.filter((d) => d.plateId === plateId);
}
export function plateQuality(g: Game, components: Dish[]) {
  if (!components.length) return 0;
  return Math.round(
    components.reduce((s, d) => s + servingQuality(g, d), 0) /
      components.length,
  );
}
export function servicePair(g: Game) {
  const plate = g.plates.find((p) => p.id === g.selectedPlate) ?? null;
  const order =
    g.orders.find(
      (o) => o.id === g.selectedOrder && o.status === "accepted",
    ) ?? null;
  return { plate, order, components: plate ? plateComponents(g, plate.id) : [] };
}
export type RecoverState = "ok" | "sauced" | "stale";
export function recoverState(g: Game, d: Dish, plate: Plate): RecoverState {
  if (plate.sauced) return "sauced";
  if (servingQuality(g, d) < EDIBLE_LINE) return "stale";
  return "ok";
}
