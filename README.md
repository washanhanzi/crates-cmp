# crates-cmp

> Why I write Rust tool in js and everyone else is writing js tool in Rust?

> [!WARNING]
> Please check the new lsp written in rust
> [cargo-appraiser](https://github.com/washanhanzi/cargo-appraiser)

## Usage

- Require
  [Even Better Toml](https://marketplace.visualstudio.com/items?itemName=tamasfe.even-better-toml).
  I didn't test other toml extensions.

- If you saw a lot of empty strings in scenario like `serde = ""`, I believe
  it's the auto completion from `Even Better Toml`'s `cargo.toml` schema.

## Configuration

```json
{
  "crates-cmp.crates.sparse-index.url": "https://index.crates.io",
  // This feature require [cargo-audit](https://crates.io/crates/cargo-audit)
  "crates-cmp.cargo.audit.enable": false
}
```

## Copied from

- https://github.com/serayuzgur/crates
- https://github.com/jedeop/crates-completer
