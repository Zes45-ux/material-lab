export class Cell {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        CellFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_cell_free(ptr, 0);
    }
}
if (Symbol.dispose) Cell.prototype[Symbol.dispose] = Cell.prototype.free;

/**
 * @enum {0 | 1 | 2 | 3 | 13 | 9 | 4 | 5 | 15 | 7 | 11 | 18 | 19 | 6 | 8 | 12 | 14 | 16 | 17}
 */
export const Species = Object.freeze({
    Empty: 0, "0": "Empty",
    Wall: 1, "1": "Wall",
    Sand: 2, "2": "Sand",
    Water: 3, "3": "Water",
    Stone: 13, "13": "Stone",
    Ice: 9, "9": "Ice",
    Gas: 4, "4": "Gas",
    Cloner: 5, "5": "Cloner",
    Mite: 15, "15": "Mite",
    Wood: 7, "7": "Wood",
    Plant: 11, "11": "Plant",
    Fungus: 18, "18": "Fungus",
    Seed: 19, "19": "Seed",
    Fire: 6, "6": "Fire",
    Lava: 8, "8": "Lava",
    Acid: 12, "12": "Acid",
    Dust: 14, "14": "Dust",
    Oil: 16, "16": "Oil",
    Rocket: 17, "17": "Rocket",
});

export class Universe {
    static __wrap(ptr) {
        const obj = Object.create(Universe.prototype);
        obj.__wbg_ptr = ptr;
        UniverseFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        UniverseFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_universe_free(ptr, 0);
    }
    /**
     * @returns {number}
     */
    burns() {
        const ret = wasm.universe_burns(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {number}
     */
    cells() {
        const ret = wasm.universe_cells(this.__wbg_ptr);
        return ret >>> 0;
    }
    flush_undos() {
        wasm.universe_flush_undos(this.__wbg_ptr);
    }
    /**
     * @returns {number}
     */
    height() {
        const ret = wasm.universe_height(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} width
     * @param {number} height
     * @returns {Universe}
     */
    static new(width, height) {
        const ret = wasm.universe_new(width, height);
        return Universe.__wrap(ret);
    }
    /**
     * @param {number} x
     * @param {number} y
     * @param {number} size
     * @param {Species} species
     */
    paint(x, y, size, species) {
        wasm.universe_paint(this.__wbg_ptr, x, y, size, species);
    }
    pop_undo() {
        wasm.universe_pop_undo(this.__wbg_ptr);
    }
    push_undo() {
        wasm.universe_push_undo(this.__wbg_ptr);
    }
    reset() {
        wasm.universe_reset(this.__wbg_ptr);
    }
    tick() {
        wasm.universe_tick(this.__wbg_ptr);
    }
    /**
     * @returns {number}
     */
    width() {
        const ret = wasm.universe_width(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    winds() {
        const ret = wasm.universe_winds(this.__wbg_ptr);
        return ret >>> 0;
    }
}
if (Symbol.dispose) Universe.prototype[Symbol.dispose] = Universe.prototype.free;

export class Wind {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WindFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wind_free(ptr, 0);
    }
}
if (Symbol.dispose) Wind.prototype[Symbol.dispose] = Wind.prototype.free;
export function __wbg___wbindgen_throw_bb96b2010945f0bc(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
}
export function __wbg_random_b0d98802be10ff20() {
    const ret = Math.random();
    return ret;
}
export function __wbindgen_init_externref_table() {
    const table = wasm.__wbindgen_externrefs;
    const offset = table.grow(4);
    table.set(0, undefined);
    table.set(offset + 0, undefined);
    table.set(offset + 1, null);
    table.set(offset + 2, true);
    table.set(offset + 3, false);
}
const CellFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_cell_free(ptr, 1));
const UniverseFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_universe_free(ptr, 1));
const WindFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wind_free(ptr, 1));

function getStringFromWasm0(ptr, len) {
    return decodeText(ptr >>> 0, len);
}

let cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
const MAX_SAFARI_DECODE_BYTES = 2146435072;
let numBytesDecoded = 0;
function decodeText(ptr, len) {
    numBytesDecoded += len;
    if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
        cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
        cachedTextDecoder.decode();
        numBytesDecoded = len;
    }
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}


let wasm;
export function __wbg_set_wasm(val) {
    wasm = val;
}
