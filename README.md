# crates-cmp

> Why I write Rust tool in js and everyone else is writing js tool in Rust?

> [!WARNING]
> Alpha stage, if you have any suggestion or problems, please open an issue.

## Usage

- Require [Even Better Toml](https://marketplace.visualstudio.com/items?itemName=tamasfe.even-better-toml). I didn't test other toml extensions.

- If you saw a lot of empty strings in scenario like `serde = ""`, I believe it's the auto completion from `Even Better Toml`'s `cargo.toml` schema.

## Features

- [x] Version code completion
- [x] Features code completion
- [x] Crate name code completion
- [x] Version check (compare installed version and latest version, etc.)
- [x] Diagnostic (version not exist, feature not exit, etc.)
- [x] Code action
- [ ] Audit
- [ ] Configuration

## Copied from

- https://github.com/serayuzgur/crates
- https://github.com/jedeop/crates-completer
