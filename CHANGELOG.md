# Change Log

## [0.0.56] - 2024-08-18

### Fixed

- correctly check dependency's local path or remote path

## [0.0.55] - 2024-08-18

### Fixed

- correctly parse local dependency

## [0.0.54] - 2024-08-06

## Changed

- show local dependency

## [0.0.53] - 2024-08-06

### Fixed

- don't mess with local dependencies

## [0.0.52] - 2024-08-06

### Fixed

- proper decoration color for light theme

## [0.0.51] - 2024-08-06

### Fixed

- fix cargo audit diagnostic showed in wrong file

## [0.0.49] - 2024-08-02

### Added

- audit

### Fixed

- diagnostic for invalid package name

## [0.0.46] - 2024-08-01

### Added

- dynamic get cargo executable path

## [0.0.45] - 2024-07-30

### Added

- config for sparse index url

## [0.0.44] - 2024-07-30

### Fixed

- fix: properly parse user input version in diagnostic

### Added

- code action to update to latest version
- code action to fix not found version

### Changed

- code refactor
- more accurate diagnostics ui indicator
- return as soon as possible when a diagnostic is found

## [0.0.42] - 2024-07-23

### Fixed

- correctly handle Cargo.lock file update

## [0.0.41] - 2024-07-23

### Changed

- nothing change, code refactor

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

- nothing changed. Code refactor, deal with async. Maybe I can use RxJS, but I'm
  not familiar with it.

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
