/* tslint:disable */
/* eslint-disable */

export class Cell {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
}

export enum Species {
    Empty = 0,
    Wall = 1,
    Sand = 2,
    Water = 3,
    Stone = 13,
    Ice = 9,
    Gas = 4,
    Cloner = 5,
    Mite = 15,
    Wood = 7,
    Plant = 11,
    Fungus = 18,
    Seed = 19,
    Fire = 6,
    Lava = 8,
    Acid = 12,
    Dust = 14,
    Oil = 16,
    Rocket = 17,
    Gunpowder = 20,
}

export class Universe {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    advance_gunpowder_fuses(elapsed_ms: number): void;
    burns(): number;
    cells(): number;
    flush_undos(): void;
    height(): number;
    static new(width: number, height: number): Universe;
    paint(x: number, y: number, size: number, species: Species): void;
    pop_undo(): void;
    push_undo(): void;
    reset(): void;
    tick(): void;
    tick_with_elapsed(elapsed_ms: number): void;
    width(): number;
    winds(): number;
}

export class Wind {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
}
