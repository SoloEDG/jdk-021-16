import type { Game, Plate, Role } from "../../../shared/types";
import { recipes, roles } from "../../../shared/catalog";
import {
  plateComponents,
  servingQuality,
  EDIBLE_LINE,
} from "../lib/freshness";
export const MAX_PLATES = 4;
export const MAX_COUNTER = 8;
function slotFree(g: Game, plateId: number, role: Role) {
  return !plateComponents(g, plateId).some(
    (d) => recipes[d.recipe].role === role,
  );
}
export function newPlate(g: Game) {
  if (g.plates.length >= MAX_PLATES) {
    g.notice = "盘位已满（4个），请先上菜或撤盘";
    return;
  }
  const p: Plate = { id: g.nextId++, sauced: false };
  g.plates.push(p);
  g.selectedPlate = p.id;
  g.notice = "已摆上空盘，可先放组件占住盘位，等齐再一次上菜";
}
export function plate(g: Game, id: number, plateId?: number) {
  const d = g.dishes.find((x) => x.id === id);
  // 唯一归属核对：只有仍属出餐台的组件才能装盘
  if (!d || d.plateId !== null) {
    g.notice = "组件归属无效：它不在出餐台，可能已在其他盘中";
    return;
  }
  const role = recipes[d.recipe].role;
  let p: Plate | undefined;
  if (plateId !== undefined) {
    p = g.plates.find((x) => x.id === plateId);
    if (!p) {
      g.notice = "目标拼盘不存在，请重试";
      return;
    }
  } else {
    p =
      g.plates.find(
        (x) => x.id === g.selectedPlate && !x.sauced && slotFree(g, x.id, role),
      ) ?? g.plates.find((x) => !x.sauced && slotFree(g, x.id, role));
    if (!p) {
      if (g.plates.length >= MAX_PLATES) {
        g.notice = "盘位已满，请先上菜或撤盘";
        return;
      }
      p = { id: g.nextId++, sauced: false };
      g.plates.push(p);
    }
  }
  if (p.sauced) {
    g.notice = "该盘已淋酱，不能再放入组件";
    return;
  }
  if (!slotFree(g, p.id, role)) {
    g.notice = `该盘的${roles[role]}位已有组件，一盘一位`;
    return;
  }
  d.plateId = p.id;
  g.selectedPlate = p.id;
  if (role === "sauce") {
    p.sauced = true;
    g.notice = "已淋酱，盘中组件随之锁定，不能再拆盘回收";
  } else {
    g.notice = `${recipes[d.recipe].name} 已装盘，组件继续失温，请尽快凑齐上菜`;
  }
}
export function unplate(g: Game, id: number) {
  const d = g.dishes.find((x) => x.id === id);
  if (!d || d.plateId === null) return;
  const p = g.plates.find((x) => x.id === d.plateId);
  if (!p) {
    d.plateId = null;
    return;
  }
  if (p.sauced) {
    g.notice = "已淋酱的拼盘不能拆盘，组件无法恢复原状";
    return;
  }
  if (servingQuality(g, d) < EDIBLE_LINE) {
    g.notice = "组件已不新鲜，不能回收，只能随盘报废";
    return;
  }
  d.plateId = null;
  g.notice = `已取回 ${recipes[d.recipe].name}，放回出餐台`;
}
export function discard(g: Game, id: number) {
  const p = g.plates.find((x) => x.id === id);
  if (p) {
    // 报废整盘：盘中每个组件只结算一次
    const comps = plateComponents(g, p.id);
    g.dishes = g.dishes.filter((d) => d.plateId !== p.id);
    g.plates = g.plates.filter((x) => x.id !== p.id);
    if (g.selectedPlate === p.id) g.selectedPlate = null;
    if (comps.length) {
      g.entries.push({
        id: g.nextId++,
        time: g.time,
        label: `报废拼盘 · ${comps.length}件组件`,
        amount: -3 * comps.length,
        kind: "waste",
      });
      g.notice = `已报废整盘 ${comps.length} 件组件，浪费成本 ¥${3 * comps.length}`;
    } else {
      g.notice = "已撤下空盘";
    }
    return;
  }
  const d = g.dishes.find((x) => x.id === id && x.plateId === null);
  if (!d) return;
  g.dishes = g.dishes.filter((x) => x.id !== id);
  g.entries.push({
    id: g.nextId++,
    time: g.time,
    label: `丢弃${recipes[d.recipe].name}`,
    amount: -3,
    kind: "waste",
  });
  g.notice = "已丢弃，浪费成本 ¥3";
}
