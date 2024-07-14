# Change Log

## [0.0.40] - 2024-07-14

### Fixed

- ui didn't update correctly when the file is changed

## [0.0.39] - 2024-07-13

### Changed

- speed up error diagnostics finding

## [0.0.38] - 2024-07-13

### Fixed

- #16 duplicate infomation diagnostics

## [0.0.37] - 2024-07-13

### Changed

- No change, minor code refactor

## [0.0.36] - 2024-07-12

### Added

- show decoration for not installed crates
- show diagnostic for installed crate with multiple versions
- react to Cargo.lock file change

### Fixed

- same crate with multiple versions

## [0.0.35] - 2024-07-11

### Fixed

- same crate in different toml table

## [0.0.34] - 2024-07-10

### Fixed

- correctly handle file update
- add optional dependecy to crate feature

## [0.0.29] - 2024-07-10

### Fixed

- fix parse pre-release version correctly
- fix corret handle file update

## [0.0.28] - 2024-07-10

### Fixed

- fix dependency may not installed on user's machine

## [0.0.27] - 2024-07-10

### Changed

- change decoration color and emoji for crate dependencies

### Fixed

- fix workspace with multiple Cargo.toml files

## [0.0.26] - 2024-07-10

### Changed

- nothing changed. Code refactor, deal with async. Maybe I can use RxJS, but I'm not familiar with it.

## [0.0.25] - 2024-07-09

### Added

- show version and feature diagnostic (with a hack)

## [0.0.24] - 2024-07-09

### Fixed

- fix dependency decoration for target dependencies
- fix dependency decoration for entry with package rename

## [0.0.23] - 2024-07-09

### Added

- waiting status for crate dependency decoration

### Fixed

- optional dependencies are not shown in the crate dependency decoration
