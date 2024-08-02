import { Song } from "@/types/types";

export function combineArrays(array1: any[], array2: any[]): Song[] {
    if (array1.length !== array2.length) {
        throw new Error('Both arrays must have the same length');
    }
    return array1.map((item, index) => ({ ...item, ...array2[index] }));
}