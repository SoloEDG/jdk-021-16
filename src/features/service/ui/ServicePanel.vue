<script setup lang="ts">
import { computed } from "vue";
import type { Command, Dish, Game, Plate } from "../../../shared/types";
import { combos, recipes, roleList, roles } from "../../../shared/catalog";
import {
  counterComponents,
  freshLabel,
  plateComponents,
  recoverState,
  servingQuality,
  servicePair,
} from "../lib/freshness";
import { matchPlate, type SlotMatch } from "../lib/match";
const props = defineProps<{ game: Game }>();
const emit = defineEmits<{ command: [cmd: Command] }>();
const pair = computed(() => servicePair(props.game));
const match = computed(() => {
  const { order, components } = pair.value;
  if (!order || !components.length) return null;
  return matchPlate(combos[order.combo].spec, components);
});
const recoverLabels = {
  ok: "可回收",
  sauced: "已淋酱 · 不可回收",
  stale: "已变质 · 不可回收",
} as const;
function slotRows(p: Plate) {
  const comps = plateComponents(props.game, p.id);
  return roleList.map((slot) => ({
    slot,
    dish: comps.find((d) => recipes[d.recipe].role === slot) ?? null,
  }));
}
function dragStart(d: Dish, e: DragEvent) {
  e.dataTransfer?.setData("text/plain", String(d.id));
  if (e.dataTransfer) e.dataTransfer.effectAllowed = "move";
}
function drop(plateId: number, e: DragEvent) {
  const id = Number(e.dataTransfer?.getData("text/plain"));
  if (Number.isInteger(id)) emit("command", { type: "plate", id, plate: plateId });
}
function chipText(s: SlotMatch) {
  if (s.state === "ok") return `✓ ${roles[s.slot]} ${recipes[s.got!.recipe].name}`;
  if (s.state === "missing") return `✗ 缺${roles[s.slot]} ${recipes[s.want!].name}`;
  if (s.state === "wrong") return `✗ ${roles[s.slot]}需${recipes[s.want!].name}`;
  return `＋ 多出 ${recipes[s.got!.recipe].name}`;
}
</script>
<template>
  <section class="panel service-panel">
    <span class="eyebrow">04 / PASS & SERVE</span>
    <h2>装盘与上菜 <span class="small">SERVE</span></h2>
    <div class="sub-head">
      <span>出餐台组件 · 可拖入拼盘</span
      ><b>{{ counterComponents(game).length }} / 8</b>
    </div>
    <div class="dish-list">
      <article
        v-for="d in counterComponents(game)"
        :key="d.id"
        class="dish-row"
        draggable="true"
        @dragstart="dragStart(d, $event)"
      >
        <span class="dish-icon">{{ recipes[d.recipe].icon }}</span>
        <div>
          <b>{{ recipes[d.recipe].name }}</b
          ><small
            >{{ roles[recipes[d.recipe].role] }} · 品质
            {{ servingQuality(game, d) }} · {{ freshLabel(game, d) }}</small
          >
        </div>
        <button
          class="tiny soft"
          @click="$emit('command', { type: 'plate', id: d.id })"
        >
          装盘</button
        ><button
          class="trash"
          aria-label="丢弃组件"
          @click="$emit('command', { type: 'discard', id: d.id })"
        >
          ×
        </button>
      </article>
      <div v-if="!counterComponents(game).length" class="empty plate-empty">
        <div>◌</div>
        这里等待你的第一道美味<small>起锅/调汁 → 装盘 → 选择订单 → 上菜</small>
      </div>
    </div>
    <div class="sub-head">
      <span>拼盘 · 可先放组件占位</span>
      <button
        class="tiny soft"
        :disabled="game.plates.length >= 4"
        @click="$emit('command', { type: 'new-plate' })"
      >
        ＋ 新盘 {{ game.plates.length }}/4
      </button>
    </div>
    <div class="plate-list">
      <article
        v-for="p in game.plates"
        :key="p.id"
        class="plate-card"
        :class="{ selected: game.selectedPlate === p.id, sauced: p.sauced }"
        @dragover.prevent
        @drop="drop(p.id, $event)"
      >
        <div class="plate-head">
          <b>拼盘 #{{ p.id }}</b
          ><span class="tag" :class="{ ok: !p.sauced }">{{
            p.sauced ? "已淋酱 · 锁定" : "未淋酱 · 可拆盘"
          }}</span
          ><button
            class="trash"
            aria-label="撤盘报废"
            @click="$emit('command', { type: 'discard', id: p.id })"
          >
            ×
          </button>
        </div>
        <div
          v-for="row in slotRows(p)"
          :key="row.slot"
          class="slot"
          :class="{ filled: !!row.dish, empty: !row.dish }"
        >
          <template v-if="row.dish">
            <span class="slot-icon">{{ recipes[row.dish.recipe].icon }}</span>
            <div class="slot-info">
              <b>{{ recipes[row.dish.recipe].name }}</b
              ><small
                >{{ roles[row.slot] }} · 品质
                {{ servingQuality(game, row.dish) }} ·
                {{ freshLabel(game, row.dish) }}</small
              ><small
                class="recover"
                :class="recoverState(game, row.dish, p)"
                >{{ recoverLabels[recoverState(game, row.dish, p)] }}</small
              >
            </div>
            <button
              v-if="recoverState(game, row.dish, p) === 'ok'"
              class="tiny soft"
              @click="$emit('command', { type: 'unplate', id: row.dish.id })"
            >
              取回
            </button>
          </template>
          <span v-else class="slot-hint"
            >{{ roles[row.slot] }}位 · 拖入或点「装盘」</span
          >
        </div>
        <button
          class="soft plate-select"
          @click="$emit('command', { type: 'select-plate', id: p.id })"
        >
          {{ game.selectedPlate === p.id ? "✓ 已选为上菜目标" : "选为上菜目标" }}
        </button>
      </article>
      <div v-if="!game.plates.length" class="empty plate-list-empty">
        还没有拼盘<small>点组件的「装盘」自动开新盘，或先「＋ 新盘」占位</small>
      </div>
    </div>
    <div class="delivery-target">
      上菜目标：<b>{{ pair.order?.guest || "尚未选择订单" }}</b
      ><template v-if="pair.order"> · {{ combos[pair.order.combo].name }}</template>
      <div v-if="match" class="match-list">
        <span
          v-for="s in match.slots"
          :key="s.slot"
          class="match-chip"
          :class="s.state"
          >{{ chipText(s) }}</span
        ><span class="match-chip" :class="match.full ? 'ok' : 'warn'">{{
          match.full ? "整盘可收全价" : "组合不符 · 按组件结算"
        }}</span>
      </div>
      <div v-else-if="pair.plate && pair.order" class="muted">
        空盘 · 拖入组件开始拼盘
      </div>
      <div v-else-if="pair.plate" class="muted">再选一个已接订单作为目标</div>
      <div v-else-if="pair.order" class="muted">再选择要上菜的拼盘</div>
    </div>
    <button class="serve-button" @click="$emit('command', { type: 'serve' })">
      上菜 <span>↗</span>
    </button>
    <p class="muted">
      错配扣10秒耐心 · 缺件或错配按组件单价结算 · 淋酱后不可拆盘 ·
      起锅15秒后开始失温
    </p>
  </section>
</template>
