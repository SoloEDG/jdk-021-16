import type { Game } from "../../../shared/types";
import { combos, recipes } from "../../../shared/catalog";
import { servingQuality, servicePair, plateQuality } from "../lib/freshness";
import { matchPlate } from "../lib/match";
export function deliver(g: Game) {
  const { plate, order, components } = servicePair(g);
  if (!plate || !order) {
    g.notice = "请选择拼盘和已接订单";
    return;
  }
  if (!components.length) {
    g.notice = "空盘不能上菜，请先放入组件";
    return;
  }
  // 唯一归属核对：盘中组件必须全部且仅属于该盘
  if (
    components.some((d) => d.plateId !== plate.id) ||
    new Set(components.map((d) => d.id)).size !== components.length
  ) {
    g.notice = "组件归属异常，请重新装盘后再上菜";
    return;
  }
  const combo = combos[order.combo];
  const m = matchPlate(combo.spec, components);
  if (!m.hasAnyMatch) {
    order.deadline = Math.max(g.time, order.deadline - 10);
    g.combo = 0;
    g.notice = "上错菜！客人耐心减少10秒，拼盘仍留在出餐台";
    return;
  }
  const q = plateQuality(g, components);
  if (q < 30) {
    order.deadline = Math.max(g.time, order.deadline - 8);
    g.notice = "品质低于30，客人拒收，耐心减少8秒";
    return;
  }
  order.status = "served";
  g.served++;
  let amount: number;
  let label: string;
  if (m.full) {
    g.combo++;
    amount =
      Math.round((combo.price * q) / 100) + Math.min(10, (g.combo - 1) * 2);
    label = `${order.guest} · ${combo.name}`;
    g.notice = `整盘交付 +¥${amount} · 连续交付 ${g.combo} 单`;
  } else {
    g.combo = 0;
    amount = m.matched.reduce(
      (s, slot) =>
        s +
        Math.round(
          (recipes[slot.got!.recipe].price * servingQuality(g, slot.got!)) /
            100,
        ),
      0,
    );
    const miss = m.slots
      .filter((s) => s.state === "missing")
      .map((s) => `缺${recipes[s.want!].name}`);
    const wrong = m.slots
      .filter((s) => s.state === "wrong" || s.state === "extra")
      .map((s) => `${recipes[s.got!.recipe].name}不符`);
    label = `${order.guest} · 部分交付`;
    g.notice = `组合不完整（${[...miss, ...wrong].join("，")}），按组件结算 +¥${amount}，收不到整餐费用`;
  }
  g.entries.push({
    id: g.nextId++,
    time: g.time,
    label,
    amount,
    kind: "sale",
  });
  // 组件随盘交付，每个组件只结算一次
  g.dishes = g.dishes.filter((d) => d.plateId !== plate.id);
  g.plates = g.plates.filter((p) => p.id !== plate.id);
  g.selectedPlate = null;
  g.selectedOrder = null;
}
