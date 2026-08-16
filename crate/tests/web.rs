//! Test suite for the Web and headless browsers.

#![cfg(target_arch = "wasm32")]

extern crate wasm_bindgen_test;
use sandtable::{Species, Universe};
use wasm_bindgen_test::*;

wasm_bindgen_test_configure!(run_in_browser);

#[wasm_bindgen_test]
fn empty_universe_ticks_without_panicking() {
    let mut universe = Universe::new(4, 4);

    universe.tick();

    assert_eq!(universe.width(), 4);
    assert_eq!(universe.height(), 4);
}

#[wasm_bindgen_test]
fn a_real_material_can_be_painted_before_simulation_advances() {
    let mut universe = Universe::new(4, 4);

    universe.paint(1, 0, 1, Species::Sand);
    universe.tick();

    assert_eq!(universe.width(), 4);
}
