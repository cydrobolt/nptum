#[allow(unused_parens)]

extern crate iron;
#[macro_use]
extern crate router;

extern crate cookie;
extern crate oven;
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
// POST data parser
use urlencoded::UrlEncodedBody;

use handlebars_iron::{Template, HandlebarsEngine};

use rustc_serialize::json;

use oven::prelude::*;
use cookie::{Cookie};

use std::io::prelude::*;
use std::path::Path;
use std::collections::BTreeMap;
use std::collections::HashMap;
use std::fs::File;


// load config
mod config;

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
pub struct Notes {
    dump: String
}

#[derive(RustcDecodable, RustcEncodable)]
pub struct User  {
    username: String,
    password: String
}

fn main() {
    let config_vars = config::get_config();

    fn get_users() -> Vec<User> {
        let mut f = File::open("users.json").unwrap();
        let mut s = String::new();
        f.read_to_string(&mut s).unwrap();
        let users:Vec<User> = json::decode(&s).unwrap();
        users
    }

    fn get_notes_for_user(username: String) -> String {
        let mut f = File::open(
            format!("notes/{}.json", username)
        ).unwrap();
        let mut s = String::new();
        f.read_to_string(&mut s).unwrap();

        let notes:Notes = json::decode(&s).unwrap();

        notes.dump.clone()
    }

    fn save_user(username: String, password: String) {
        let mut users: Vec<User> = get_users();
        let mut buf = File::create("users.json").unwrap();

        let user = User {
            username: username.to_string(),
            password: password.to_string()
        };

        // let mut users: Vec<User> = Vec::new();
        users.push(user);

        let raw_json_export = json::encode(&users).unwrap();

        buf.write(raw_json_export.as_bytes());
    }

    fn save_notes_for_user(username: String, dump: String) {
        let mut buf = File::create(
            format!("notes/{}.json", username)
        ).unwrap();

        let notes = Notes {
            dump: dump.to_string(),
        };

        let raw_json_export = json::encode(&notes).unwrap();

        buf.write(raw_json_export.as_bytes());
    }

    let cookie_signing_key:Vec<u8> = config_vars["cookie_signing_key"].clone().into_bytes();

    let mut router = Router::new();

    /* GET requests */
    router.get("/", index);
    router.get("/api/v1/get_note_data", return_note_data);

    /* POST requests */
    router.post("/login", login);

    /* PUT requests */
    router.put("/api/v1/sync_note_data", sync_note_data);

    let mut mount = Mount::new();

    mount.mount("/", router);
    mount.mount("/static", Static::new(Path::new("static")));

    let mut chain = Chain::new(mount);
    chain.link_after(HandlebarsEngine::new("./templates", ".hbs"));
    chain.link(oven::new(cookie_signing_key));
    chain.link_after(Custom404);

    let host = "localhost:5000";
    println!("nptum listening on http://{}", host);

    Iron::new(chain).http(host).unwrap();

    fn index(req: &mut Request) -> IronResult<Response> {
        let mut resp = Response::new();
        let mut data = BTreeMap::new();

        // cookies are signed
        let cookie_username = req.get_cookie("username");

        match cookie_username {
            Some(username) => {
                data.insert("username".to_string(), username.value.to_string());

                data.insert("username-display-class".to_string(), "".to_string());
                data.insert("login-btn-class".to_string(), "display-none".to_string());
            },
            None => {
                // not logged in
                data.insert("login-btn-class".to_string(), "".to_string());
                data.insert("username-display-class".to_string(), "display-none".to_string());
            }
        }

        resp.set_mut(Template::new("index", data));
        resp.set_mut(status::Ok);
        Ok(resp)
    }

    fn login(req: &mut Request) -> IronResult<Response> {
        match req.get_ref::<UrlEncodedBody>() {
            Ok(ref hashmap) => {
                let username = hashmap["username"].clone();
                let password = hashmap["password"].clone();

                let all_users:Vec<User> = get_users();

                let found_user = all_users.iter().find(|x| x.username == username[0]);
                let mut resp = Response::new();

                let mut data = BTreeMap::new();
                data.insert("url".to_string(), "/".to_string());

                match found_user {
                    Some(found_user) => {
                        let correct_password:String = found_user.password.clone();

                        if (correct_password != password[0]) {
                            // incorrect password
                            resp.set_mut((status::Ok, Template::new("redirect", data)));
                            return Ok(resp);
                        }
                        else {
                            // correct password
                            resp.set_cookie(Cookie::new("username".to_string(), username[0].clone()));
                            resp.set_mut((status::Ok, Template::new("redirect", data)));
                            return Ok(resp);
                        }
                    },
                    None => {
                        // user does not exist yet
                        save_user(username[0].clone(), password[0].clone());
                        resp.set_cookie(Cookie::new("username".to_string(), username[0].clone()));
                        resp.set_mut((status::Ok, Template::new("redirect", data)));
                        return Ok(resp);
                    }
                }
            },
            Err(ref e) => println!("{:?}", e)
        };
        return Ok(Response::with((status::InternalServerError, "Oh no! Something went wrong.")))
    }

    fn sync_note_data(req: &mut Request) -> IronResult<Response> {
        let cookie_username = req.get_cookie("username").cloned();

        match req.get_ref::<UrlEncodedBody>() {
            Ok(ref hashmap) => {
                let mut resp = Response::new();

                match cookie_username {
                    Some(username_from_cookie) => {
                        // user is logged in
                        let username:String = username_from_cookie.value.to_string();
                        let note_data:String = hashmap["notes_dump"][0].clone();
                        save_notes_for_user(username, note_data);
                        resp.set_mut((status::Ok, "200 OK"));
                        return Ok(resp)
                    },
                    None => {
                        resp.set_mut((status::Forbidden, "403 Forbidden: You must log in."));
                        return Ok(resp)
                    }
                }
            },
            Err(ref e) => println!("{:?}", e)
        }
        Ok(Response::with((status::InternalServerError, "Oh no! Something went wrong.")))
    }

    fn return_note_data(req: &mut Request) -> IronResult<Response> {
        let cookie_username = req.get_cookie("username").cloned();
        let mut resp = Response::new();

        match cookie_username {
            Some(username_from_cookie) => {
                let username:String = username_from_cookie.value.to_string();
                let notes_for_user = get_notes_for_user(username);
                resp.set_mut((status::Ok, notes_for_user));
                return Ok(resp)
            },
            None => {
                resp.set_mut((status::Forbidden, "403 Forbidden: You must log in."));
                return Ok(resp)
            }
        }
    }

}
