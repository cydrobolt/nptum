extern crate iron;
#[macro_use] extern crate router;
extern crate handlebars_iron;
extern crate rustc_serialize;
extern crate mount;
extern crate staticfile;

use iron::prelude::*;
use iron::{AfterMiddleware};
use iron::status;
use router::{Router, NoRoute};

use mount::Mount;
use staticfile::Static;

use handlebars_iron::{Template, HandlebarsEngine};
use rustc_serialize::json::{ToJson, Json};

use std::path::Path;
use std::collections::BTreeMap;
use std::collections::HashMap;

struct Custom404;
impl AfterMiddleware for Custom404 {
    fn catch(&self, _: &mut Request, err: IronError) -> IronResult<Response> {
        if let Some(_) = err.error.downcast::<NoRoute>() {
            Ok(Response::with((status::NotFound, "404 Page Not Found")))
        } else {
            Err(err)
        }
    }
}

fn main() {
    let mut router = Router::new();

    router.get("/", index);
    // router.get("/:query", handler);

    let mut mount = Mount::new();
    mount.mount("/", router);
    mount.mount("/static", Static::new(Path::new("static")));

    let mut chain = Chain::new(mount);

    chain.link_after(HandlebarsEngine::new("./templates", ".hbs"));
    chain.link_after(Custom404);

    let host = "localhost:5000";
    println!("nptum listening on http://{}", host);
    Iron::new(chain).http(host).unwrap();

    fn index(req: &mut Request) -> IronResult<Response> {
        let mut resp = Response::new();

        let mut data = BTreeMap::new();

        data.insert("hello".to_string(), "world".to_string());

        resp.set_mut(Template::new("index", data));
        resp.set_mut(status::Ok);
        Ok(resp)
    }
}
