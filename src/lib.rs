pub fn str_is_alphabetic (s: String) -> bool {
    s.chars().all(|s| s.is_alphanumeric())
}
