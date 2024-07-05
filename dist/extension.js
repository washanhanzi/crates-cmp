"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/.pnpm/semver@7.6.2/node_modules/semver/internal/constants.js
var require_constants = __commonJS({
  "node_modules/.pnpm/semver@7.6.2/node_modules/semver/internal/constants.js"(exports2, module2) {
    var SEMVER_SPEC_VERSION = "2.0.0";
    var MAX_LENGTH = 256;
    var MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
    9007199254740991;
    var MAX_SAFE_COMPONENT_LENGTH = 16;
    var MAX_SAFE_BUILD_LENGTH = MAX_LENGTH - 6;
    var RELEASE_TYPES = [
      "major",
      "premajor",
      "minor",
      "preminor",
      "patch",
      "prepatch",
      "prerelease"
    ];
    module2.exports = {
      MAX_LENGTH,
      MAX_SAFE_COMPONENT_LENGTH,
      MAX_SAFE_BUILD_LENGTH,
      MAX_SAFE_INTEGER,
      RELEASE_TYPES,
      SEMVER_SPEC_VERSION,
      FLAG_INCLUDE_PRERELEASE: 1,
      FLAG_LOOSE: 2
    };
  }
});

// node_modules/.pnpm/semver@7.6.2/node_modules/semver/internal/debug.js
var require_debug = __commonJS({
  "node_modules/.pnpm/semver@7.6.2/node_modules/semver/internal/debug.js"(exports2, module2) {
    var debug = typeof process === "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...args) => console.error("SEMVER", ...args) : () => {
    };
    module2.exports = debug;
  }
});

// node_modules/.pnpm/semver@7.6.2/node_modules/semver/internal/re.js
var require_re = __commonJS({
  "node_modules/.pnpm/semver@7.6.2/node_modules/semver/internal/re.js"(exports2, module2) {
    var {
      MAX_SAFE_COMPONENT_LENGTH,
      MAX_SAFE_BUILD_LENGTH,
      MAX_LENGTH
    } = require_constants();
    var debug = require_debug();
    exports2 = module2.exports = {};
    var re = exports2.re = [];
    var safeRe = exports2.safeRe = [];
    var src = exports2.src = [];
    var t = exports2.t = {};
    var R = 0;
    var LETTERDASHNUMBER = "[a-zA-Z0-9-]";
    var safeRegexReplacements = [
      ["\\s", 1],
      ["\\d", MAX_LENGTH],
      [LETTERDASHNUMBER, MAX_SAFE_BUILD_LENGTH]
    ];
    var makeSafeRegex = (value) => {
      for (const [token, max] of safeRegexReplacements) {
        value = value.split(`${token}*`).join(`${token}{0,${max}}`).split(`${token}+`).join(`${token}{1,${max}}`);
      }
      return value;
    };
    var createToken = (name, value, isGlobal) => {
      const safe = makeSafeRegex(value);
      const index = R++;
      debug(name, index, value);
      t[name] = index;
      src[index] = value;
      re[index] = new RegExp(value, isGlobal ? "g" : void 0);
      safeRe[index] = new RegExp(safe, isGlobal ? "g" : void 0);
    };
    createToken("NUMERICIDENTIFIER", "0|[1-9]\\d*");
    createToken("NUMERICIDENTIFIERLOOSE", "\\d+");
    createToken("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${LETTERDASHNUMBER}*`);
    createToken("MAINVERSION", `(${src[t.NUMERICIDENTIFIER]})\\.(${src[t.NUMERICIDENTIFIER]})\\.(${src[t.NUMERICIDENTIFIER]})`);
    createToken("MAINVERSIONLOOSE", `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.(${src[t.NUMERICIDENTIFIERLOOSE]})\\.(${src[t.NUMERICIDENTIFIERLOOSE]})`);
    createToken("PRERELEASEIDENTIFIER", `(?:${src[t.NUMERICIDENTIFIER]}|${src[t.NONNUMERICIDENTIFIER]})`);
    createToken("PRERELEASEIDENTIFIERLOOSE", `(?:${src[t.NUMERICIDENTIFIERLOOSE]}|${src[t.NONNUMERICIDENTIFIER]})`);
    createToken("PRERELEASE", `(?:-(${src[t.PRERELEASEIDENTIFIER]}(?:\\.${src[t.PRERELEASEIDENTIFIER]})*))`);
    createToken("PRERELEASELOOSE", `(?:-?(${src[t.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${src[t.PRERELEASEIDENTIFIERLOOSE]})*))`);
    createToken("BUILDIDENTIFIER", `${LETTERDASHNUMBER}+`);
    createToken("BUILD", `(?:\\+(${src[t.BUILDIDENTIFIER]}(?:\\.${src[t.BUILDIDENTIFIER]})*))`);
    createToken("FULLPLAIN", `v?${src[t.MAINVERSION]}${src[t.PRERELEASE]}?${src[t.BUILD]}?`);
    createToken("FULL", `^${src[t.FULLPLAIN]}$`);
    createToken("LOOSEPLAIN", `[v=\\s]*${src[t.MAINVERSIONLOOSE]}${src[t.PRERELEASELOOSE]}?${src[t.BUILD]}?`);
    createToken("LOOSE", `^${src[t.LOOSEPLAIN]}$`);
    createToken("GTLT", "((?:<|>)?=?)");
    createToken("XRANGEIDENTIFIERLOOSE", `${src[t.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`);
    createToken("XRANGEIDENTIFIER", `${src[t.NUMERICIDENTIFIER]}|x|X|\\*`);
    createToken("XRANGEPLAIN", `[v=\\s]*(${src[t.XRANGEIDENTIFIER]})(?:\\.(${src[t.XRANGEIDENTIFIER]})(?:\\.(${src[t.XRANGEIDENTIFIER]})(?:${src[t.PRERELEASE]})?${src[t.BUILD]}?)?)?`);
    createToken("XRANGEPLAINLOOSE", `[v=\\s]*(${src[t.XRANGEIDENTIFIERLOOSE]})(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})(?:${src[t.PRERELEASELOOSE]})?${src[t.BUILD]}?)?)?`);
    createToken("XRANGE", `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAIN]}$`);
    createToken("XRANGELOOSE", `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAINLOOSE]}$`);
    createToken("COERCEPLAIN", `${"(^|[^\\d])(\\d{1,"}${MAX_SAFE_COMPONENT_LENGTH}})(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?`);
    createToken("COERCE", `${src[t.COERCEPLAIN]}(?:$|[^\\d])`);
    createToken("COERCEFULL", src[t.COERCEPLAIN] + `(?:${src[t.PRERELEASE]})?(?:${src[t.BUILD]})?(?:$|[^\\d])`);
    createToken("COERCERTL", src[t.COERCE], true);
    createToken("COERCERTLFULL", src[t.COERCEFULL], true);
    createToken("LONETILDE", "(?:~>?)");
    createToken("TILDETRIM", `(\\s*)${src[t.LONETILDE]}\\s+`, true);
    exports2.tildeTrimReplace = "$1~";
    createToken("TILDE", `^${src[t.LONETILDE]}${src[t.XRANGEPLAIN]}$`);
    createToken("TILDELOOSE", `^${src[t.LONETILDE]}${src[t.XRANGEPLAINLOOSE]}$`);
    createToken("LONECARET", "(?:\\^)");
    createToken("CARETTRIM", `(\\s*)${src[t.LONECARET]}\\s+`, true);
    exports2.caretTrimReplace = "$1^";
    createToken("CARET", `^${src[t.LONECARET]}${src[t.XRANGEPLAIN]}$`);
    createToken("CARETLOOSE", `^${src[t.LONECARET]}${src[t.XRANGEPLAINLOOSE]}$`);
    createToken("COMPARATORLOOSE", `^${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]})$|^$`);
    createToken("COMPARATOR", `^${src[t.GTLT]}\\s*(${src[t.FULLPLAIN]})$|^$`);
    createToken("COMPARATORTRIM", `(\\s*)${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]}|${src[t.XRANGEPLAIN]})`, true);
    exports2.comparatorTrimReplace = "$1$2$3";
    createToken("HYPHENRANGE", `^\\s*(${src[t.XRANGEPLAIN]})\\s+-\\s+(${src[t.XRANGEPLAIN]})\\s*$`);
    createToken("HYPHENRANGELOOSE", `^\\s*(${src[t.XRANGEPLAINLOOSE]})\\s+-\\s+(${src[t.XRANGEPLAINLOOSE]})\\s*$`);
    createToken("STAR", "(<|>)?=?\\s*\\*");
    createToken("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$");
    createToken("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
  }
});

// node_modules/.pnpm/semver@7.6.2/node_modules/semver/internal/parse-options.js
var require_parse_options = __commonJS({
  "node_modules/.pnpm/semver@7.6.2/node_modules/semver/internal/parse-options.js"(exports2, module2) {
    var looseOption = Object.freeze({ loose: true });
    var emptyOpts = Object.freeze({});
    var parseOptions = (options) => {
      if (!options) {
        return emptyOpts;
      }
      if (typeof options !== "object") {
        return looseOption;
      }
      return options;
    };
    module2.exports = parseOptions;
  }
});

// node_modules/.pnpm/semver@7.6.2/node_modules/semver/internal/identifiers.js
var require_identifiers = __commonJS({
  "node_modules/.pnpm/semver@7.6.2/node_modules/semver/internal/identifiers.js"(exports2, module2) {
    var numeric = /^[0-9]+$/;
    var compareIdentifiers = (a, b) => {
      const anum = numeric.test(a);
      const bnum = numeric.test(b);
      if (anum && bnum) {
        a = +a;
        b = +b;
      }
      return a === b ? 0 : anum && !bnum ? -1 : bnum && !anum ? 1 : a < b ? -1 : 1;
    };
    var rcompareIdentifiers = (a, b) => compareIdentifiers(b, a);
    module2.exports = {
      compareIdentifiers,
      rcompareIdentifiers
    };
  }
});

// node_modules/.pnpm/semver@7.6.2/node_modules/semver/classes/semver.js
var require_semver = __commonJS({
  "node_modules/.pnpm/semver@7.6.2/node_modules/semver/classes/semver.js"(exports2, module2) {
    var debug = require_debug();
    var { MAX_LENGTH, MAX_SAFE_INTEGER } = require_constants();
    var { safeRe: re, t } = require_re();
    var parseOptions = require_parse_options();
    var { compareIdentifiers } = require_identifiers();
    var SemVer = class _SemVer {
      constructor(version, options) {
        options = parseOptions(options);
        if (version instanceof _SemVer) {
          if (version.loose === !!options.loose && version.includePrerelease === !!options.includePrerelease) {
            return version;
          } else {
            version = version.version;
          }
        } else if (typeof version !== "string") {
          throw new TypeError(`Invalid version. Must be a string. Got type "${typeof version}".`);
        }
        if (version.length > MAX_LENGTH) {
          throw new TypeError(
            `version is longer than ${MAX_LENGTH} characters`
          );
        }
        debug("SemVer", version, options);
        this.options = options;
        this.loose = !!options.loose;
        this.includePrerelease = !!options.includePrerelease;
        const m = version.trim().match(options.loose ? re[t.LOOSE] : re[t.FULL]);
        if (!m) {
          throw new TypeError(`Invalid Version: ${version}`);
        }
        this.raw = version;
        this.major = +m[1];
        this.minor = +m[2];
        this.patch = +m[3];
        if (this.major > MAX_SAFE_INTEGER || this.major < 0) {
          throw new TypeError("Invalid major version");
        }
        if (this.minor > MAX_SAFE_INTEGER || this.minor < 0) {
          throw new TypeError("Invalid minor version");
        }
        if (this.patch > MAX_SAFE_INTEGER || this.patch < 0) {
          throw new TypeError("Invalid patch version");
        }
        if (!m[4]) {
          this.prerelease = [];
        } else {
          this.prerelease = m[4].split(".").map((id) => {
            if (/^[0-9]+$/.test(id)) {
              const num = +id;
              if (num >= 0 && num < MAX_SAFE_INTEGER) {
                return num;
              }
            }
            return id;
          });
        }
        this.build = m[5] ? m[5].split(".") : [];
        this.format();
      }
      format() {
        this.version = `${this.major}.${this.minor}.${this.patch}`;
        if (this.prerelease.length) {
          this.version += `-${this.prerelease.join(".")}`;
        }
        return this.version;
      }
      toString() {
        return this.version;
      }
      compare(other) {
        debug("SemVer.compare", this.version, this.options, other);
        if (!(other instanceof _SemVer)) {
          if (typeof other === "string" && other === this.version) {
            return 0;
          }
          other = new _SemVer(other, this.options);
        }
        if (other.version === this.version) {
          return 0;
        }
        return this.compareMain(other) || this.comparePre(other);
      }
      compareMain(other) {
        if (!(other instanceof _SemVer)) {
          other = new _SemVer(other, this.options);
        }
        return compareIdentifiers(this.major, other.major) || compareIdentifiers(this.minor, other.minor) || compareIdentifiers(this.patch, other.patch);
      }
      comparePre(other) {
        if (!(other instanceof _SemVer)) {
          other = new _SemVer(other, this.options);
        }
        if (this.prerelease.length && !other.prerelease.length) {
          return -1;
        } else if (!this.prerelease.length && other.prerelease.length) {
          return 1;
        } else if (!this.prerelease.length && !other.prerelease.length) {
          return 0;
        }
        let i = 0;
        do {
          const a = this.prerelease[i];
          const b = other.prerelease[i];
          debug("prerelease compare", i, a, b);
          if (a === void 0 && b === void 0) {
            return 0;
          } else if (b === void 0) {
            return 1;
          } else if (a === void 0) {
            return -1;
          } else if (a === b) {
            continue;
          } else {
            return compareIdentifiers(a, b);
          }
        } while (++i);
      }
      compareBuild(other) {
        if (!(other instanceof _SemVer)) {
          other = new _SemVer(other, this.options);
        }
        let i = 0;
        do {
          const a = this.build[i];
          const b = other.build[i];
          debug("build compare", i, a, b);
          if (a === void 0 && b === void 0) {
            return 0;
          } else if (b === void 0) {
            return 1;
          } else if (a === void 0) {
            return -1;
          } else if (a === b) {
            continue;
          } else {
            return compareIdentifiers(a, b);
          }
        } while (++i);
      }
      // preminor will bump the version up to the next minor release, and immediately
      // down to pre-release. premajor and prepatch work the same way.
      inc(release, identifier, identifierBase) {
        switch (release) {
          case "premajor":
            this.prerelease.length = 0;
            this.patch = 0;
            this.minor = 0;
            this.major++;
            this.inc("pre", identifier, identifierBase);
            break;
          case "preminor":
            this.prerelease.length = 0;
            this.patch = 0;
            this.minor++;
            this.inc("pre", identifier, identifierBase);
            break;
          case "prepatch":
            this.prerelease.length = 0;
            this.inc("patch", identifier, identifierBase);
            this.inc("pre", identifier, identifierBase);
            break;
          case "prerelease":
            if (this.prerelease.length === 0) {
              this.inc("patch", identifier, identifierBase);
            }
            this.inc("pre", identifier, identifierBase);
            break;
          case "major":
            if (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) {
              this.major++;
            }
            this.minor = 0;
            this.patch = 0;
            this.prerelease = [];
            break;
          case "minor":
            if (this.patch !== 0 || this.prerelease.length === 0) {
              this.minor++;
            }
            this.patch = 0;
            this.prerelease = [];
            break;
          case "patch":
            if (this.prerelease.length === 0) {
              this.patch++;
            }
            this.prerelease = [];
            break;
          case "pre": {
            const base = Number(identifierBase) ? 1 : 0;
            if (!identifier && identifierBase === false) {
              throw new Error("invalid increment argument: identifier is empty");
            }
            if (this.prerelease.length === 0) {
              this.prerelease = [base];
            } else {
              let i = this.prerelease.length;
              while (--i >= 0) {
                if (typeof this.prerelease[i] === "number") {
                  this.prerelease[i]++;
                  i = -2;
                }
              }
              if (i === -1) {
                if (identifier === this.prerelease.join(".") && identifierBase === false) {
                  throw new Error("invalid increment argument: identifier already exists");
                }
                this.prerelease.push(base);
              }
            }
            if (identifier) {
              let prerelease3 = [identifier, base];
              if (identifierBase === false) {
                prerelease3 = [identifier];
              }
              if (compareIdentifiers(this.prerelease[0], identifier) === 0) {
                if (isNaN(this.prerelease[1])) {
                  this.prerelease = prerelease3;
                }
              } else {
                this.prerelease = prerelease3;
              }
            }
            break;
          }
          default:
            throw new Error(`invalid increment argument: ${release}`);
        }
        this.raw = this.format();
        if (this.build.length) {
          this.raw += `+${this.build.join(".")}`;
        }
        return this;
      }
    };
    module2.exports = SemVer;
  }
});

// node_modules/.pnpm/semver@7.6.2/node_modules/semver/functions/parse.js
var require_parse = __commonJS({
  "node_modules/.pnpm/semver@7.6.2/node_modules/semver/functions/parse.js"(exports2, module2) {
    var SemVer = require_semver();
    var parse = (version, options, throwErrors = false) => {
      if (version instanceof SemVer) {
        return version;
      }
      try {
        return new SemVer(version, options);
      } catch (er) {
        if (!throwErrors) {
          return null;
        }
        throw er;
      }
    };
    module2.exports = parse;
  }
});

// node_modules/.pnpm/semver@7.6.2/node_modules/semver/functions/valid.js
var require_valid = __commonJS({
  "node_modules/.pnpm/semver@7.6.2/node_modules/semver/functions/valid.js"(exports2, module2) {
    var parse = require_parse();
    var valid = (version, options) => {
      const v = parse(version, options);
      return v ? v.version : null;
    };
    module2.exports = valid;
  }
});

// node_modules/.pnpm/semver@7.6.2/node_modules/semver/functions/clean.js
var require_clean = __commonJS({
  "node_modules/.pnpm/semver@7.6.2/node_modules/semver/functions/clean.js"(exports2, module2) {
    var parse = require_parse();
    var clean = (version, options) => {
      const s = parse(version.trim().replace(/^[=v]+/, ""), options);
      return s ? s.version : null;
    };
    module2.exports = clean;
  }
});

// node_modules/.pnpm/semver@7.6.2/node_modules/semver/functions/inc.js
var require_inc = __commonJS({
  "node_modules/.pnpm/semver@7.6.2/node_modules/semver/functions/inc.js"(exports2, module2) {
    var SemVer = require_semver();
    var inc = (version, release, options, identifier, identifierBase) => {
      if (typeof options === "string") {
        identifierBase = identifier;
        identifier = options;
        options = void 0;
      }
      try {
        return new SemVer(
          version instanceof SemVer ? version.version : version,
          options
        ).inc(release, identifier, identifierBase).version;
      } catch (er) {
        return null;
      }
    };
    module2.exports = inc;
  }
});

// node_modules/.pnpm/semver@7.6.2/node_modules/semver/functions/diff.js
var require_diff = __commonJS({
  "node_modules/.pnpm/semver@7.6.2/node_modules/semver/functions/diff.js"(exports2, module2) {
    var parse = require_parse();
    var diff = (version1, version2) => {
      const v1 = parse(version1, null, true);
      const v2 = parse(version2, null, true);
      const comparison = v1.compare(v2);
      if (comparison === 0) {
        return null;
      }
      const v1Higher = comparison > 0;
      const highVersion = v1Higher ? v1 : v2;
      const lowVersion = v1Higher ? v2 : v1;
      const highHasPre = !!highVersion.prerelease.length;
      const lowHasPre = !!lowVersion.prerelease.length;
      if (lowHasPre && !highHasPre) {
        if (!lowVersion.patch && !lowVersion.minor) {
          return "major";
        }
        if (highVersion.patch) {
          return "patch";
        }
        if (highVersion.minor) {
          return "minor";
        }
        return "major";
      }
      const prefix = highHasPre ? "pre" : "";
      if (v1.major !== v2.major) {
        return prefix + "major";
      }
      if (v1.minor !== v2.minor) {
        return prefix + "minor";
      }
      if (v1.patch !== v2.patch) {
        return prefix + "patch";
      }
      return "prerelease";
    };
    module2.exports = diff;
  }
});

// node_modules/.pnpm/semver@7.6.2/node_modules/semver/functions/major.js
var require_major = __commonJS({
  "node_modules/.pnpm/semver@7.6.2/node_modules/semver/functions/major.js"(exports2, module2) {
    var SemVer = require_semver();
    var major = (a, loose) => new SemVer(a, loose).major;
    module2.exports = major;
  }
});

// node_modules/.pnpm/semver@7.6.2/node_modules/semver/functions/minor.js
var require_minor = __commonJS({
  "node_modules/.pnpm/semver@7.6.2/node_modules/semver/functions/minor.js"(exports2, module2) {
    var SemVer = require_semver();
    var minor = (a, loose) => new SemVer(a, loose).minor;
    module2.exports = minor;
  }
});

// node_modules/.pnpm/semver@7.6.2/node_modules/semver/functions/patch.js
var require_patch = __commonJS({
  "node_modules/.pnpm/semver@7.6.2/node_modules/semver/functions/patch.js"(exports2, module2) {
    var SemVer = require_semver();
    var patch = (a, loose) => new SemVer(a, loose).patch;
    module2.exports = patch;
  }
});

// node_modules/.pnpm/semver@7.6.2/node_modules/semver/functions/prerelease.js
var require_prerelease = __commonJS({
  "node_modules/.pnpm/semver@7.6.2/node_modules/semver/functions/prerelease.js"(exports2, module2) {
    var parse = require_parse();
    var prerelease3 = (version, options) => {
      const parsed = parse(version, options);
      return parsed && parsed.prerelease.length ? parsed.prerelease : null;
    };
    module2.exports = prerelease3;
  }
});

// node_modules/.pnpm/semver@7.6.2/node_modules/semver/functions/compare.js
var require_compare = __commonJS({
  "node_modules/.pnpm/semver@7.6.2/node_modules/semver/functions/compare.js"(exports2, module2) {
    var SemVer = require_semver();
    var compare = (a, b, loose) => new SemVer(a, loose).compare(new SemVer(b, loose));
    module2.exports = compare;
  }
});

// node_modules/.pnpm/semver@7.6.2/node_modules/semver/functions/rcompare.js
var require_rcompare = __commonJS({
  "node_modules/.pnpm/semver@7.6.2/node_modules/semver/functions/rcompare.js"(exports2, module2) {
    var compare = require_compare();
    var rcompare = (a, b, loose) => compare(b, a, loose);
    module2.exports = rcompare;
  }
});

// node_modules/.pnpm/semver@7.6.2/node_modules/semver/functions/compare-loose.js
var require_compare_loose = __commonJS({
  "node_modules/.pnpm/semver@7.6.2/node_modules/semver/functions/compare-loose.js"(exports2, module2) {
    var compare = require_compare();
    var compareLoose = (a, b) => compare(a, b, true);
    module2.exports = compareLoose;
  }
});

// node_modules/.pnpm/semver@7.6.2/node_modules/semver/functions/compare-build.js
var require_compare_build = __commonJS({
  "node_modules/.pnpm/semver@7.6.2/node_modules/semver/functions/compare-build.js"(exports2, module2) {
    var SemVer = require_semver();
    var compareBuild = (a, b, loose) => {
      const versionA = new SemVer(a, loose);
      const versionB = new SemVer(b, loose);
      return versionA.compare(versionB) || versionA.compareBuild(versionB);
    };
    module2.exports = compareBuild;
  }
});

// node_modules/.pnpm/semver@7.6.2/node_modules/semver/functions/sort.js
var require_sort = __commonJS({
  "node_modules/.pnpm/semver@7.6.2/node_modules/semver/functions/sort.js"(exports2, module2) {
    var compareBuild = require_compare_build();
    var sort = (list, loose) => list.sort((a, b) => compareBuild(a, b, loose));
    module2.exports = sort;
  }
});

// node_modules/.pnpm/semver@7.6.2/node_modules/semver/functions/rsort.js
var require_rsort = __commonJS({
  "node_modules/.pnpm/semver@7.6.2/node_modules/semver/functions/rsort.js"(exports2, module2) {
    var compareBuild = require_compare_build();
    var rsort = (list, loose) => list.sort((a, b) => compareBuild(b, a, loose));
    module2.exports = rsort;
  }
});

// node_modules/.pnpm/semver@7.6.2/node_modules/semver/functions/gt.js
var require_gt = __commonJS({
  "node_modules/.pnpm/semver@7.6.2/node_modules/semver/functions/gt.js"(exports2, module2) {
    var compare = require_compare();
    var gt = (a, b, loose) => compare(a, b, loose) > 0;
    module2.exports = gt;
  }
});

// node_modules/.pnpm/semver@7.6.2/node_modules/semver/functions/lt.js
var require_lt = __commonJS({
  "node_modules/.pnpm/semver@7.6.2/node_modules/semver/functions/lt.js"(exports2, module2) {
    var compare = require_compare();
    var lt = (a, b, loose) => compare(a, b, loose) < 0;
    module2.exports = lt;
  }
});

// node_modules/.pnpm/semver@7.6.2/node_modules/semver/functions/eq.js
var require_eq = __commonJS({
  "node_modules/.pnpm/semver@7.6.2/node_modules/semver/functions/eq.js"(exports2, module2) {
    var compare = require_compare();
    var eq = (a, b, loose) => compare(a, b, loose) === 0;
    module2.exports = eq;
  }
});

// node_modules/.pnpm/semver@7.6.2/node_modules/semver/functions/neq.js
var require_neq = __commonJS({
  "node_modules/.pnpm/semver@7.6.2/node_modules/semver/functions/neq.js"(exports2, module2) {
    var compare = require_compare();
    var neq = (a, b, loose) => compare(a, b, loose) !== 0;
    module2.exports = neq;
  }
});

// node_modules/.pnpm/semver@7.6.2/node_modules/semver/functions/gte.js
var require_gte = __commonJS({
  "node_modules/.pnpm/semver@7.6.2/node_modules/semver/functions/gte.js"(exports2, module2) {
    var compare = require_compare();
    var gte = (a, b, loose) => compare(a, b, loose) >= 0;
    module2.exports = gte;
  }
});

// node_modules/.pnpm/semver@7.6.2/node_modules/semver/functions/lte.js
var require_lte = __commonJS({
  "node_modules/.pnpm/semver@7.6.2/node_modules/semver/functions/lte.js"(exports2, module2) {
    var compare = require_compare();
    var lte = (a, b, loose) => compare(a, b, loose) <= 0;
    module2.exports = lte;
  }
});

// node_modules/.pnpm/semver@7.6.2/node_modules/semver/functions/cmp.js
var require_cmp = __commonJS({
  "node_modules/.pnpm/semver@7.6.2/node_modules/semver/functions/cmp.js"(exports2, module2) {
    var eq = require_eq();
    var neq = require_neq();
    var gt = require_gt();
    var gte = require_gte();
    var lt = require_lt();
    var lte = require_lte();
    var cmp = (a, op, b, loose) => {
      switch (op) {
        case "===":
          if (typeof a === "object") {
            a = a.version;
          }
          if (typeof b === "object") {
            b = b.version;
          }
          return a === b;
        case "!==":
          if (typeof a === "object") {
            a = a.version;
          }
          if (typeof b === "object") {
            b = b.version;
          }
          return a !== b;
        case "":
        case "=":
        case "==":
          return eq(a, b, loose);
        case "!=":
          return neq(a, b, loose);
        case ">":
          return gt(a, b, loose);
        case ">=":
          return gte(a, b, loose);
        case "<":
          return lt(a, b, loose);
        case "<=":
          return lte(a, b, loose);
        default:
          throw new TypeError(`Invalid operator: ${op}`);
      }
    };
    module2.exports = cmp;
  }
});

// node_modules/.pnpm/semver@7.6.2/node_modules/semver/functions/coerce.js
var require_coerce = __commonJS({
  "node_modules/.pnpm/semver@7.6.2/node_modules/semver/functions/coerce.js"(exports2, module2) {
    var SemVer = require_semver();
    var parse = require_parse();
    var { safeRe: re, t } = require_re();
    var coerce = (version, options) => {
      if (version instanceof SemVer) {
        return version;
      }
      if (typeof version === "number") {
        version = String(version);
      }
      if (typeof version !== "string") {
        return null;
      }
      options = options || {};
      let match = null;
      if (!options.rtl) {
        match = version.match(options.includePrerelease ? re[t.COERCEFULL] : re[t.COERCE]);
      } else {
        const coerceRtlRegex = options.includePrerelease ? re[t.COERCERTLFULL] : re[t.COERCERTL];
        let next;
        while ((next = coerceRtlRegex.exec(version)) && (!match || match.index + match[0].length !== version.length)) {
          if (!match || next.index + next[0].length !== match.index + match[0].length) {
            match = next;
          }
          coerceRtlRegex.lastIndex = next.index + next[1].length + next[2].length;
        }
        coerceRtlRegex.lastIndex = -1;
      }
      if (match === null) {
        return null;
      }
      const major = match[2];
      const minor = match[3] || "0";
      const patch = match[4] || "0";
      const prerelease3 = options.includePrerelease && match[5] ? `-${match[5]}` : "";
      const build = options.includePrerelease && match[6] ? `+${match[6]}` : "";
      return parse(`${major}.${minor}.${patch}${prerelease3}${build}`, options);
    };
    module2.exports = coerce;
  }
});

// node_modules/.pnpm/semver@7.6.2/node_modules/semver/internal/lrucache.js
var require_lrucache = __commonJS({
  "node_modules/.pnpm/semver@7.6.2/node_modules/semver/internal/lrucache.js"(exports2, module2) {
    var LRUCache = class {
      constructor() {
        this.max = 1e3;
        this.map = /* @__PURE__ */ new Map();
      }
      get(key) {
        const value = this.map.get(key);
        if (value === void 0) {
          return void 0;
        } else {
          this.map.delete(key);
          this.map.set(key, value);
          return value;
        }
      }
      delete(key) {
        return this.map.delete(key);
      }
      set(key, value) {
        const deleted = this.delete(key);
        if (!deleted && value !== void 0) {
          if (this.map.size >= this.max) {
            const firstKey = this.map.keys().next().value;
            this.delete(firstKey);
          }
          this.map.set(key, value);
        }
        return this;
      }
    };
    module2.exports = LRUCache;
  }
});

// node_modules/.pnpm/semver@7.6.2/node_modules/semver/classes/range.js
var require_range = __commonJS({
  "node_modules/.pnpm/semver@7.6.2/node_modules/semver/classes/range.js"(exports2, module2) {
    var Range7 = class _Range {
      constructor(range, options) {
        options = parseOptions(options);
        if (range instanceof _Range) {
          if (range.loose === !!options.loose && range.includePrerelease === !!options.includePrerelease) {
            return range;
          } else {
            return new _Range(range.raw, options);
          }
        }
        if (range instanceof Comparator) {
          this.raw = range.value;
          this.set = [[range]];
          this.format();
          return this;
        }
        this.options = options;
        this.loose = !!options.loose;
        this.includePrerelease = !!options.includePrerelease;
        this.raw = range.trim().split(/\s+/).join(" ");
        this.set = this.raw.split("||").map((r) => this.parseRange(r.trim())).filter((c) => c.length);
        if (!this.set.length) {
          throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
        }
        if (this.set.length > 1) {
          const first = this.set[0];
          this.set = this.set.filter((c) => !isNullSet(c[0]));
          if (this.set.length === 0) {
            this.set = [first];
          } else if (this.set.length > 1) {
            for (const c of this.set) {
              if (c.length === 1 && isAny(c[0])) {
                this.set = [c];
                break;
              }
            }
          }
        }
        this.format();
      }
      format() {
        this.range = this.set.map((comps) => comps.join(" ").trim()).join("||").trim();
        return this.range;
      }
      toString() {
        return this.range;
      }
      parseRange(range) {
        const memoOpts = (this.options.includePrerelease && FLAG_INCLUDE_PRERELEASE) | (this.options.loose && FLAG_LOOSE);
        const memoKey = memoOpts + ":" + range;
        const cached = cache.get(memoKey);
        if (cached) {
          return cached;
        }
        const loose = this.options.loose;
        const hr = loose ? re[t.HYPHENRANGELOOSE] : re[t.HYPHENRANGE];
        range = range.replace(hr, hyphenReplace(this.options.includePrerelease));
        debug("hyphen replace", range);
        range = range.replace(re[t.COMPARATORTRIM], comparatorTrimReplace);
        debug("comparator trim", range);
        range = range.replace(re[t.TILDETRIM], tildeTrimReplace);
        debug("tilde trim", range);
        range = range.replace(re[t.CARETTRIM], caretTrimReplace);
        debug("caret trim", range);
        let rangeList = range.split(" ").map((comp) => parseComparator(comp, this.options)).join(" ").split(/\s+/).map((comp) => replaceGTE0(comp, this.options));
        if (loose) {
          rangeList = rangeList.filter((comp) => {
            debug("loose invalid filter", comp, this.options);
            return !!comp.match(re[t.COMPARATORLOOSE]);
          });
        }
        debug("range list", rangeList);
        const rangeMap = /* @__PURE__ */ new Map();
        const comparators = rangeList.map((comp) => new Comparator(comp, this.options));
        for (const comp of comparators) {
          if (isNullSet(comp)) {
            return [comp];
          }
          rangeMap.set(comp.value, comp);
        }
        if (rangeMap.size > 1 && rangeMap.has("")) {
          rangeMap.delete("");
        }
        const result = [...rangeMap.values()];
        cache.set(memoKey, result);
        return result;
      }
      intersects(range, options) {
        if (!(range instanceof _Range)) {
          throw new TypeError("a Range is required");
        }
        return this.set.some((thisComparators) => {
          return isSatisfiable(thisComparators, options) && range.set.some((rangeComparators) => {
            return isSatisfiable(rangeComparators, options) && thisComparators.every((thisComparator) => {
              return rangeComparators.every((rangeComparator) => {
                return thisComparator.intersects(rangeComparator, options);
              });
            });
          });
        });
      }
      // if ANY of the sets match ALL of its comparators, then pass
      test(version) {
        if (!version) {
          return false;
        }
        if (typeof version === "string") {
          try {
            version = new SemVer(version, this.options);
          } catch (er) {
            return false;
          }
        }
        for (let i = 0; i < this.set.length; i++) {
          if (testSet(this.set[i], version, this.options)) {
            return true;
          }
        }
        return false;
      }
    };
    module2.exports = Range7;
    var LRU = require_lrucache();
    var cache = new LRU();
    var parseOptions = require_parse_options();
    var Comparator = require_comparator();
    var debug = require_debug();
    var SemVer = require_semver();
    var {
      safeRe: re,
      t,
      comparatorTrimReplace,
      tildeTrimReplace,
      caretTrimReplace
    } = require_re();
    var { FLAG_INCLUDE_PRERELEASE, FLAG_LOOSE } = require_constants();
    var isNullSet = (c) => c.value === "<0.0.0-0";
    var isAny = (c) => c.value === "";
    var isSatisfiable = (comparators, options) => {
      let result = true;
      const remainingComparators = comparators.slice();
      let testComparator = remainingComparators.pop();
      while (result && remainingComparators.length) {
        result = remainingComparators.every((otherComparator) => {
          return testComparator.intersects(otherComparator, options);
        });
        testComparator = remainingComparators.pop();
      }
      return result;
    };
    var parseComparator = (comp, options) => {
      debug("comp", comp, options);
      comp = replaceCarets(comp, options);
      debug("caret", comp);
      comp = replaceTildes(comp, options);
      debug("tildes", comp);
      comp = replaceXRanges(comp, options);
      debug("xrange", comp);
      comp = replaceStars(comp, options);
      debug("stars", comp);
      return comp;
    };
    var isX = (id) => !id || id.toLowerCase() === "x" || id === "*";
    var replaceTildes = (comp, options) => {
      return comp.trim().split(/\s+/).map((c) => replaceTilde(c, options)).join(" ");
    };
    var replaceTilde = (comp, options) => {
      const r = options.loose ? re[t.TILDELOOSE] : re[t.TILDE];
      return comp.replace(r, (_, M, m, p, pr) => {
        debug("tilde", comp, _, M, m, p, pr);
        let ret;
        if (isX(M)) {
          ret = "";
        } else if (isX(m)) {
          ret = `>=${M}.0.0 <${+M + 1}.0.0-0`;
        } else if (isX(p)) {
          ret = `>=${M}.${m}.0 <${M}.${+m + 1}.0-0`;
        } else if (pr) {
          debug("replaceTilde pr", pr);
          ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
        } else {
          ret = `>=${M}.${m}.${p} <${M}.${+m + 1}.0-0`;
        }
        debug("tilde return", ret);
        return ret;
      });
    };
    var replaceCarets = (comp, options) => {
      return comp.trim().split(/\s+/).map((c) => replaceCaret(c, options)).join(" ");
    };
    var replaceCaret = (comp, options) => {
      debug("caret", comp, options);
      const r = options.loose ? re[t.CARETLOOSE] : re[t.CARET];
      const z = options.includePrerelease ? "-0" : "";
      return comp.replace(r, (_, M, m, p, pr) => {
        debug("caret", comp, _, M, m, p, pr);
        let ret;
        if (isX(M)) {
          ret = "";
        } else if (isX(m)) {
          ret = `>=${M}.0.0${z} <${+M + 1}.0.0-0`;
        } else if (isX(p)) {
          if (M === "0") {
            ret = `>=${M}.${m}.0${z} <${M}.${+m + 1}.0-0`;
          } else {
            ret = `>=${M}.${m}.0${z} <${+M + 1}.0.0-0`;
          }
        } else if (pr) {
          debug("replaceCaret pr", pr);
          if (M === "0") {
            if (m === "0") {
              ret = `>=${M}.${m}.${p}-${pr} <${M}.${m}.${+p + 1}-0`;
            } else {
              ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
            }
          } else {
            ret = `>=${M}.${m}.${p}-${pr} <${+M + 1}.0.0-0`;
          }
        } else {
          debug("no pr");
          if (M === "0") {
            if (m === "0") {
              ret = `>=${M}.${m}.${p}${z} <${M}.${m}.${+p + 1}-0`;
            } else {
              ret = `>=${M}.${m}.${p}${z} <${M}.${+m + 1}.0-0`;
            }
          } else {
            ret = `>=${M}.${m}.${p} <${+M + 1}.0.0-0`;
          }
        }
        debug("caret return", ret);
        return ret;
      });
    };
    var replaceXRanges = (comp, options) => {
      debug("replaceXRanges", comp, options);
      return comp.split(/\s+/).map((c) => replaceXRange(c, options)).join(" ");
    };
    var replaceXRange = (comp, options) => {
      comp = comp.trim();
      const r = options.loose ? re[t.XRANGELOOSE] : re[t.XRANGE];
      return comp.replace(r, (ret, gtlt, M, m, p, pr) => {
        debug("xRange", comp, ret, gtlt, M, m, p, pr);
        const xM = isX(M);
        const xm = xM || isX(m);
        const xp = xm || isX(p);
        const anyX = xp;
        if (gtlt === "=" && anyX) {
          gtlt = "";
        }
        pr = options.includePrerelease ? "-0" : "";
        if (xM) {
          if (gtlt === ">" || gtlt === "<") {
            ret = "<0.0.0-0";
          } else {
            ret = "*";
          }
        } else if (gtlt && anyX) {
          if (xm) {
            m = 0;
          }
          p = 0;
          if (gtlt === ">") {
            gtlt = ">=";
            if (xm) {
              M = +M + 1;
              m = 0;
              p = 0;
            } else {
              m = +m + 1;
              p = 0;
            }
          } else if (gtlt === "<=") {
            gtlt = "<";
            if (xm) {
              M = +M + 1;
            } else {
              m = +m + 1;
            }
          }
          if (gtlt === "<") {
            pr = "-0";
          }
          ret = `${gtlt + M}.${m}.${p}${pr}`;
        } else if (xm) {
          ret = `>=${M}.0.0${pr} <${+M + 1}.0.0-0`;
        } else if (xp) {
          ret = `>=${M}.${m}.0${pr} <${M}.${+m + 1}.0-0`;
        }
        debug("xRange return", ret);
        return ret;
      });
    };
    var replaceStars = (comp, options) => {
      debug("replaceStars", comp, options);
      return comp.trim().replace(re[t.STAR], "");
    };
    var replaceGTE0 = (comp, options) => {
      debug("replaceGTE0", comp, options);
      return comp.trim().replace(re[options.includePrerelease ? t.GTE0PRE : t.GTE0], "");
    };
    var hyphenReplace = (incPr) => ($0, from, fM, fm, fp, fpr, fb, to, tM, tm, tp, tpr) => {
      if (isX(fM)) {
        from = "";
      } else if (isX(fm)) {
        from = `>=${fM}.0.0${incPr ? "-0" : ""}`;
      } else if (isX(fp)) {
        from = `>=${fM}.${fm}.0${incPr ? "-0" : ""}`;
      } else if (fpr) {
        from = `>=${from}`;
      } else {
        from = `>=${from}${incPr ? "-0" : ""}`;
      }
      if (isX(tM)) {
        to = "";
      } else if (isX(tm)) {
        to = `<${+tM + 1}.0.0-0`;
      } else if (isX(tp)) {
        to = `<${tM}.${+tm + 1}.0-0`;
      } else if (tpr) {
        to = `<=${tM}.${tm}.${tp}-${tpr}`;
      } else if (incPr) {
        to = `<${tM}.${tm}.${+tp + 1}-0`;
      } else {
        to = `<=${to}`;
      }
      return `${from} ${to}`.trim();
    };
    var testSet = (set, version, options) => {
      for (let i = 0; i < set.length; i++) {
        if (!set[i].test(version)) {
          return false;
        }
      }
      if (version.prerelease.length && !options.includePrerelease) {
        for (let i = 0; i < set.length; i++) {
          debug(set[i].semver);
          if (set[i].semver === Comparator.ANY) {
            continue;
          }
          if (set[i].semver.prerelease.length > 0) {
            const allowed = set[i].semver;
            if (allowed.major === version.major && allowed.minor === version.minor && allowed.patch === version.patch) {
              return true;
            }
          }
        }
        return false;
      }
      return true;
    };
  }
});

// node_modules/.pnpm/semver@7.6.2/node_modules/semver/classes/comparator.js
var require_comparator = __commonJS({
  "node_modules/.pnpm/semver@7.6.2/node_modules/semver/classes/comparator.js"(exports2, module2) {
    var ANY = Symbol("SemVer ANY");
    var Comparator = class _Comparator {
      static get ANY() {
        return ANY;
      }
      constructor(comp, options) {
        options = parseOptions(options);
        if (comp instanceof _Comparator) {
          if (comp.loose === !!options.loose) {
            return comp;
          } else {
            comp = comp.value;
          }
        }
        comp = comp.trim().split(/\s+/).join(" ");
        debug("comparator", comp, options);
        this.options = options;
        this.loose = !!options.loose;
        this.parse(comp);
        if (this.semver === ANY) {
          this.value = "";
        } else {
          this.value = this.operator + this.semver.version;
        }
        debug("comp", this);
      }
      parse(comp) {
        const r = this.options.loose ? re[t.COMPARATORLOOSE] : re[t.COMPARATOR];
        const m = comp.match(r);
        if (!m) {
          throw new TypeError(`Invalid comparator: ${comp}`);
        }
        this.operator = m[1] !== void 0 ? m[1] : "";
        if (this.operator === "=") {
          this.operator = "";
        }
        if (!m[2]) {
          this.semver = ANY;
        } else {
          this.semver = new SemVer(m[2], this.options.loose);
        }
      }
      toString() {
        return this.value;
      }
      test(version) {
        debug("Comparator.test", version, this.options.loose);
        if (this.semver === ANY || version === ANY) {
          return true;
        }
        if (typeof version === "string") {
          try {
            version = new SemVer(version, this.options);
          } catch (er) {
            return false;
          }
        }
        return cmp(version, this.operator, this.semver, this.options);
      }
      intersects(comp, options) {
        if (!(comp instanceof _Comparator)) {
          throw new TypeError("a Comparator is required");
        }
        if (this.operator === "") {
          if (this.value === "") {
            return true;
          }
          return new Range7(comp.value, options).test(this.value);
        } else if (comp.operator === "") {
          if (comp.value === "") {
            return true;
          }
          return new Range7(this.value, options).test(comp.semver);
        }
        options = parseOptions(options);
        if (options.includePrerelease && (this.value === "<0.0.0-0" || comp.value === "<0.0.0-0")) {
          return false;
        }
        if (!options.includePrerelease && (this.value.startsWith("<0.0.0") || comp.value.startsWith("<0.0.0"))) {
          return false;
        }
        if (this.operator.startsWith(">") && comp.operator.startsWith(">")) {
          return true;
        }
        if (this.operator.startsWith("<") && comp.operator.startsWith("<")) {
          return true;
        }
        if (this.semver.version === comp.semver.version && this.operator.includes("=") && comp.operator.includes("=")) {
          return true;
        }
        if (cmp(this.semver, "<", comp.semver, options) && this.operator.startsWith(">") && comp.operator.startsWith("<")) {
          return true;
        }
        if (cmp(this.semver, ">", comp.semver, options) && this.operator.startsWith("<") && comp.operator.startsWith(">")) {
          return true;
        }
        return false;
      }
    };
    module2.exports = Comparator;
    var parseOptions = require_parse_options();
    var { safeRe: re, t } = require_re();
    var cmp = require_cmp();
    var debug = require_debug();
    var SemVer = require_semver();
    var Range7 = require_range();
  }
});

// node_modules/.pnpm/semver@7.6.2/node_modules/semver/functions/satisfies.js
var require_satisfies = __commonJS({
  "node_modules/.pnpm/semver@7.6.2/node_modules/semver/functions/satisfies.js"(exports2, module2) {
    var Range7 = require_range();
    var satisfies3 = (version, range, options) => {
      try {
        range = new Range7(range, options);
      } catch (er) {
        return false;
      }
      return range.test(version);
    };
    module2.exports = satisfies3;
  }
});

// node_modules/.pnpm/semver@7.6.2/node_modules/semver/ranges/to-comparators.js
var require_to_comparators = __commonJS({
  "node_modules/.pnpm/semver@7.6.2/node_modules/semver/ranges/to-comparators.js"(exports2, module2) {
    var Range7 = require_range();
    var toComparators = (range, options) => new Range7(range, options).set.map((comp) => comp.map((c) => c.value).join(" ").trim().split(" "));
    module2.exports = toComparators;
  }
});

// node_modules/.pnpm/semver@7.6.2/node_modules/semver/ranges/max-satisfying.js
var require_max_satisfying = __commonJS({
  "node_modules/.pnpm/semver@7.6.2/node_modules/semver/ranges/max-satisfying.js"(exports2, module2) {
    var SemVer = require_semver();
    var Range7 = require_range();
    var maxSatisfying = (versions, range, options) => {
      let max = null;
      let maxSV = null;
      let rangeObj = null;
      try {
        rangeObj = new Range7(range, options);
      } catch (er) {
        return null;
      }
      versions.forEach((v) => {
        if (rangeObj.test(v)) {
          if (!max || maxSV.compare(v) === -1) {
            max = v;
            maxSV = new SemVer(max, options);
          }
        }
      });
      return max;
    };
    module2.exports = maxSatisfying;
  }
});

// node_modules/.pnpm/semver@7.6.2/node_modules/semver/ranges/min-satisfying.js
var require_min_satisfying = __commonJS({
  "node_modules/.pnpm/semver@7.6.2/node_modules/semver/ranges/min-satisfying.js"(exports2, module2) {
    var SemVer = require_semver();
    var Range7 = require_range();
    var minSatisfying = (versions, range, options) => {
      let min = null;
      let minSV = null;
      let rangeObj = null;
      try {
        rangeObj = new Range7(range, options);
      } catch (er) {
        return null;
      }
      versions.forEach((v) => {
        if (rangeObj.test(v)) {
          if (!min || minSV.compare(v) === 1) {
            min = v;
            minSV = new SemVer(min, options);
          }
        }
      });
      return min;
    };
    module2.exports = minSatisfying;
  }
});

// node_modules/.pnpm/semver@7.6.2/node_modules/semver/ranges/min-version.js
var require_min_version = __commonJS({
  "node_modules/.pnpm/semver@7.6.2/node_modules/semver/ranges/min-version.js"(exports2, module2) {
    var SemVer = require_semver();
    var Range7 = require_range();
    var gt = require_gt();
    var minVersion = (range, loose) => {
      range = new Range7(range, loose);
      let minver = new SemVer("0.0.0");
      if (range.test(minver)) {
        return minver;
      }
      minver = new SemVer("0.0.0-0");
      if (range.test(minver)) {
        return minver;
      }
      minver = null;
      for (let i = 0; i < range.set.length; ++i) {
        const comparators = range.set[i];
        let setMin = null;
        comparators.forEach((comparator) => {
          const compver = new SemVer(comparator.semver.version);
          switch (comparator.operator) {
            case ">":
              if (compver.prerelease.length === 0) {
                compver.patch++;
              } else {
                compver.prerelease.push(0);
              }
              compver.raw = compver.format();
            case "":
            case ">=":
              if (!setMin || gt(compver, setMin)) {
                setMin = compver;
              }
              break;
            case "<":
            case "<=":
              break;
            default:
              throw new Error(`Unexpected operation: ${comparator.operator}`);
          }
        });
        if (setMin && (!minver || gt(minver, setMin))) {
          minver = setMin;
        }
      }
      if (minver && range.test(minver)) {
        return minver;
      }
      return null;
    };
    module2.exports = minVersion;
  }
});

// node_modules/.pnpm/semver@7.6.2/node_modules/semver/ranges/valid.js
var require_valid2 = __commonJS({
  "node_modules/.pnpm/semver@7.6.2/node_modules/semver/ranges/valid.js"(exports2, module2) {
    var Range7 = require_range();
    var validRange = (range, options) => {
      try {
        return new Range7(range, options).range || "*";
      } catch (er) {
        return null;
      }
    };
    module2.exports = validRange;
  }
});

// node_modules/.pnpm/semver@7.6.2/node_modules/semver/ranges/outside.js
var require_outside = __commonJS({
  "node_modules/.pnpm/semver@7.6.2/node_modules/semver/ranges/outside.js"(exports2, module2) {
    var SemVer = require_semver();
    var Comparator = require_comparator();
    var { ANY } = Comparator;
    var Range7 = require_range();
    var satisfies3 = require_satisfies();
    var gt = require_gt();
    var lt = require_lt();
    var lte = require_lte();
    var gte = require_gte();
    var outside = (version, range, hilo, options) => {
      version = new SemVer(version, options);
      range = new Range7(range, options);
      let gtfn, ltefn, ltfn, comp, ecomp;
      switch (hilo) {
        case ">":
          gtfn = gt;
          ltefn = lte;
          ltfn = lt;
          comp = ">";
          ecomp = ">=";
          break;
        case "<":
          gtfn = lt;
          ltefn = gte;
          ltfn = gt;
          comp = "<";
          ecomp = "<=";
          break;
        default:
          throw new TypeError('Must provide a hilo val of "<" or ">"');
      }
      if (satisfies3(version, range, options)) {
        return false;
      }
      for (let i = 0; i < range.set.length; ++i) {
        const comparators = range.set[i];
        let high = null;
        let low = null;
        comparators.forEach((comparator) => {
          if (comparator.semver === ANY) {
            comparator = new Comparator(">=0.0.0");
          }
          high = high || comparator;
          low = low || comparator;
          if (gtfn(comparator.semver, high.semver, options)) {
            high = comparator;
          } else if (ltfn(comparator.semver, low.semver, options)) {
            low = comparator;
          }
        });
        if (high.operator === comp || high.operator === ecomp) {
          return false;
        }
        if ((!low.operator || low.operator === comp) && ltefn(version, low.semver)) {
          return false;
        } else if (low.operator === ecomp && ltfn(version, low.semver)) {
          return false;
        }
      }
      return true;
    };
    module2.exports = outside;
  }
});

// node_modules/.pnpm/semver@7.6.2/node_modules/semver/ranges/gtr.js
var require_gtr = __commonJS({
  "node_modules/.pnpm/semver@7.6.2/node_modules/semver/ranges/gtr.js"(exports2, module2) {
    var outside = require_outside();
    var gtr = (version, range, options) => outside(version, range, ">", options);
    module2.exports = gtr;
  }
});

// node_modules/.pnpm/semver@7.6.2/node_modules/semver/ranges/ltr.js
var require_ltr = __commonJS({
  "node_modules/.pnpm/semver@7.6.2/node_modules/semver/ranges/ltr.js"(exports2, module2) {
    var outside = require_outside();
    var ltr = (version, range, options) => outside(version, range, "<", options);
    module2.exports = ltr;
  }
});

// node_modules/.pnpm/semver@7.6.2/node_modules/semver/ranges/intersects.js
var require_intersects = __commonJS({
  "node_modules/.pnpm/semver@7.6.2/node_modules/semver/ranges/intersects.js"(exports2, module2) {
    var Range7 = require_range();
    var intersects = (r1, r2, options) => {
      r1 = new Range7(r1, options);
      r2 = new Range7(r2, options);
      return r1.intersects(r2, options);
    };
    module2.exports = intersects;
  }
});

// node_modules/.pnpm/semver@7.6.2/node_modules/semver/ranges/simplify.js
var require_simplify = __commonJS({
  "node_modules/.pnpm/semver@7.6.2/node_modules/semver/ranges/simplify.js"(exports2, module2) {
    var satisfies3 = require_satisfies();
    var compare = require_compare();
    module2.exports = (versions, range, options) => {
      const set = [];
      let first = null;
      let prev = null;
      const v = versions.sort((a, b) => compare(a, b, options));
      for (const version of v) {
        const included = satisfies3(version, range, options);
        if (included) {
          prev = version;
          if (!first) {
            first = version;
          }
        } else {
          if (prev) {
            set.push([first, prev]);
          }
          prev = null;
          first = null;
        }
      }
      if (first) {
        set.push([first, null]);
      }
      const ranges = [];
      for (const [min, max] of set) {
        if (min === max) {
          ranges.push(min);
        } else if (!max && min === v[0]) {
          ranges.push("*");
        } else if (!max) {
          ranges.push(`>=${min}`);
        } else if (min === v[0]) {
          ranges.push(`<=${max}`);
        } else {
          ranges.push(`${min} - ${max}`);
        }
      }
      const simplified = ranges.join(" || ");
      const original = typeof range.raw === "string" ? range.raw : String(range);
      return simplified.length < original.length ? simplified : range;
    };
  }
});

// node_modules/.pnpm/semver@7.6.2/node_modules/semver/ranges/subset.js
var require_subset = __commonJS({
  "node_modules/.pnpm/semver@7.6.2/node_modules/semver/ranges/subset.js"(exports2, module2) {
    var Range7 = require_range();
    var Comparator = require_comparator();
    var { ANY } = Comparator;
    var satisfies3 = require_satisfies();
    var compare = require_compare();
    var subset = (sub, dom, options = {}) => {
      if (sub === dom) {
        return true;
      }
      sub = new Range7(sub, options);
      dom = new Range7(dom, options);
      let sawNonNull = false;
      OUTER: for (const simpleSub of sub.set) {
        for (const simpleDom of dom.set) {
          const isSub = simpleSubset(simpleSub, simpleDom, options);
          sawNonNull = sawNonNull || isSub !== null;
          if (isSub) {
            continue OUTER;
          }
        }
        if (sawNonNull) {
          return false;
        }
      }
      return true;
    };
    var minimumVersionWithPreRelease = [new Comparator(">=0.0.0-0")];
    var minimumVersion = [new Comparator(">=0.0.0")];
    var simpleSubset = (sub, dom, options) => {
      if (sub === dom) {
        return true;
      }
      if (sub.length === 1 && sub[0].semver === ANY) {
        if (dom.length === 1 && dom[0].semver === ANY) {
          return true;
        } else if (options.includePrerelease) {
          sub = minimumVersionWithPreRelease;
        } else {
          sub = minimumVersion;
        }
      }
      if (dom.length === 1 && dom[0].semver === ANY) {
        if (options.includePrerelease) {
          return true;
        } else {
          dom = minimumVersion;
        }
      }
      const eqSet = /* @__PURE__ */ new Set();
      let gt, lt;
      for (const c of sub) {
        if (c.operator === ">" || c.operator === ">=") {
          gt = higherGT(gt, c, options);
        } else if (c.operator === "<" || c.operator === "<=") {
          lt = lowerLT(lt, c, options);
        } else {
          eqSet.add(c.semver);
        }
      }
      if (eqSet.size > 1) {
        return null;
      }
      let gtltComp;
      if (gt && lt) {
        gtltComp = compare(gt.semver, lt.semver, options);
        if (gtltComp > 0) {
          return null;
        } else if (gtltComp === 0 && (gt.operator !== ">=" || lt.operator !== "<=")) {
          return null;
        }
      }
      for (const eq of eqSet) {
        if (gt && !satisfies3(eq, String(gt), options)) {
          return null;
        }
        if (lt && !satisfies3(eq, String(lt), options)) {
          return null;
        }
        for (const c of dom) {
          if (!satisfies3(eq, String(c), options)) {
            return false;
          }
        }
        return true;
      }
      let higher, lower;
      let hasDomLT, hasDomGT;
      let needDomLTPre = lt && !options.includePrerelease && lt.semver.prerelease.length ? lt.semver : false;
      let needDomGTPre = gt && !options.includePrerelease && gt.semver.prerelease.length ? gt.semver : false;
      if (needDomLTPre && needDomLTPre.prerelease.length === 1 && lt.operator === "<" && needDomLTPre.prerelease[0] === 0) {
        needDomLTPre = false;
      }
      for (const c of dom) {
        hasDomGT = hasDomGT || c.operator === ">" || c.operator === ">=";
        hasDomLT = hasDomLT || c.operator === "<" || c.operator === "<=";
        if (gt) {
          if (needDomGTPre) {
            if (c.semver.prerelease && c.semver.prerelease.length && c.semver.major === needDomGTPre.major && c.semver.minor === needDomGTPre.minor && c.semver.patch === needDomGTPre.patch) {
              needDomGTPre = false;
            }
          }
          if (c.operator === ">" || c.operator === ">=") {
            higher = higherGT(gt, c, options);
            if (higher === c && higher !== gt) {
              return false;
            }
          } else if (gt.operator === ">=" && !satisfies3(gt.semver, String(c), options)) {
            return false;
          }
        }
        if (lt) {
          if (needDomLTPre) {
            if (c.semver.prerelease && c.semver.prerelease.length && c.semver.major === needDomLTPre.major && c.semver.minor === needDomLTPre.minor && c.semver.patch === needDomLTPre.patch) {
              needDomLTPre = false;
            }
          }
          if (c.operator === "<" || c.operator === "<=") {
            lower = lowerLT(lt, c, options);
            if (lower === c && lower !== lt) {
              return false;
            }
          } else if (lt.operator === "<=" && !satisfies3(lt.semver, String(c), options)) {
            return false;
          }
        }
        if (!c.operator && (lt || gt) && gtltComp !== 0) {
          return false;
        }
      }
      if (gt && hasDomLT && !lt && gtltComp !== 0) {
        return false;
      }
      if (lt && hasDomGT && !gt && gtltComp !== 0) {
        return false;
      }
      if (needDomGTPre || needDomLTPre) {
        return false;
      }
      return true;
    };
    var higherGT = (a, b, options) => {
      if (!a) {
        return b;
      }
      const comp = compare(a.semver, b.semver, options);
      return comp > 0 ? a : comp < 0 ? b : b.operator === ">" && a.operator === ">=" ? b : a;
    };
    var lowerLT = (a, b, options) => {
      if (!a) {
        return b;
      }
      const comp = compare(a.semver, b.semver, options);
      return comp < 0 ? a : comp > 0 ? b : b.operator === "<" && a.operator === "<=" ? b : a;
    };
    module2.exports = subset;
  }
});

// node_modules/.pnpm/semver@7.6.2/node_modules/semver/index.js
var require_semver2 = __commonJS({
  "node_modules/.pnpm/semver@7.6.2/node_modules/semver/index.js"(exports2, module2) {
    var internalRe = require_re();
    var constants = require_constants();
    var SemVer = require_semver();
    var identifiers = require_identifiers();
    var parse = require_parse();
    var valid = require_valid();
    var clean = require_clean();
    var inc = require_inc();
    var diff = require_diff();
    var major = require_major();
    var minor = require_minor();
    var patch = require_patch();
    var prerelease3 = require_prerelease();
    var compare = require_compare();
    var rcompare = require_rcompare();
    var compareLoose = require_compare_loose();
    var compareBuild = require_compare_build();
    var sort = require_sort();
    var rsort = require_rsort();
    var gt = require_gt();
    var lt = require_lt();
    var eq = require_eq();
    var neq = require_neq();
    var gte = require_gte();
    var lte = require_lte();
    var cmp = require_cmp();
    var coerce = require_coerce();
    var Comparator = require_comparator();
    var Range7 = require_range();
    var satisfies3 = require_satisfies();
    var toComparators = require_to_comparators();
    var maxSatisfying = require_max_satisfying();
    var minSatisfying = require_min_satisfying();
    var minVersion = require_min_version();
    var validRange = require_valid2();
    var outside = require_outside();
    var gtr = require_gtr();
    var ltr = require_ltr();
    var intersects = require_intersects();
    var simplifyRange = require_simplify();
    var subset = require_subset();
    module2.exports = {
      parse,
      valid,
      clean,
      inc,
      diff,
      major,
      minor,
      patch,
      prerelease: prerelease3,
      compare,
      rcompare,
      compareLoose,
      compareBuild,
      sort,
      rsort,
      gt,
      lt,
      eq,
      neq,
      gte,
      lte,
      cmp,
      coerce,
      Comparator,
      Range: Range7,
      satisfies: satisfies3,
      toComparators,
      maxSatisfying,
      minSatisfying,
      minVersion,
      validRange,
      outside,
      gtr,
      ltr,
      intersects,
      simplifyRange,
      subset,
      SemVer,
      re: internalRe.re,
      src: internalRe.src,
      tokens: internalRe.t,
      SEMVER_SPEC_VERSION: constants.SEMVER_SPEC_VERSION,
      RELEASE_TYPES: constants.RELEASE_TYPES,
      compareIdentifiers: identifiers.compareIdentifiers,
      rcompareIdentifiers: identifiers.rcompareIdentifiers
    };
  }
});

// src/extension.ts
var extension_exports = {};
__export(extension_exports, {
  activate: () => activate,
  deactivate: () => deactivate
});
module.exports = __toCommonJS(extension_exports);
var import_vscode8 = require("vscode");

// src/util/addQuotes.ts
function addQuotes(str) {
  return '"' + str + '"';
}

// src/util/isEmpty.ts
function isEmpty(value) {
  if (value === void 0) {
    return true;
  } else if (typeof value === "string" || Array.isArray(value)) {
    return value.length === 0;
  } else if (typeof value === "object" && value !== null) {
    return Object.keys(value).length === 0;
  }
  return false;
}

// src/util/sortText.ts
var alphabet = "abcdefghijklmnopqrstuvwxyz";
function sortString(i) {
  if (i < 0 || !Number.isInteger(i)) {
    throw new Error("Input must be a non-negative integer.");
  }
  const columns = Math.floor(i / alphabet.length);
  const letter = alphabet[i % alphabet.length];
  return "z".repeat(columns) + letter;
}

// node_modules/.pnpm/ky@1.4.0/node_modules/ky/distribution/errors/HTTPError.js
var HTTPError = class extends Error {
  constructor(response, request, options) {
    const code = response.status || response.status === 0 ? response.status : "";
    const title = response.statusText || "";
    const status = `${code} ${title}`.trim();
    const reason = status ? `status code ${status}` : "an unknown error";
    super(`Request failed with ${reason}: ${request.method} ${request.url}`);
    Object.defineProperty(this, "response", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "request", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "options", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    this.name = "HTTPError";
    this.response = response;
    this.request = request;
    this.options = options;
  }
};

// node_modules/.pnpm/ky@1.4.0/node_modules/ky/distribution/errors/TimeoutError.js
var TimeoutError = class extends Error {
  constructor(request) {
    super(`Request timed out: ${request.method} ${request.url}`);
    Object.defineProperty(this, "request", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    this.name = "TimeoutError";
    this.request = request;
  }
};

// node_modules/.pnpm/ky@1.4.0/node_modules/ky/distribution/utils/is.js
var isObject = (value) => value !== null && typeof value === "object";

// node_modules/.pnpm/ky@1.4.0/node_modules/ky/distribution/utils/merge.js
var validateAndMerge = (...sources) => {
  for (const source of sources) {
    if ((!isObject(source) || Array.isArray(source)) && source !== void 0) {
      throw new TypeError("The `options` argument must be an object");
    }
  }
  return deepMerge({}, ...sources);
};
var mergeHeaders = (source1 = {}, source2 = {}) => {
  const result = new globalThis.Headers(source1);
  const isHeadersInstance = source2 instanceof globalThis.Headers;
  const source = new globalThis.Headers(source2);
  for (const [key, value] of source.entries()) {
    if (isHeadersInstance && value === "undefined" || value === void 0) {
      result.delete(key);
    } else {
      result.set(key, value);
    }
  }
  return result;
};
var deepMerge = (...sources) => {
  let returnValue = {};
  let headers = {};
  for (const source of sources) {
    if (Array.isArray(source)) {
      if (!Array.isArray(returnValue)) {
        returnValue = [];
      }
      returnValue = [...returnValue, ...source];
    } else if (isObject(source)) {
      for (let [key, value] of Object.entries(source)) {
        if (isObject(value) && key in returnValue) {
          value = deepMerge(returnValue[key], value);
        }
        returnValue = { ...returnValue, [key]: value };
      }
      if (isObject(source.headers)) {
        headers = mergeHeaders(headers, source.headers);
        returnValue.headers = headers;
      }
    }
  }
  return returnValue;
};

// node_modules/.pnpm/ky@1.4.0/node_modules/ky/distribution/core/constants.js
var supportsRequestStreams = (() => {
  let duplexAccessed = false;
  let hasContentType = false;
  const supportsReadableStream = typeof globalThis.ReadableStream === "function";
  const supportsRequest = typeof globalThis.Request === "function";
  if (supportsReadableStream && supportsRequest) {
    try {
      hasContentType = new globalThis.Request("https://empty.invalid", {
        body: new globalThis.ReadableStream(),
        method: "POST",
        // @ts-expect-error - Types are outdated.
        get duplex() {
          duplexAccessed = true;
          return "half";
        }
      }).headers.has("Content-Type");
    } catch (error) {
      if (error instanceof Error && error.message === "unsupported BodyInit type") {
        return false;
      }
      throw error;
    }
  }
  return duplexAccessed && !hasContentType;
})();
var supportsAbortController = typeof globalThis.AbortController === "function";
var supportsResponseStreams = typeof globalThis.ReadableStream === "function";
var supportsFormData = typeof globalThis.FormData === "function";
var requestMethods = ["get", "post", "put", "patch", "head", "delete"];
var validate = () => void 0;
validate();
var responseTypes = {
  json: "application/json",
  text: "text/*",
  formData: "multipart/form-data",
  arrayBuffer: "*/*",
  blob: "*/*"
};
var maxSafeTimeout = 2147483647;
var stop = Symbol("stop");
var kyOptionKeys = {
  json: true,
  parseJson: true,
  stringifyJson: true,
  searchParams: true,
  prefixUrl: true,
  retry: true,
  timeout: true,
  hooks: true,
  throwHttpErrors: true,
  onDownloadProgress: true,
  fetch: true
};
var requestOptionsRegistry = {
  method: true,
  headers: true,
  body: true,
  mode: true,
  credentials: true,
  cache: true,
  redirect: true,
  referrer: true,
  referrerPolicy: true,
  integrity: true,
  keepalive: true,
  signal: true,
  window: true,
  dispatcher: true,
  duplex: true,
  priority: true
};

// node_modules/.pnpm/ky@1.4.0/node_modules/ky/distribution/utils/normalize.js
var normalizeRequestMethod = (input) => requestMethods.includes(input) ? input.toUpperCase() : input;
var retryMethods = ["get", "put", "head", "delete", "options", "trace"];
var retryStatusCodes = [408, 413, 429, 500, 502, 503, 504];
var retryAfterStatusCodes = [413, 429, 503];
var defaultRetryOptions = {
  limit: 2,
  methods: retryMethods,
  statusCodes: retryStatusCodes,
  afterStatusCodes: retryAfterStatusCodes,
  maxRetryAfter: Number.POSITIVE_INFINITY,
  backoffLimit: Number.POSITIVE_INFINITY,
  delay: (attemptCount) => 0.3 * 2 ** (attemptCount - 1) * 1e3
};
var normalizeRetryOptions = (retry = {}) => {
  if (typeof retry === "number") {
    return {
      ...defaultRetryOptions,
      limit: retry
    };
  }
  if (retry.methods && !Array.isArray(retry.methods)) {
    throw new Error("retry.methods must be an array");
  }
  if (retry.statusCodes && !Array.isArray(retry.statusCodes)) {
    throw new Error("retry.statusCodes must be an array");
  }
  return {
    ...defaultRetryOptions,
    ...retry,
    afterStatusCodes: retryAfterStatusCodes
  };
};

// node_modules/.pnpm/ky@1.4.0/node_modules/ky/distribution/utils/timeout.js
async function timeout(request, init, abortController, options) {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      if (abortController) {
        abortController.abort();
      }
      reject(new TimeoutError(request));
    }, options.timeout);
    void options.fetch(request, init).then(resolve).catch(reject).then(() => {
      clearTimeout(timeoutId);
    });
  });
}

// node_modules/.pnpm/ky@1.4.0/node_modules/ky/distribution/utils/delay.js
async function delay(ms, { signal }) {
  return new Promise((resolve, reject) => {
    if (signal) {
      signal.throwIfAborted();
      signal.addEventListener("abort", abortHandler, { once: true });
    }
    function abortHandler() {
      clearTimeout(timeoutId);
      reject(signal.reason);
    }
    const timeoutId = setTimeout(() => {
      signal?.removeEventListener("abort", abortHandler);
      resolve();
    }, ms);
  });
}

// node_modules/.pnpm/ky@1.4.0/node_modules/ky/distribution/utils/options.js
var findUnknownOptions = (request, options) => {
  const unknownOptions = {};
  for (const key in options) {
    if (!(key in requestOptionsRegistry) && !(key in kyOptionKeys) && !(key in request)) {
      unknownOptions[key] = options[key];
    }
  }
  return unknownOptions;
};

// node_modules/.pnpm/ky@1.4.0/node_modules/ky/distribution/core/Ky.js
var Ky = class _Ky {
  static create(input, options) {
    const ky2 = new _Ky(input, options);
    const function_ = async () => {
      if (typeof ky2._options.timeout === "number" && ky2._options.timeout > maxSafeTimeout) {
        throw new RangeError(`The \`timeout\` option cannot be greater than ${maxSafeTimeout}`);
      }
      await Promise.resolve();
      let response = await ky2._fetch();
      for (const hook of ky2._options.hooks.afterResponse) {
        const modifiedResponse = await hook(ky2.request, ky2._options, ky2._decorateResponse(response.clone()));
        if (modifiedResponse instanceof globalThis.Response) {
          response = modifiedResponse;
        }
      }
      ky2._decorateResponse(response);
      if (!response.ok && ky2._options.throwHttpErrors) {
        let error = new HTTPError(response, ky2.request, ky2._options);
        for (const hook of ky2._options.hooks.beforeError) {
          error = await hook(error);
        }
        throw error;
      }
      if (ky2._options.onDownloadProgress) {
        if (typeof ky2._options.onDownloadProgress !== "function") {
          throw new TypeError("The `onDownloadProgress` option must be a function");
        }
        if (!supportsResponseStreams) {
          throw new Error("Streams are not supported in your environment. `ReadableStream` is missing.");
        }
        return ky2._stream(response.clone(), ky2._options.onDownloadProgress);
      }
      return response;
    };
    const isRetriableMethod = ky2._options.retry.methods.includes(ky2.request.method.toLowerCase());
    const result = isRetriableMethod ? ky2._retry(function_) : function_();
    for (const [type, mimeType] of Object.entries(responseTypes)) {
      result[type] = async () => {
        ky2.request.headers.set("accept", ky2.request.headers.get("accept") || mimeType);
        const awaitedResult = await result;
        const response = awaitedResult.clone();
        if (type === "json") {
          if (response.status === 204) {
            return "";
          }
          const arrayBuffer = await response.clone().arrayBuffer();
          const responseSize = arrayBuffer.byteLength;
          if (responseSize === 0) {
            return "";
          }
          if (options.parseJson) {
            return options.parseJson(await response.text());
          }
        }
        return response[type]();
      };
    }
    return result;
  }
  // eslint-disable-next-line complexity
  constructor(input, options = {}) {
    Object.defineProperty(this, "request", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "abortController", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "_retryCount", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 0
    });
    Object.defineProperty(this, "_input", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "_options", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    this._input = input;
    const credentials = this._input instanceof Request && "credentials" in Request.prototype ? this._input.credentials : void 0;
    this._options = {
      ...credentials && { credentials },
      // For exactOptionalPropertyTypes
      ...options,
      headers: mergeHeaders(this._input.headers, options.headers),
      hooks: deepMerge({
        beforeRequest: [],
        beforeRetry: [],
        beforeError: [],
        afterResponse: []
      }, options.hooks),
      method: normalizeRequestMethod(options.method ?? this._input.method),
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      prefixUrl: String(options.prefixUrl || ""),
      retry: normalizeRetryOptions(options.retry),
      throwHttpErrors: options.throwHttpErrors !== false,
      timeout: options.timeout ?? 1e4,
      fetch: options.fetch ?? globalThis.fetch.bind(globalThis)
    };
    if (typeof this._input !== "string" && !(this._input instanceof URL || this._input instanceof globalThis.Request)) {
      throw new TypeError("`input` must be a string, URL, or Request");
    }
    if (this._options.prefixUrl && typeof this._input === "string") {
      if (this._input.startsWith("/")) {
        throw new Error("`input` must not begin with a slash when using `prefixUrl`");
      }
      if (!this._options.prefixUrl.endsWith("/")) {
        this._options.prefixUrl += "/";
      }
      this._input = this._options.prefixUrl + this._input;
    }
    if (supportsAbortController) {
      this.abortController = new globalThis.AbortController();
      if (this._options.signal) {
        const originalSignal = this._options.signal;
        this._options.signal.addEventListener("abort", () => {
          this.abortController.abort(originalSignal.reason);
        });
      }
      this._options.signal = this.abortController.signal;
    }
    if (supportsRequestStreams) {
      this._options.duplex = "half";
    }
    if (this._options.json !== void 0) {
      this._options.body = this._options.stringifyJson?.(this._options.json) ?? JSON.stringify(this._options.json);
      this._options.headers.set("content-type", this._options.headers.get("content-type") ?? "application/json");
    }
    this.request = new globalThis.Request(this._input, this._options);
    if (this._options.searchParams) {
      const textSearchParams = typeof this._options.searchParams === "string" ? this._options.searchParams.replace(/^\?/, "") : new URLSearchParams(this._options.searchParams).toString();
      const searchParams = "?" + textSearchParams;
      const url = this.request.url.replace(/(?:\?.*?)?(?=#|$)/, searchParams);
      if ((supportsFormData && this._options.body instanceof globalThis.FormData || this._options.body instanceof URLSearchParams) && !(this._options.headers && this._options.headers["content-type"])) {
        this.request.headers.delete("content-type");
      }
      this.request = new globalThis.Request(new globalThis.Request(url, { ...this.request }), this._options);
    }
  }
  _calculateRetryDelay(error) {
    this._retryCount++;
    if (this._retryCount <= this._options.retry.limit && !(error instanceof TimeoutError)) {
      if (error instanceof HTTPError) {
        if (!this._options.retry.statusCodes.includes(error.response.status)) {
          return 0;
        }
        const retryAfter = error.response.headers.get("Retry-After");
        if (retryAfter && this._options.retry.afterStatusCodes.includes(error.response.status)) {
          let after = Number(retryAfter) * 1e3;
          if (Number.isNaN(after)) {
            after = Date.parse(retryAfter) - Date.now();
          }
          const max = this._options.retry.maxRetryAfter ?? after;
          return after < max ? after : max;
        }
        if (error.response.status === 413) {
          return 0;
        }
      }
      const retryDelay = this._options.retry.delay(this._retryCount);
      return Math.min(this._options.retry.backoffLimit, retryDelay);
    }
    return 0;
  }
  _decorateResponse(response) {
    if (this._options.parseJson) {
      response.json = async () => this._options.parseJson(await response.text());
    }
    return response;
  }
  async _retry(function_) {
    try {
      return await function_();
    } catch (error) {
      const ms = Math.min(this._calculateRetryDelay(error), maxSafeTimeout);
      if (ms !== 0 && this._retryCount > 0) {
        await delay(ms, { signal: this._options.signal });
        for (const hook of this._options.hooks.beforeRetry) {
          const hookResult = await hook({
            request: this.request,
            options: this._options,
            error,
            retryCount: this._retryCount
          });
          if (hookResult === stop) {
            return;
          }
        }
        return this._retry(function_);
      }
      throw error;
    }
  }
  async _fetch() {
    for (const hook of this._options.hooks.beforeRequest) {
      const result = await hook(this.request, this._options);
      if (result instanceof Request) {
        this.request = result;
        break;
      }
      if (result instanceof Response) {
        return result;
      }
    }
    const nonRequestOptions = findUnknownOptions(this.request, this._options);
    const mainRequest = this.request;
    this.request = mainRequest.clone();
    if (this._options.timeout === false) {
      return this._options.fetch(mainRequest, nonRequestOptions);
    }
    return timeout(mainRequest, nonRequestOptions, this.abortController, this._options);
  }
  /* istanbul ignore next */
  _stream(response, onDownloadProgress) {
    const totalBytes = Number(response.headers.get("content-length")) || 0;
    let transferredBytes = 0;
    if (response.status === 204) {
      if (onDownloadProgress) {
        onDownloadProgress({ percent: 1, totalBytes, transferredBytes }, new Uint8Array());
      }
      return new globalThis.Response(null, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers
      });
    }
    return new globalThis.Response(new globalThis.ReadableStream({
      async start(controller) {
        const reader = response.body.getReader();
        if (onDownloadProgress) {
          onDownloadProgress({ percent: 0, transferredBytes: 0, totalBytes }, new Uint8Array());
        }
        async function read() {
          const { done, value } = await reader.read();
          if (done) {
            controller.close();
            return;
          }
          if (onDownloadProgress) {
            transferredBytes += value.byteLength;
            const percent = totalBytes === 0 ? 0 : transferredBytes / totalBytes;
            onDownloadProgress({ percent, transferredBytes, totalBytes }, value);
          }
          controller.enqueue(value);
          await read();
        }
        await read();
      }
    }), {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    });
  }
};

// node_modules/.pnpm/ky@1.4.0/node_modules/ky/distribution/index.js
var createInstance = (defaults) => {
  const ky2 = (input, options) => Ky.create(input, validateAndMerge(defaults, options));
  for (const method of requestMethods) {
    ky2[method] = (input, options) => Ky.create(input, validateAndMerge(defaults, options, { method }));
  }
  ky2.create = (newDefaults) => createInstance(validateAndMerge(newDefaults));
  ky2.extend = (newDefaults) => createInstance(validateAndMerge(defaults, newDefaults));
  ky2.stop = stop;
  return ky2;
};
var ky = createInstance();
var distribution_default = ky;

// src/repository/crates.ts
var import_semver = __toESM(require_semver2());
var DEFAULT_SPARSE_INDEX_SERVER_URL = "https://index.crates.io";
async function sparseIndexMetadata(name, url = DEFAULT_SPARSE_INDEX_SERVER_URL) {
  let lowerName = name.replace(/"/g, "").toLocaleLowerCase();
  let prefix = "";
  if (lowerName.length <= 2) {
    prefix = lowerName.length.toString();
  } else if (lowerName.length === 3) {
    prefix = "3/" + lowerName.substring(0, 1);
  } else {
    prefix = lowerName.substring(0, 2) + "/" + lowerName.substring(2, 4);
  }
  const response = await distribution_default.get(`${url}/${prefix}/${lowerName}`);
  if (response.status !== 200) {
    throw new Error(`get crates metadata error: statusCode=${response.status} ${await response.text()}`);
  }
  const jsonLinesArr = (await response.text()).split("\n").filter((n) => n);
  let versions = [];
  let features = {};
  let rustVersion = {};
  let defaultFeatures = [];
  let stable = null;
  let pre = null;
  for (let i = jsonLinesArr.length - 1; i >= 0; i--) {
    let j = JSON.parse(jsonLinesArr[i]);
    if (j.yanked === false) {
      versions.push(j.vers);
      if (stable === null && (0, import_semver.prerelease)(j.vers) === null) {
        stable = j.vers;
      } else if (pre === null) {
        pre = j.vers;
      }
      if (j.rust_version) {
        rustVersion[j.vers] = j.rust_version;
      }
      features[j.vers] = Object.keys(j.features).filter((f) => {
        if (f === "default") {
          defaultFeatures = j.features["default"];
          return false;
        }
        return true;
      });
    }
  }
  return {
    name,
    versions,
    features,
    defaultFeatures,
    rustVersion,
    createdAt: (/* @__PURE__ */ new Date()).getUTCMilliseconds(),
    latestStable: stable,
    latestPrerelease: pre
  };
}
async function crates(query) {
  if (query === "") {
    return [];
  }
  const res = await distribution_default.get(
    "https://crates.io/api/v1/crates?page=1&per_page=30&q=" + query,
    {
      headers: { "User-Agent": "VSCodeExtension/crates-cmp" }
    }
  );
  if (res.status !== 200) {
    throw new Error(`search crate error: statusCode=${res.status} ${await res.text()}`);
  }
  const j = await res.json();
  return j.crates;
}

// src/repository/store.ts
async function metadata(ctx, crate) {
  const key = getKey(crate);
  const m = ctx.globalState.get(key);
  if (!m || m.createdAt > (/* @__PURE__ */ new Date()).getUTCMilliseconds() - 1e3 * 60 * 10) {
    const m2 = await sparseIndexMetadata(crate);
    ctx.globalState.update(key, m2);
    return m2;
  }
  return m;
}
function getKey(crate) {
  return `crates-cmp:metadata:${crate}`;
}

// src/usecase/versionCmp.ts
async function versionCmp(ctx, crateName) {
  const res = await metadata(ctx, crateName);
  return res.versions;
}

// node_modules/.pnpm/@washanhanzi+result-enum@2.0.3/node_modules/@washanhanzi/result-enum/dist/option.js
var none = Symbol("None");
var Option = class _Option {
  val;
  /**
   * A constructor for an Option.
   *
   * _Note: Please use either `Some` or `None` to construct Options._
   *
   * @param {T | typeof none} input The value to wrap in an Option.
   */
  constructor(input) {
    this.val = input;
  }
  /**
   * Converts Option into a String for display purposes.
   */
  get [Symbol.toStringTag]() {
    return `Option`;
  }
  /**
   * Iterator support for Option.
   *
   * _Note: This method will only yeild if the Option is Some._
   * @returns {IterableIterator<T>}
   */
  *[Symbol.iterator]() {
    if (this.isSome())
      yield this.val;
  }
  /**
   * Returns true if contained value isnt None.
   * @returns {boolean}
   */
  isSome() {
    return this.val !== none;
  }
  /**
   * Returns true if contained value is None.
   *
   * @returns {boolean}
   */
  isNone() {
    return this.val === none;
  }
  /**
   * Returns the contained Some value, consuming the Option.
   * Throws an Error with a given message if the contained value is None.
   *
   * @param {string} msg An error message to throw if contained value is None.
   * @returns {T}
   */
  expect(msg) {
    if (this.isNone()) {
      throw new Error(msg);
    }
    return this.val;
  }
  /**
   * Returns the contained Some value, consuming the Option.
   * Throws an Error if contained value is None.
   *
   * @returns {T}
   */
  unwrap() {
    if (this.isNone()) {
      throw new Error(`Unwrap called on None`);
    }
    return this.val;
  }
  /**
   * Returns the contained Some value or a provided default.
   *
   * @param {T} fallback A default value to return if contained value is an Option.
   * @returns {T}
   */
  unwrapOr(fallback) {
    if (this.isNone()) {
      return fallback;
    }
    return this.val;
  }
  /**
   * Returns the contained Some value or computes it from a closure.
   *
   * @param {Function} fn A function that computes a new value.
   * @returns {T}
   */
  unwrapOrElse(fn) {
    if (this.isNone()) {
      return fn();
    }
    return this.val;
  }
  /**
   * Maps an Option<T> to Option<U> by applying a function to a contained Some value, leaving None values untouched.
   *
   * @param {Function} fn A mapping function.
   * @returns {Option<U>}
   */
  map(fn) {
    if (this.isSome()) {
      return new _Option(fn(this.val));
    }
    return this;
  }
  /**
   * Returns the provided fallback (if None), or applies a function to the contained value.
   *
   * @param {U} fallback A defualt value
   * @param {Function} fn A mapping function.
   * @returns {U}
   */
  mapOr(fallback, fn) {
    if (this.isSome()) {
      return fn(this.val);
    }
    return fallback;
  }
  /**
   * Returns `or` if the Option is None, otherwise returns self.
   *
   * @param {Option<T>} or An alternative Option value
   * @returns {Option<T>}
   */
  or(or) {
    if (this.isSome()) {
      return this;
    }
    return or;
  }
  /**
   * Transforms the `Option<T>` into a `Result<T, E>`, mapping Some to Ok and None to Err.
   *
   * @param {E} err An error to return if the Option is None.
   * @returns {Result<T, E>}
   *
   * @example
   * ```
   * const result = Some(2).okOr("Error"); // => Ok(2)
   * ```
   */
  okOr(err) {
    if (this.isSome()) {
      return Ok(this.val);
    } else {
      return Err(err);
    }
  }
  /**
   * Returns contained value for use in matching.
   *
   * _Note: Please only use this to match against in `if` or `swtich` statments._
   *
   * @returns {T | typeof none}
   * @example
   * ```ts
   * function coolOrNice(input: Option<string>): Option<void> {
   *   switch (input.peek()) {
   *     case "cool":
   *       console.log("Input was the coolest!");
   *       break;
   *     case "nice":
   *       console.log("Input was was the nicest!");
   *       break
   *     default:
   *       return None();
   *   }
   *   return Some()
   * }
   * ```
   */
  peek() {
    return this.val;
  }
  /**
   * Converts from Option<Option<T> to Option<T>
   * @returns Option<T>
   */
  flatten() {
    if (this.val instanceof _Option) {
      return this.val;
    }
    return this;
  }
  /**
   * Run a closure and convert it into an Option.
   * If the function returns `null` or `undefined`, an Option containing None will be reutrned.
   *
   * _Note: Please use `fromAsync` to capture the result of asynchronous closures._
   * @param {Function} fn The closure to run.
   * @returns {Option<T>} The result of the closure.
   */
  static from(fn) {
    const result = fn();
    if (result === null || result === void 0) {
      return new _Option(none);
    } else {
      return new _Option(result);
    }
  }
  /**
   * Run an asynchronous closure and convert it into an Option.
   * If the function returns `null` or `undefined`, an Option containing None will be reutrned.
   *
   * _Note: Please use `from` to capture the result of synchronous closures._
   * @param {Function} fn The closure to run.
   * @returns {Promise<Option<T>>} The result of the closure.
   */
  static async fromAsync(fn) {
    const result = await fn();
    if (result === null || result === void 0) {
      return new _Option(none);
    } else {
      return new _Option(result);
    }
  }
};
function Some(input) {
  return new Option(input);
}
Object.defineProperty(Some, Symbol.hasInstance, {
  value: (instance) => {
    if (typeof instance !== "object")
      return false;
    return instance?.isSome() || false;
  }
});
function None() {
  return new Option(none);
}
Object.defineProperty(None, Symbol.hasInstance, {
  value: (instance) => {
    if (typeof instance !== "object")
      return false;
    return instance?.isNone() || false;
  }
});

// node_modules/.pnpm/@washanhanzi+result-enum@2.0.3/node_modules/@washanhanzi/result-enum/dist/result.js
var Result = class _Result {
  val;
  /**
   * A constructor for a Result.
   *
   * @param {T | E} input The Result value.
   *
   * _Note: Please use either `Ok` or `Err` to construct Results._
   */
  constructor(input) {
    this.val = input;
  }
  /**
   * Converts Result into a String for display purposes.
   */
  get [Symbol.toStringTag]() {
    return `Result`;
  }
  /**
   * Iterator support for Result.
   *
   * _Note: This method will only yeild if the Result is Ok._
   * @returns {IterableIterator<T>}
   */
  *[Symbol.iterator]() {
    if (this.isOk())
      yield this.val;
  }
  /**
   * Returns true if contained value isnt an error.
   *
   * @returns {boolean}
   */
  isOk() {
    return !(this.val instanceof Error || this.val && typeof this.val === "object" && Error.isPrototypeOf(this.val));
  }
  /**
   * Returns true if contained value is an error.
   *
   * @returns {boolean}
   */
  isErr() {
    return this.val instanceof Error || this.val && typeof this.val === "object" && Error.isPrototypeOf(this.val);
  }
  formatError(err) {
    err.stack = `${err.message}: ${this.val.stack ? "\n	" + this.val.stack.split("\n").join("\n	") : this.val.message}`;
    throw err;
  }
  /**
   * Returns the contained Ok value, consuming the Result.
   * Throws an Error with a given message if contained value is not Ok.
   *
   * @param {string} msg An error message to throw if contained value is an Error.
   * @returns {T}
   */
  expect(msg) {
    if (this.isErr()) {
      this.formatError(new Error(msg));
    }
    return this.val;
  }
  /**
   * Returns the contained Err value, consuming the Result.
   * Throws an Error with a given message if contained value is not an Err.
   *
   * @param {string} msg An error message to throw if contained value is Ok.
   * @returns {T}
   */
  expectErr(msg) {
    if (this.isOk()) {
      this.formatError(new Error(msg));
    }
    return this.val;
  }
  /**
   * Returns the contained Ok value, consuming the Result.
   * Throws an Error if contained value is not Ok.
   *
   * @returns {T}
   */
  unwrap() {
    if (this.isErr()) {
      this.formatError(new Error(`Unwrap called on ${this.val.name}`));
    }
    return this.val;
  }
  /**
   * Returns the contained Error value, consuming the Result.
   * Throws an Error if contained value is not an Error.
   *
   * @returns {E}
   */
  unwrapErr() {
    if (this.isOk()) {
      throw new Error(`UnwrapError called on value - ${this.val}`);
    }
    return this.val;
  }
  /**
   * Returns the contained Ok value or a provided default.
   *
   * @param {T} fallback A default value to return if contained value is an Error.
   * @returns {T}
   */
  unwrapOr(fallback) {
    if (this.isErr()) {
      return fallback;
    }
    return this.val;
  }
  /**
   * Returns the contained Ok value or computes it from a closure.
   *
   * @param {Function} fn A function that computes a new value.
   * @returns {T}
   */
  unwrapOrElse(fn) {
    if (this.isErr()) {
      return fn(this.val);
    }
    return this.val;
  }
  /**
   * Maps a Result<T, E> to Result<U, E> by applying a function to a contained Ok value, leaving an Error value untouched.
   *
   * @param {Function} fn A mapping function.
   * @returns {Result<U, E>}
   */
  map(fn) {
    if (this.isOk()) {
      return new _Result(fn(this.val));
    }
    return this;
  }
  /**
   * Maps a Result<T, E> to Result<T, U> by applying a function to a contained Error value, leaving an Ok value untouched.
   *
   * @param {Function} fn A mapping function.
   * @returns {Result<T, U>}
   */
  mapErr(fn) {
    if (this.isOk()) {
      return this;
    }
    return new _Result(fn(this.val));
  }
  /**
   * Returns the provided fallback (if Error), or applies a function to the contained value.
   *
   * @param {U} fallback A defualt value
   * @param {Function} fn A mapping function.
   * @returns {U}
   */
  mapOr(fallback, fn) {
    if (this.isOk()) {
      return fn(this.val);
    }
    return fallback;
  }
  /**
   * Returns `or` if the result is Error, otherwise returns self.
   *
   * @param {Result<T, E>} or An alternative Result value
   * @returns {Result<T, E>}
   */
  or(or) {
    if (this.isOk()) {
      return this;
    }
    return or;
  }
  /**
   * Converts from `Result<T, E>` to `Option<T>`.
   *
   * @returns {Option<T>}
   *
   * @example
   * ```ts
   * const option = Err("Some Error").ok(); // => None()
   * ```
   */
  ok() {
    if (this.isOk()) {
      return Some(this.val);
    }
    return None();
  }
  /**
   * Returns contained value for use in matching.
   *
   * _Note: Please only use this to match against in `if` or `swtich` statments._
   *
   * @returns {T | E}
   * @example
   * ```ts
   * function coolOrNice(input: Result<string, Error>): Result<void, Error> {
   *   switch (input.peek()) {
   *     case "cool":
   *       console.log("Input was the coolest!");
   *       break;
   *     case "nice":
   *       console.log("Input was was the nicest!");
   *       break
   *     default:
   *       return Err("Input neither cool nor nice.");
   *   }
   *   return Ok()
   * }
   * ```
   */
  peek() {
    return this.val;
  }
  /**
   * Throws contained Errors, consuming the Result.
   */
  throw() {
    if (this.isErr()) {
      throw this.val;
    }
  }
  /**
   * Converts from Result<Result<T, E>, E> to Result<T, E>
   * @returns Option<T>
   */
  flatten() {
    if (this.val instanceof _Result) {
      return this.val;
    }
    return this;
  }
  /**
   * Run a closure in a `try`/`catch` and convert it into a Result.
   *
   * _Note: Please use `fromAsync` to capture the Result of asynchronous closures._
   * @param {Function} fn The closure to run
   * @returns {Result<T, Error>} The Result of the closure
   */
  static from(fn) {
    try {
      return new _Result(fn());
    } catch (e) {
      return new _Result(e);
    }
  }
  /**
   * Run an asynchronous closure in a `try`/`catch` and convert it into a Result.
   *
   * _Note: Please use `from` to capture the Result of synchronous closures._
   * @param {Function} fn The synchronous closure to run
   * @returns {Promise<Result<T, Error>>} The Result of the closure
   */
  static async fromAsync(fn) {
    try {
      return new _Result(await fn());
    } catch (e) {
      return new _Result(e);
    }
  }
  /**
   * Partition an array of Results into Ok values and Errors
   *
   * @param {Array<Result<T, E>>} input An array of Results
   * @returns {{ok: Array<T>, err: Array<E>}}
   *
   * @example
   * ```ts
   * const results = [Ok(2), Ok(16), Err("Something went wrong!")]
   *
   * Result.partition(results) // { ok:[2, 16], err:[Error("Something went wrong!")]}
   *
   * ```
   */
  static partition(input) {
    return input.reduce((acc, e) => {
      if (e.isOk())
        acc.ok.push(e.unwrap());
      else
        acc.err.push(e.unwrapErr());
      return acc;
    }, {
      ok: [],
      err: []
    });
  }
};
function Ok(input) {
  return new Result(input);
}
Object.defineProperty(Ok, Symbol.hasInstance, {
  value: (instance) => {
    if (typeof instance !== "object")
      return false;
    return instance?.isOk() || false;
  }
});
function Err(input) {
  if (typeof input === "string") {
    return new Result(new Error(input));
  }
  return new Result(input);
}
Object.defineProperty(Err, Symbol.hasInstance, {
  value: (instance) => {
    if (typeof instance !== "object")
      return false;
    return instance?.isErr() || false;
  }
});

// node_modules/.pnpm/@washanhanzi+result-enum@2.0.3/node_modules/@washanhanzi/result-enum/dist/async.js
async function async(fn) {
  try {
    const data = await fn;
    return Ok(data);
  } catch (error) {
    return Err(error);
  }
}

// src/usecase/featuresCmp.ts
var import_semver2 = __toESM(require_semver2());
async function featuresCmp(ctx, crateName, version, existedFeatures) {
  if (crateName === "") {
    return [];
  }
  const resResult = await async(metadata(ctx, crateName));
  if (resResult.isErr()) {
    throw resResult.unwrapErr();
  }
  const res = resResult.unwrap();
  if (version === "") {
    return res.features[res.latestStable] ?? [];
  }
  const features = matchingFeatures(res, version);
  if (features.length === 0) {
    return [];
  }
  if (existedFeatures && existedFeatures.length !== 0) {
    const m = {};
    for (let f of existedFeatures) {
      m[f] = true;
    }
    return features.filter((f) => !m[f]);
  }
  return features;
}
function matchingFeatures(m, version) {
  let features = m.features[version] ?? [];
  if (features.length === 0) {
    for (let v of m.versions) {
      if ((0, import_semver2.satisfies)(v, version)) {
        features = m.features[v] ?? [];
        break;
      }
    }
  }
  return features;
}

// src/usecase/parseDependencies.ts
var import_semver3 = __toESM(require_semver2());
function parseDependencies(ctx, input) {
  if (input.length === 0) {
    return [];
  }
  let res = [];
  for (let d of input) {
    if (d.version === "") {
      continue;
    }
    res.push(parseDependency(ctx, d));
  }
  return res;
}
async function parseDependency(ctx, input) {
  const m = await metadata(ctx, input.name);
  const versionCheck = checkVersion(input, m);
  return {
    id: input.id,
    name: input.name,
    decoration: versionCheck.decoration,
    diagnostics: versionCheck.diagnostics
  };
}
function checkVersion(input, m) {
  const res = { id: input.id, name: input.name };
  let exist = false;
  for (let v of m.versions) {
    if ((0, import_semver3.satisfies)(v, input.version)) {
      exist = true;
      break;
    }
  }
  if (!exist) {
    res.decoration = newErrorDecoration(input.id, "version not found");
    return res;
  }
  if ((0, import_semver3.prerelease)(input.version) === null) {
    if (!(0, import_semver3.satisfies)(m.latestStable, input.version)) {
      res.decoration = newOutdatedDecoration(input.id, m.latestStable);
      return res;
    }
    res.decoration = newLatestDecoration(input.id, m.latestStable);
  } else {
    if (m.latestPrerelease === null) {
      res.decoration = newErrorDecoration(input.id, "pre-release not found");
      return res;
    } else {
      if (!(0, import_semver3.satisfies)(m.latestPrerelease, input.version)) {
        res.decoration = newOutdatedDecoration(input.id, m.latestPrerelease);
        return res;
      }
    }
    res.decoration = newLatestDecoration(input.id, m.latestPrerelease);
  }
  return res;
}
function newLatestDecoration(id, latest) {
  return {
    id,
    status: "Latest" /* LATEST */,
    latest
  };
}
function newOutdatedDecoration(id, latest) {
  return {
    id,
    status: "Outdated" /* OUTDATED */,
    latest
  };
}
function newErrorDecoration(id, latest) {
  return {
    id,
    status: "Error" /* ERROR */,
    latest
  };
}

// src/controller/versionsCompletionList.ts
var import_vscode = require("vscode");
async function versionsCompletionList(ctx, crateName, range) {
  const versionsResult = await async(versionCmp(ctx, crateName));
  if (versionsResult.isErr()) {
    import_vscode.window.showErrorMessage(versionsResult.unwrapErr().message);
    return [];
  }
  const items = versionsResult.unwrap().map((version, i) => {
    const item = new import_vscode.CompletionItem(addQuotes(version), import_vscode.CompletionItemKind.Constant);
    item.insertText = addQuotes(version);
    item.sortText = sortString(i++);
    item.preselect = i === 0;
    item.range = range;
    return item;
  });
  return new import_vscode.CompletionList(items);
}

// src/controller/featuresCompletionList.ts
var import_vscode2 = require("vscode");
async function featuresCompletionList(ctx, crateName, version, existedFeatures, range) {
  const featuresResult = await async(featuresCmp(ctx, crateName, version, existedFeatures));
  if (featuresResult.isErr()) {
    import_vscode2.window.showErrorMessage(featuresResult.unwrapErr().message);
    return [];
  }
  const items = featuresResult.unwrap().map((feature, i) => {
    const item = new import_vscode2.CompletionItem(addQuotes(feature), import_vscode2.CompletionItemKind.Constant);
    item.insertText = addQuotes(feature);
    item.sortText = sortString(i++);
    item.preselect = i === 0;
    item.range = range;
    return item;
  });
  return new import_vscode2.CompletionList(items);
}

// src/usecase/searchCrate.ts
async function searchCrate(query) {
  return crates(query);
}

// src/controller/crateNameCompletionList.ts
var import_vscode3 = require("vscode");
async function crateNameCompletionList(document, position) {
  const lineText = getTextBeforeCursor(document, position);
  const searchResult = await async(searchCrate(lineText));
  if (searchResult.isErr()) {
    import_vscode3.window.showErrorMessage(searchResult.unwrapErr().message);
    return [];
  }
  const [firstNonEmptyIndex, lastNonEmptyIndex] = lineReplaceRange(lineText);
  const items = searchResult.unwrap().map((crate, i) => {
    const item = new import_vscode3.CompletionItem(crate.name, import_vscode3.CompletionItemKind.Constant);
    item.insertText = crate.name;
    item.documentation = crate.description;
    item.detail = "max version: " + crate.max_version;
    item.sortText = sortString(i++);
    item.preselect = i === 0;
    item.range = new import_vscode3.Range(position.line, firstNonEmptyIndex, position.line, lastNonEmptyIndex);
    return item;
  });
  return items;
}
function getTextBeforeCursor(document, position) {
  const range = new import_vscode3.Range(position.line, 0, position.line, position.character);
  return document.getText(range);
}
function lineReplaceRange(lineText) {
  let firstNonEmptyIndex = -1;
  let lastNonEmptyIndex = -1;
  for (let i = 0; i < lineText.length; i++) {
    if (lineText[i].trim() !== "") {
      if (firstNonEmptyIndex === -1) {
        firstNonEmptyIndex = i;
      }
      lastNonEmptyIndex = i;
    }
  }
  return [firstNonEmptyIndex, lastNonEmptyIndex];
}

// src/controller/command.ts
var import_vscode4 = require("vscode");
function executeCommand(command, uri) {
  return new Promise((resolve, reject) => {
    import_vscode4.commands.executeCommand(command, uri).then(
      (res) => {
        if (isEmpty(res)) reject("symbol provider unavailable");
        resolve(res);
      },
      (err) => reject(err)
    );
  });
}

// src/controller/symbolTree.ts
var import_vscode6 = require("vscode");

// src/util/squzze.ts
var import_vscode5 = require("vscode");
function squezze(range) {
  if (!range) {
    return range;
  }
  return new import_vscode5.Range(
    range.start.translate(0, 1),
    range.end.translate(0, -1)
  );
}

// src/util/delay.ts
function delay2(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// src/controller/symbolTree.ts
var CargoTomlWalker = class {
  enterTable(node, table) {
    return true;
  }
  enterDependencies(node, table) {
    return true;
  }
  onPackage(id, node) {
  }
  onDependencies(id, node, table, platform) {
  }
  onFeatures(id, node) {
  }
  onWorkspace(id, node) {
  }
  onLib(id, node) {
  }
  onBin(id, node) {
  }
  onProfile(id, node) {
  }
  onBadges(id, node) {
  }
  onOther(id, node) {
  }
  tree;
  constructor(tree) {
    this.tree = tree;
  }
  walk() {
    for (let node of this.tree) {
      switch (node.name) {
        case "package":
          if (this.enterTable(node, "package" /* PACKAGE */)) {
            this.onPackage(node.name, node);
          }
          break;
        case "dependencies":
          if (this.enterDependencies(node, "dependencies" /* DEPENDENCIES */)) {
            this.onDependencies(node.name, node, "dependencies" /* DEPENDENCIES */);
          }
          break;
        case "dev-dependencies":
          if (this.enterDependencies(node, "dev-dependencies" /* DEV_DEPENDENCIES */)) {
            this.onDependencies(node.name, node, "dev-dependencies" /* DEV_DEPENDENCIES */);
          }
          break;
        case "build-dependencies":
          if (this.enterDependencies(node, "build-dependencies" /* BUILD_DEPENDENCIES */)) {
            this.onDependencies(node.name, node, "build-dependencies" /* BUILD_DEPENDENCIES */);
          }
          break;
        case "target":
          if (this.enterDependencies(node, "target.dependencies" /* TARGET_DEPENDENCIES */)) {
            for (let child of node.children[0].children) {
              this.onDependencies(nodeId(node.name, node.children[0].name, child.name), child, "target.dependencies" /* TARGET_DEPENDENCIES */, node.children[0].name);
            }
          }
        case "features":
          if (this.enterTable(node, "features" /* FEATURES */)) {
            this.onFeatures(node.name, node);
          }
          break;
        case "workspace":
          if (this.enterTable(node, "workspace" /* WORKSPACE */)) {
            this.onWorkspace(node.name, node);
          }
          break;
        case "lib":
          if (this.enterTable(node, "lib" /* LIB */)) {
            this.onLib(node.name, node);
          }
          break;
        case "bin":
          if (this.enterTable(node, "bin" /* BIN */)) {
            this.onBin(node.name, node);
          }
          break;
        case "profile":
          if (this.enterTable(node, "profile" /* PROFILE */)) {
            this.onProfile(node.name, node);
          }
          break;
        case "badges":
          if (this.enterTable(node, "badges" /* BADGES */)) {
            this.onBadges(node.name, node);
          }
          break;
        default:
          if (this.enterTable(node, "other" /* OTHER */)) {
            this.onOther(node.name, node);
          }
          break;
      }
    }
  }
};
var DependenciesWalker = class extends CargoTomlWalker {
  enterCrate(node) {
    return true;
  }
  onCrate(id, node, table, platform) {
  }
  onDependencies(id, node, table, platform) {
    for (let crate of node.children) {
      if (this.enterCrate(crate)) {
        this.onCrate(nodeId(id, crate.name), crate, table, platform);
      }
    }
  }
};
async function symbolTree(uri) {
  for (let counter = 0; counter < 3; counter++) {
    const tree = await async(executeCommand("vscode.executeDocumentSymbolProvider", uri));
    console.log("waiting for Even better toml");
    if (tree.isOk()) {
      return tree.unwrap();
    }
    await delay2(300);
  }
  import_vscode6.window.showErrorMessage("Require `Even Better TOML` extension");
  return [];
}
var DependenciesTraverser = class extends DependenciesWalker {
  dependencies = [];
  m = {};
  identifiers = [];
  doc;
  constructor(tree, doc) {
    super(tree);
    this.doc = doc;
  }
  //don't enter other tables
  enterTable(node, table) {
    return false;
  }
  //only enter dependencies
  enterDependencies(node, table) {
    return true;
  }
  //enter all crate
  enterCrate(node) {
    return true;
  }
  onCrate(id, node, table, platform) {
    const crateName = node.name;
    const input = {
      id: nodeId(id, node.name),
      name: crateName,
      version: "",
      features: [],
      tableName: table,
      platform
    };
    this.identifiers.push(input.id);
    this.m[input.id] = node.range;
    if (node.children.length === 0) {
      const version = this.doc.getText(squezze(node.range));
      input.version = version;
      this.dependencies.push(input);
      return;
    }
    for (let child of node.children) {
      if (child.name === "version") {
        const version = this.doc.getText(squezze(child.range));
        input.version = version;
        this.m[nodeId(input.id, child.name)] = child.range;
        continue;
      }
      if (child.name === "features") {
        if (child.children.length !== 0) {
          for (let grandChild of child.children) {
            const f = this.doc.getText(squezze(grandChild.range));
            this.m[nodeId(input.id, child.name, grandChild.name)] = grandChild.range;
            input.features.push(f);
          }
        } else {
          const f = this.doc.getText(squezze(child.range));
          this.m[nodeId(input.id, child.name)] = child.range;
          input.features.push(f);
        }
        continue;
      }
    }
    this.dependencies.push(input);
  }
};
function nodeId(...params) {
  return params.join(".");
}

// src/controller/cratesCompletionProvider.ts
var CratesCompletionProvider = class {
  context;
  constructor(context) {
    this.context = context;
  }
  provideCompletionItems(document, position, _token, context) {
    return new Promise(async (resolve) => {
      const res = await this.completionItems(document, position, _token, context);
      resolve(res);
    });
  }
  async completionItems(document, position, _token, _context) {
    const tree = await symbolTree(document.uri);
    if (tree.length === 0) {
      return [];
    }
    const walker = new CratesCompletionWalker(tree, position);
    walker.walk();
    if (!walker.crateName) {
      return await crateNameCompletionList(document, position);
    }
    if (walker.versionNode) {
      if (walker.versionNode.range.contains(position)) {
        return await versionsCompletionList(
          this.context,
          walker.crateName,
          walker.versionNode.range
        );
      }
    }
    if (walker.featuresNode && walker.featuresNode.children.length !== 0) {
      if (walker.featuresNode.range.contains(position)) {
        const version = document.getText(squezze(walker.versionNode?.range));
        let range;
        let existedFeatures = [];
        for (let f of walker.featuresNode.children) {
          if (f.range.contains(position)) {
            range = f.range;
            continue;
          }
          existedFeatures.push(document.getText(squezze(f.range)));
        }
        return await featuresCompletionList(
          this.context,
          walker.crateName,
          version,
          existedFeatures,
          range
        );
      }
      return [];
    }
    if (!walker.isComplexDependencyBlock) {
      return await versionsCompletionList(
        this.context,
        walker.crateName,
        walker.crateRange
      );
    }
    return [];
  }
};
var CratesCompletionWalker = class extends DependenciesWalker {
  isComplexDependencyBlock = false;
  crateName;
  crateRange;
  versionNode;
  featuresNode;
  position;
  constructor(tree, position) {
    super(tree);
    this.position = position;
  }
  enterTable(node, table) {
    return false;
  }
  enterDependencies(node, table) {
    if (node.range.contains(this.position)) {
      return true;
    }
    return false;
  }
  enterCrate(node) {
    if (node.range.contains(this.position)) {
      return true;
    }
    return false;
  }
  onCrate(id, node) {
    this.crateName = node.name;
    this.crateRange = node.range;
    if (node.children.length !== 0) {
      this.isComplexDependencyBlock = true;
      for (let child of node.children) {
        if (child.name === "version") {
          this.versionNode = child;
          continue;
        }
        if (child.name === "features") {
          this.featuresNode = child;
          continue;
        }
      }
    }
    this.enterCrate = (n) => false;
  }
};

// src/controller/listener.ts
var import_vscode7 = require("vscode");
var Listener = class {
  ctx;
  //track the decoration state
  decorationState;
  //track all the toml nodes in the editor
  nodes = /* @__PURE__ */ new Set();
  constructor(ctx) {
    this.ctx = ctx;
    this.decorationState = {};
  }
  async onChange(document) {
    const tree = await symbolTree(document.uri);
    if (tree.length === 0) {
      return;
    }
    console.log(tree);
    const walker = new DependenciesTraverser(tree, document);
    walker.walk();
    this.updateCrates(walker.identifiers);
    let promises = parseDependencies(this.ctx, walker.dependencies);
    while (promises.length > 0) {
      const { promise, result } = await Promise.race(promises.map(
        (p) => p.then(
          (value) => ({ promise: p, result: value }),
          (reason) => ({ promise: p, result: reason })
        )
      ));
      if (!(result instanceof Error)) {
        if (result.decoration) {
          const d = this.decoration(result.id, result.decoration);
          if (d !== null) {
            import_vscode7.window.activeTextEditor?.setDecorations(d, [walker.m[result.decoration.id]]);
          }
        }
        if (result.diagnostics) {
        }
      } else {
        console.error("Rejected reason:", result);
      }
      promises = promises.filter((p) => p !== promise);
    }
    return;
  }
  async onDidChangeTextDocument(event) {
    if (event.document.fileName.endsWith("Cargo.toml") && !event.document.isDirty) {
      await this.onChange(event.document);
    }
  }
  async onDidChangeActiveEditor(editor) {
    if (!editor) return;
    await this.onChange(editor.document);
  }
  updateCrates(newCrates) {
    const newSet = new Set(newCrates);
    const deletedItems = [...this.nodes].filter((item) => !newSet.has(item));
    deletedItems.forEach((item) => this.nodes.delete(item));
    newCrates.forEach((item) => this.nodes.add(item));
    for (let d of deletedItems) {
      this.decorationState[d].decoration.dispose();
      delete this.decorationState[d];
    }
  }
  //decoration return an old decoration or new onee
  decoration(id, deco) {
    const d = this.decorationState[id];
    if (d) {
      if (d.latest === deco.latest && d.status === deco.status) {
        return d.decoration;
      } else {
        d.decoration.dispose();
      }
    }
    switch (deco.status) {
      case "Latest" /* LATEST */:
        const newLatest = latestDecoration(deco.latest);
        this.decorationState[id] = { latest: deco.latest, status: deco.status, decoration: newLatest };
        return newLatest;
      case "Outdated" /* OUTDATED */:
        const newOutdated = outdatedDecoration(deco.latest);
        this.decorationState[id] = { latest: deco.latest, status: deco.status, decoration: newOutdated };
        return newOutdated;
      case "Error" /* ERROR */:
        const newError = errorDecoration(deco.latest);
        this.decorationState[id] = { latest: deco.latest, status: deco.status, decoration: newError };
        return newError;
    }
  }
};
function latestDecoration(latest) {
  return import_vscode7.window.createTextEditorDecorationType({
    after: {
      contentText: "\u2705 " + latest,
      color: "green",
      margin: "0 0 0 4em"
      // Add some margin to the left
    }
  });
}
function outdatedDecoration(latest) {
  return import_vscode7.window.createTextEditorDecorationType({
    after: {
      contentText: "\u{1F7E1} " + latest,
      color: "orange",
      margin: "0 0 0 4em"
      // Add some margin to the left
    }
  });
}
function errorDecoration(latest) {
  return import_vscode7.window.createTextEditorDecorationType({
    after: {
      contentText: "\u274C " + latest,
      color: "red",
      margin: "0 0 0 4em"
      // Add some margin to the left
    }
  });
}

// src/extension.ts
function activate(context) {
  const documentSelector = { language: "toml", pattern: "**/Cargo.toml" };
  const listener = new Listener(context);
  context.subscriptions.push(
    // Add active text editor listener and run once on start.
    import_vscode8.window.onDidChangeActiveTextEditor(listener.onDidChangeActiveEditor, listener),
    // When the text document is changed, fetch + check dependencies
    import_vscode8.workspace.onDidChangeTextDocument(listener.onDidChangeTextDocument, listener),
    // Register our versions completions provider
    import_vscode8.languages.registerCompletionItemProvider(
      documentSelector,
      new CratesCompletionProvider(context),
      '"',
      ".",
      "+",
      "-",
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9"
    )
    // TODO:  Register our Quick Actions provider
    // languages.registerCodeActionsProvider(
    //   documentSelector,
    //   new QuickActions(),
    //   { providedCodeActionKinds: [CodeActionKind.QuickFix] }
    // ),
  );
}
function deactivate() {
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate
});
/*! Bundled license information:

ky/distribution/index.js:
  (*! MIT License © Sindre Sorhus *)
*/
//# sourceMappingURL=extension.js.map
