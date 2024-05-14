/**
 * converts Record<K, V> type to [K, V][].
 * Useful for usage with Object.entries()
 */
export type ObjectToArray<T> = T extends {
    [s: keyof any]: infer V;
} ? [keyof T, V][] : never;
