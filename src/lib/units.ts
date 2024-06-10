import Decimal from "decimal.js";
import BDecimal from "break_infinity.js";
import { decimalNumberOps, nativeNumberOps, type NumberOps } from "@erosson/polynomial";

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
    if (v === '') return []
    const eaches = v.split(',').map((c) => parseFloat(c.trim() || '0'));
    if (eaches.some(isNaN)) return null;
    return eaches.map((each, i) => {
        const to = unitName(i);
        const from = unitName(i + 1);
        return { from, to, each };
    });
}
export function parseCount(v: string, ops: NumTName): NumT {
    v = v.trim() || '0'
    switch (ops) {
        case 'decimal':
            return new Decimal(v)
        case 'break_infinity':
            return new BDecimal(v)
        case 'number':
        default:
            return parseFloat(v)
    }
}
export function parseCountsList(v: string, ops: NumTName): readonly NumT[] | null {
    if (v === '') return []
    const counts = v.split(',').map((c) => parseCount(c, ops));
    // isNaN
    if (counts.some(c => typeof c === 'number' ? isNaN(c) : (isNaN(c.s) && isNaN(c.e)))) return null;
    return counts
}
export function keyByUnit(counts: readonly NumT[]): ReadonlyMap<string, NumT> {
    return new Map(counts.map((count, i) => [unitName(i), count]));
}
export function parseCountsByUnit(v: string, ops: NumTName): ReadonlyMap<string, NumT> | null {
    const l = parseCountsList(v, ops)
    return l === null ? l : keyByUnit(l)
}

export type NumTName = 'number' | 'decimal' | 'break_infinity'
export type NumT = number | Decimal | BDecimal
export function parseNumT(v: string): NumTName | null {
    switch (v) {
        case 'number':
        case 'decimal':
        case 'break_infinity':
            return v
        case 'n':
            return 'number'
        case 'd':
            return 'decimal'
        case 'b':
            return 'break_infinity'
        default:
            return null
    }
}
export function parseOps(ops: NumTName): NumberOps<NumT> {
    switch (ops) {
        case 'decimal':
            return decimalNumberOps((n) => new Decimal(n));
        case 'break_infinity':
            return decimalNumberOps((n) => new BDecimal(n));
        case 'number':
        default:
            return nativeNumberOps;
    }
}