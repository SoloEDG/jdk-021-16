<script setup lang="ts">
import type { Order, Game, ComboId } from "../../../shared/types";
import { combos, recipes, roles, roleList } from "../../../shared/catalog";
import { patience } from "../lib/patience";
defineProps<{ order: Order; game: Game }>();
defineEmits<{ accept: [id: number]; select: [id: number] }>();
function specParts(combo: ComboId) {
  const c = combos[combo];
  return roleList
    .filter((slot) => c.spec[slot])
    .map((slot) => ({ slot, recipe: recipes[c.spec[slot]!] }));
}
</script>
<template>
  <article
    class="ticket"
    :class="{
      selected: game.selectedOrder === order.id,
      urgent: patience(game, order) < 0.25,
    }"
  >
    <div class="ticket-top">
      <b>#{{ String(order.id).padStart(3, "0") }}</b
      ><span>{{ Math.ceil(order.deadline - game.time) }}s</span>
    </div>
    <div class="ticket-dish">
      <span>{{ combos[order.combo].icon }}</span
      ><strong>{{ combos[order.combo].name }}</strong>
    </div>
    <div class="combo-spec">
      <span v-for="p in specParts(order.combo)" :key="p.slot" class="spec-chip"
        >{{ p.recipe.icon }} {{ roles[p.slot] }}</span
      >
    </div>
    <div class="muted">
      {{ order.guest }} · ¥{{ combos[order.combo].price }}
    </div>
    <div class="patience">
      <i :style="{ width: patience(game, order) * 100 + '%' }"></i>
    </div>
    <button
      v-if="order.status === 'waiting'"
      @click="$emit('accept', order.id)"
    >
      接单</button
    ><button v-else class="soft" @click="$emit('select', order.id)">
      {{ game.selectedOrder === order.id ? "已选为上菜目标" : "选择上菜目标" }}
    </button>
  </article>
</template>
