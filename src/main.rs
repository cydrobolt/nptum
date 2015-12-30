#[macro_use] extern crate nickel;

use std::collections::HashMap;
use nickel::{Nickel, HttpRouter, StaticFilesHandler};


fn main() {
    let mut server = Nickel::new();
    server.utilize(StaticFilesHandler::new("static"));

    server.get("/", middleware! { |_, response|
        let mut data = HashMap::<&str, &str>::new();
        data.insert("name", "user");
        return response.render("templates/index.tpl", &data);
    });

    server.listen("127.0.0.1:5000");
}
