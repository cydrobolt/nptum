#[macro_use] extern crate nickel;

use nickel::{Nickel, StaticFilesHandler};


fn main() {
    let mut server = Nickel::new();
    server.utilize(StaticFilesHandler::new("static"));

    server.utilize(router! {
        get "**" => |_req, _res| {
            "Hello world!"
        }
    });

    server.listen("127.0.0.1:5000");
}
