import type { ComboId, Game } from "../../../shared/types";
import { combos } from "../../../shared/catalog";
import { activeOrders } from "../lib/patience";
export function accept(g: Game, id: number) {
  const o = g.orders.find((o) => o.id === id);
  if (o?.status !== "waiting") return;
  o.status = "accepted";
  g.selectedOrder = id;
  g.notice = "已接单，请备料并留意客人耐心。";
}
export function expire(g: Game) {
  for (const o of activeOrders(g)) {
    if (g.time >= o.deadline) {
      o.status = "left";
      g.missed++;
      g.combo = 0;
      if (g.selectedOrder === o.id) g.selectedOrder = null;
      g.entries.push({
        id: g.nextId++,
        time: g.time,
        label: `${o.guest} 等待超时`,
        amount: -5,
        kind: "miss",
      });
      g.notice = `${o.guest} 离店，损失 ¥5`;
    }
  }
}
export function arrive(g: Game) {
  if (g.time >= 150 || activeOrders(g).length >= 6) return;
  const seq = Math.floor(g.time / 18);
  const early: ComboId[] = ["steak-solo", "pasta-solo", "salad-solo"];
  const late: ComboId[] = [
    "steak-platter",
    "pepper-steak",
    "pasta-platter",
    "garden-pasta",
    "steak-solo",
    "pasta-solo",
    "salad-solo",
  ];
  const pool = g.time < 36 ? early : late;
  const combo = combos[pool[seq % pool.length]];
  const parts = Object.keys(combo.spec).length;
  g.orders.push({
    id: g.nextId++,
    combo: combo.id,
    guest: ["阿宁", "许小姐", "赵先生", "晓晴"][seq % 4],
    arrived: g.time,
    deadline: g.time + 60 + (seq % 3) * 5 + (parts - 1) * 12,
    status: "waiting",
  });
}
