![logo](http://i.imgur.com/TsVYHCD.png)

![screenshot](http://i.imgur.com/ljxf85v.png)

A to-do list application written in Rust and Iron.
Inspired by Material design principles and Google Keep.

### Running

##### Precompiled binaries:

 - Run nptum using precompiled binaries
   - Copy over notes folder, `users.json`, and `config.json` into working directory
   - `$ chmod +x nptum_binary`
   - `$ ./nptum_binary`

##### Compile from source:
 - Install Rust: `$ curl -sSf https://static.rust-lang.org/rustup.sh | sh`
 - Compile using Cargo: `$ cargo build`
 - Run using Cargo: `$ cargo run`

##### Compile with optimisations:
 - With Cargo and Rust installed
   - `$ cargo build --release`

### Hacking

nptum is written in Rust with the Iron framework. Its frontend is powered by MaterializeCSS, Handlebars.js, and Backbone.js.

