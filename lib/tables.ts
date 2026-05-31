export type RestaurantTable = {
  restaurantId: string;
  tableId: number;
  capacity: number;
  hasSensor?: boolean;
};

export const RESTAURANT_TABLES: RestaurantTable[] = [
  { restaurantId: '1', tableId: 1, capacity: 2, hasSensor: true },
  { restaurantId: '1', tableId: 2, capacity: 2, hasSensor: true },
  { restaurantId: '1', tableId: 3, capacity: 2 },
  { restaurantId: '1', tableId: 4, capacity: 2 },
  { restaurantId: '1', tableId: 5, capacity: 4 },
  { restaurantId: '1', tableId: 6, capacity: 4 },
  { restaurantId: '1', tableId: 7, capacity: 4 },
  { restaurantId: '1', tableId: 8, capacity: 6 },
  { restaurantId: '2', tableId: 1, capacity: 4, hasSensor: true },
  { restaurantId: '2', tableId: 2, capacity: 2 },
  { restaurantId: '2', tableId: 3, capacity: 2 },
  { restaurantId: '2', tableId: 4, capacity: 4 },
  { restaurantId: '2', tableId: 5, capacity: 4 },
  { restaurantId: '2', tableId: 6, capacity: 6 },
  { restaurantId: '2', tableId: 7, capacity: 6 },
];

export function getRestaurantTables(restaurantId: string) {
  return RESTAURANT_TABLES.filter((table) => table.restaurantId === restaurantId);
}

export function getAllowedTableCapacities(persons: number) {
  if (persons <= 2) return [2, 4];
  return [4, 6, 8, 10].filter((capacity) => capacity >= persons);
}

export function isTableCapacityAllowed(persons: number, capacity: number) {
  return getAllowedTableCapacities(persons).includes(capacity);
}
