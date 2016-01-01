extern crate iron;
#[macro_use]
extern crate router;

extern crate handlebars_iron;
extern crate rustc_serialize;
extern crate mount;
extern crate urlencoded;
extern crate staticfile;

use iron::prelude::*;
use iron::{AfterMiddleware};
use iron::status;
use router::{Router, NoRoute};

use mount::Mount;
use staticfile::Static;
// GET data parser
use urlencoded::UrlEncodedQuery;
// POST data parser
use urlencoded::UrlEncodedBody;

use handlebars_iron::{Template, HandlebarsEngine};

use rustc_serialize::json;
use rustc_serialize::json::{ToJson, Json};

use std::io::prelude::*;
use std::path::Path;
use std::collections::BTreeMap;
use std::collections::HashMap;
use std::fs::File;

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

#[derive(RustcDecodable, RustcEncodable)]
pub struct NoteStruct  {
    title: String,
    noteContents: String
}

#[derive(RustcDecodable, RustcEncodable)]
pub struct User  {
    username: String,
    password: String
}

fn main() {
    fn get_users() -> Vec<User>{
        let mut f = File::open("users.json").unwrap();
        let mut s = String::new();
        f.read_to_string(&mut s).unwrap();
        let users:Vec<User> = json::decode(&s).unwrap();
        println!("{:?}", users[0].username);
        users
    }

    fn save_user(username: String, password: String) {
        let mut users: Vec<User> = get_users();
        // let mut buf = File::create("users.json").unwrap();
        let mut buf = File::create("users.json").unwrap();

        let mut user = User {
            username: username.to_string(),
            password: password.to_string()
        };

        // let mut users: Vec<User> = Vec::new();
        users.push(user);

        let raw_json_export = json::encode(&users).unwrap();

        buf.write(raw_json_export.as_bytes());

        println!("Saving User: {:?}", raw_json_export);
    }

    let mut router = Router::new();

    router.get("/", index);
    router.post("/login", login);


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

    fn login(req: &mut Request) -> IronResult<Response> {

        match req.get_ref::<UrlEncodedBody>() {
            Ok(ref hashmap) => {
                let mut username = hashmap["username"].clone();
                let mut password = hashmap["password"].clone();

                let mut user = User {
                    username: username[0].clone(),
                    password: password[0].clone()
                };

                let all_users:Vec<User> = get_users();
                // let mut user_exists = false;

                let found_user = all_users.iter().find(|x| x.username == username[0]);
                println!("Printing username if found!");
                // println!("{:?}", found_user.unwrap().username);
                match (found_user) {
                    Some(found_user_k) => {
                        let correct_password:String = found_user_k.password.clone();
                        if (correct_password != password[0]) {
                            // incorrect password
                            return Ok(Response::with((status::Ok, "Wrong password!")))
                        }
                        else {
                            return Ok(Response::with((status::Ok, "Correct password!")))
                        }
                    },
                    None => {
                        // user does not exist yet
                        save_user(username[0].clone(), password[0].clone());
                        return Ok(Response::with((status::Ok, "Creating new user!")))
                    }
                }

                println!("username: {:?}, password: {:?}", user.username, user.password);

                println!("Parsed POST request body:\n {:?}", hashmap);
            },
            Err(ref e) => println!("{:?}", e)
        };

        return Ok(Response::with((status::Ok, "Hello!")))
    }
}
