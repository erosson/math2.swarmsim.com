export interface Edge {
    from: string;
    to: string;
    each: number;
}
const unitNames = [
    'Meat',
    'Drone',
    'Queen',
    'Nest',
    'Greater Queen',
    'Hive',
    'Hive Queen',
    'Hive Empress'
];
export function unitName(i: number): string {
    return unitNames[i] ?? `[Unit T${i}]`;
}
export function parseEdges(v: string): readonly Edge[] | null {
    const eaches = v.split(',').map((c) => parseFloat(c.trim() || '0'));
    if (eaches.some(isNaN)) return null;
    return eaches.map((each, i) => {
        const to = unitName(i);
        const from = unitName(i + 1);
        return { from, to, each };
    });
}
export function parseCounts(v: string): ReadonlyMap<string, number> | null {
    const counts = v.split(',').map((c) => parseFloat(c.trim() || '0'));
    if (counts.some(isNaN)) return null;
    return new Map(counts.map((count, i) => [unitName(i), count]));
}