import type { Game } from "../../../shared/types";
import { totals } from "../lib/totals";
export function closeShift(g: Game) {
  g.running = false;
  g.ended = true;
  // 打烊报废：剩余每个组件只结算一次
  const leftover = g.dishes.length;
  if (leftover) {
    g.entries.push({
      id: g.nextId++,
      time: g.time,
      label: `打烊报废 · ${leftover}件组件`,
      amount: -3 * leftover,
      kind: "waste",
    });
  }
  g.portions = [];
  g.dishes = [];
  g.plates = [];
  g.selectedPlate = null;
  g.selectedOrder = null;
  g.stoves.forEach((s) => (s.portion = null));
  g.best = Math.max(g.best, totals(g).net);
  g.notice = "午市结束，辛苦了，主厨！";
}
export function saveBest(g: Game) {
  try {
    localStorage.setItem("lunch-rush-best", String(g.best));
  } catch {
    g.notice = "浏览器存储不可用，本局结算仍然有效";
  }
}
export function readBest() {
  try {
    const v = Number(localStorage.getItem("lunch-rush-best"));
    return Number.isFinite(v) ? Math.max(0, v) : 0;
  } catch {
    return 0;
  }
}
