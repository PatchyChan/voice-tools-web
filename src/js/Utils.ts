import chroma from "chroma-js";

type NumberArray = Int8Array | Int16Array | Int32Array | Uint8Array | Uint16Array | Uint32Array |
    Float32Array | Float64Array | number[] | Array<number>

export function sum(arr: NumberArray): number
{
    let sum = 0
    for (let i = 0; i < arr.length; i++) sum += arr[i]
    return sum
}

export function mean(arr: NumberArray): number
{
    return sum(arr) / arr.length
}

/**
 * Calculates min and max of an array
 *
 * @param a Array
 * @return [min, max]
 */
export function extremes(a: NumberArray): [number, number]
{
    let min = a[0]
    let max = a[0]

    for (let n = 0; n < a.length; n++)
    {
        if (a[n] < min) min = a[n]
        if (a[n] > max) max = a[n]
    }

    return [min, max]
}

/**
 * Precomputed gradient optimized for pixel drawing
 */
export class Gradient
{
    res: number
    r: Uint8Array
    g: Uint8Array
    b: Uint8Array

    constructor(scale: chroma.Scale, resolution: number)
    {
        this.res = resolution

        this.r = new Uint8Array(resolution + 1)
        this.g = new Uint8Array(resolution + 1)
        this.b = new Uint8Array(resolution + 1)

        // Precompute
        for (let i = 0; i <= resolution; i++)
            [this.r[i], this.g[i], this.b[i]] = scale(i / resolution).rgb()
    }

    /**
     * Get RGB
     *
     * @param ratio Color ratio (0 - 1)
     */
    get(ratio: number)
    {
        const i = Math.round(ratio * this.res)
        return [this.r[i], this.g[i], this.b[i]]
    }
}