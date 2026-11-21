export type RecipeId = "steak" | "pasta" | "salad" | "pepper" | "cream";
export type Ingredient = "beef" | "noodle" | "greens" | "spice";
export type Role = "main" | "side" | "sauce";
export interface Recipe {
  id: RecipeId;
  name: string;
  icon: string;
  role: Role;
  ingredient: Ingredient;
  station: "pan" | "pot" | null;
  target: number;
  price: number;
}
export type ComboId =
  | "steak-solo"
  | "pasta-solo"
  | "salad-solo"
  | "pepper-steak"
  | "garden-pasta"
  | "steak-platter"
  | "pasta-platter";
export interface Combo {
  id: ComboId;
  name: string;
  icon: string;
  spec: Partial<Record<Role, RecipeId>>;
  price: number;
}
export interface Order {
  id: number;
  combo: ComboId;
  guest: string;
  arrived: number;
  deadline: number;
  status: "waiting" | "accepted" | "served" | "left";
}
export interface Portion {
  id: number;
  recipe: RecipeId;
  preparedAt: number;
}
export interface Stove {
  id: number;
  kind: "pan" | "pot";
  portion: Portion | null;
  started: number;
}
export interface Dish {
  id: number;
  recipe: RecipeId;
  quality: number;
  cookedAt: number;
  plateId: number | null;
}
export interface Plate {
  id: number;
  sauced: boolean;
}
export interface Entry {
  id: number;
  time: number;
  label: string;
  amount: number;
  kind: "sale" | "waste" | "miss" | "supply";
}
export interface Game {
  time: number;
  duration: number;
  running: boolean;
  ended: boolean;
  nextId: number;
  selectedOrder: number | null;
  selectedPlate: number | null;
  orders: Order[];
  stock: Record<Ingredient, number>;
  portions: Portion[];
  stoves: Stove[];
  dishes: Dish[];
  plates: Plate[];
  entries: Entry[];
  combo: number;
  served: number;
  missed: number;
  notice: string;
  best: number;
}
export type Command =
  | { type: "accept"; id: number }
  | { type: "select-order"; id: number }
  | { type: "prepare"; recipe: RecipeId }
  | { type: "cook"; portion: number; stove: number }
  | { type: "lift"; id: number }
  | { type: "plate"; id: number; plate?: number }
  | { type: "unplate"; id: number }
  | { type: "new-plate" }
  | { type: "select-plate"; id: number }
  | { type: "serve" }
  | { type: "discard"; id: number }
  | { type: "restock"; ingredient: Ingredient };
