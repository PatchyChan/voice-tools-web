/**
 * This class defines one setting option
 */
import {computed, ref, Ref} from "vue";

export class Setting<T>
{
    key: string
    desc: string
    def: T
    type: string

    ref: Ref<T>

    constructor(name: string, desc: string, def: T)
    {
        this.key = name
        this.desc = desc
        this.def = def
        this.type = typeof def
        this.ref = ref(this.val_uncached) as Ref<T>
    }

    /**
     * Read selected option from local storage, or return default value if not found.
     */
    get val_uncached()
    {
        const stored = localStorage.getItem(this.key)
        return stored === null ? this.def : JSON.parse(stored)
    }

    /**
     * Return cache if value is cached, or read from localStorage
     */
    get val(): T
    {
        if (this.ref) return this.ref.value
        this.ref.value = this.val_uncached
        return this.ref.value
    }

    /**
     * Set a value in local storage, also update in-memory cache
     *
     * @param val Value
     */
    set val(val: T)
    {
        localStorage.setItem(this.key, JSON.stringify(val))
        this.ref.value = val
    }

    reset()
    {
        localStorage.removeItem(this.key)
        this.ref.value = this.def
    }

    get modified()
    {
        return this.val != this.def
    }
}

export const options: Setting<any>[] = [
    new Setting("spectrogram.local", "**Compute spectrogram locally** - enable if you have *really* bad internet like <1 MB/s", false),
    new Setting("backend.url", "**Backend host** - you can run your own backend to speed up things! [read more]()", "http://localhost:8000")
]

export const optionsMap: {[index: string]: Setting<any>} = options.reduce((acc, curr) => (acc[curr.key] = curr, acc), {})

/**
 * Get a setting
 * @param key Setting key
 */
export function getSetting(key: string) {
    return optionsMap[key]
}
