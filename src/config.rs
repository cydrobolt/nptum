extern crate rustc_serialize;

use rustc_serialize::json;
use std::collections::HashMap;
use std::fs::File;
use std::io::prelude::*;


pub fn get_config() -> HashMap<String, String> {
    let mut f = File::open("config.json").unwrap();
    let mut s = String::new();
    f.read_to_string(&mut s).unwrap();

    let config_vars:HashMap<String, String> = json::decode(&s).unwrap();
    config_vars
}
