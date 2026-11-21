import type {
  Recipe,
  RecipeId,
  Ingredient,
  Combo,
  ComboId,
  Role,
} from "./types";
export const recipes: Record<RecipeId, Recipe> = {
  steak: {
    id: "steak",
    name: "香煎牛排",
    icon: "🥩",
    role: "main",
    ingredient: "beef",
    station: "pan",
    target: 12,
    price: 48,
  },
  pasta: {
    id: "pasta",
    name: "奶油意面",
    icon: "🍝",
    role: "main",
    ingredient: "noodle",
    station: "pot",
    target: 10,
    price: 36,
  },
  salad: {
    id: "salad",
    name: "温蔬沙拉",
    icon: "🥗",
    role: "side",
    ingredient: "greens",
    station: "pan",
    target: 6,
    price: 28,
  },
  pepper: {
    id: "pepper",
    name: "黑椒汁",
    icon: "🧂",
    role: "sauce",
    ingredient: "spice",
    station: null,
    target: 0,
    price: 10,
  },
  cream: {
    id: "cream",
    name: "奶油白汁",
    icon: "🥛",
    role: "sauce",
    ingredient: "spice",
    station: null,
    target: 0,
    price: 10,
  },
};
export const ingredients: Record<
  Ingredient,
  { name: string; icon: string; cost: number }
> = {
  beef: { name: "牛肉", icon: "🥩", cost: 12 },
  noodle: { name: "面条", icon: "🍜", cost: 7 },
  greens: { name: "时蔬", icon: "🥬", cost: 5 },
  spice: { name: "香料", icon: "🌿", cost: 4 },
};
export const combos: Record<ComboId, Combo> = {
  "steak-solo": {
    id: "steak-solo",
    name: "香煎牛排 · 单点",
    icon: "🥩",
    spec: { main: "steak" },
    price: 48,
  },
  "pasta-solo": {
    id: "pasta-solo",
    name: "奶油意面 · 单点",
    icon: "🍝",
    spec: { main: "pasta" },
    price: 36,
  },
  "salad-solo": {
    id: "salad-solo",
    name: "温蔬沙拉 · 单点",
    icon: "🥗",
    spec: { side: "salad" },
    price: 28,
  },
  "pepper-steak": {
    id: "pepper-steak",
    name: "黑椒牛排餐",
    icon: "🍽️",
    spec: { main: "steak", sauce: "pepper" },
    price: 62,
  },
  "garden-pasta": {
    id: "garden-pasta",
    name: "田园意面餐",
    icon: "🍽️",
    spec: { main: "pasta", side: "salad" },
    price: 70,
  },
  "steak-platter": {
    id: "steak-platter",
    name: "黑椒牛排全拼",
    icon: "🍱",
    spec: { main: "steak", side: "salad", sauce: "pepper" },
    price: 92,
  },
  "pasta-platter": {
    id: "pasta-platter",
    name: "白汁意面全拼",
    icon: "🍱",
    spec: { main: "pasta", side: "salad", sauce: "cream" },
    price: 82,
  },
};
export const roles: Record<Role, string> = {
  main: "主菜",
  side: "配菜",
  sauce: "酱汁",
};
export const roleList: Role[] = ["main", "side", "sauce"];
export const recipeList = Object.values(recipes);
