/* @ts-self-types="./sandtable.d.ts" */
import * as wasm from "./sandtable_bg.wasm";
import { __wbg_set_wasm } from "./sandtable_bg.js";

__wbg_set_wasm(wasm);
wasm.__wbindgen_start();
export {
    Cell, Species, Universe, Wind
} from "./sandtable_bg.js";
