"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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

// src/extension.ts
var extension_exports = {};
__export(extension_exports, {
  activate: () => activate,
  deactivate: () => deactivate
});
module.exports = __toCommonJS(extension_exports);
var vscode = __toESM(require("vscode"));
var import_vscode5 = require("vscode");

// src/controller/cratesCompletions.ts
var import_vscode4 = require("vscode");

// src/entity/sortText.ts
var alphabet = "abcdefghijklmnopqrstuvwxyz";
function sortString(i) {
  if (i < 0 || !Number.isInteger(i)) {
    throw new Error("Input must be a non-negative integer.");
  }
  const columns = Math.floor(i / alphabet.length);
  const letter = alphabet[i % alphabet.length];
  return "z".repeat(columns) + letter;
}

// src/entity/isEmpty.ts
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

// src/entity/addQuotes.ts
function addQuotes(str) {
  return '"' + str + '"';
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
  for (let d of jsonLinesArr) {
    let j = JSON.parse(d);
    if (j.yanked === false) {
      const quotedVersion = addQuotes(j.vers);
      versions.push(quotedVersion);
      if (j.rust_version) {
        rustVersion[j.vers] = j.rust_version;
      }
      features[quotedVersion] = Object.keys(j.features).filter((f) => {
        if (f === "default") {
          defaultFeatures = j.features["default"].map((f2) => addQuotes(f2));
          return false;
        }
        return true;
      }).map((f) => addQuotes(f));
    }
  }
  versions = versions.reverse();
  return {
    name,
    versions,
    features,
    defaultFeatures,
    rustVersion,
    createdAt: (/* @__PURE__ */ new Date()).getUTCMilliseconds()
  };
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
async function featuresCmp(ctx, crateName, version, existedFeatures) {
  if (crateName === "") {
    return [];
  }
  const resResult = await async(metadata(ctx, crateName));
  if (resResult.isErr()) {
    throw resResult.unwrapErr();
  }
  const res = resResult.unwrap();
  if (existedFeatures && existedFeatures.length !== 0) {
    const features = res.features[version] ?? [];
    const m = {};
    for (let f of existedFeatures) {
      m[f] = true;
    }
    return features.filter((f) => !m[f]);
  }
  if (version !== "" && res.features[version]) {
    return res.features[version];
  }
  if (res.versions.length !== 0) {
    return res.features[res.versions[res.versions.length - 1]] ?? [];
  }
  return [];
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
    const item = new import_vscode.CompletionItem(version, import_vscode.CompletionItemKind.Constant);
    item.insertText = version;
    item.sortText = sortString(i++);
    item.preselect = i === 0;
    item.range = range;
    return item;
  });
  return new import_vscode.CompletionList(items);
}

// src/controller/promisify.ts
var import_vscode2 = require("vscode");
function executeCommand(command, uri) {
  return new Promise((resolve, reject) => {
    import_vscode2.commands.executeCommand(command, uri).then(
      (res) => {
        if (isEmpty(res)) reject("symbol provider undefined");
        resolve(res);
      },
      (err) => reject(err)
    );
  });
}

// src/controller/featuresCompletionList.ts
var import_vscode3 = require("vscode");
async function featuresCompletionList(ctx, crateName, version, existedFeatures, range) {
  const featuresResult = await async(featuresCmp(ctx, crateName, version, existedFeatures));
  if (featuresResult.isErr()) {
    import_vscode3.window.showErrorMessage(featuresResult.unwrapErr().message);
    return [];
  }
  const items = featuresResult.unwrap().map((feature, i) => {
    const item = new import_vscode3.CompletionItem(feature, import_vscode3.CompletionItemKind.Constant);
    item.insertText = feature;
    item.sortText = sortString(i++);
    item.preselect = i === 0;
    item.range = range;
    return item;
  });
  return new import_vscode3.CompletionList(items);
}

// src/controller/cratesCompletions.ts
var CratesCompletions = class {
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
    const treeResult = await async(executeCommand("vscode.executeDocumentSymbolProvider", document.uri));
    if (treeResult.isErr()) {
      import_vscode4.window.showErrorMessage("Require `Even Better TOML` extension");
      return [];
    }
    const tree = treeResult.unwrap();
    let withinDependenciesBlock = false;
    let isComplexDependencyBlock = false;
    let crateName;
    let versionRange;
    let versionNode;
    let featuresNode;
    for (let node of tree) {
      if (node.name.includes("dependencies")) {
        withinDependenciesBlock = true;
        if (node.range.contains(position)) {
          if (node.children && node.children.length > 0) {
            for (let child of node.children) {
              if (child.range.contains(position)) {
                crateName = child.name;
                versionRange = child.range;
                if (child.children && child.children.length > 0) {
                  isComplexDependencyBlock = true;
                  for (let grandChild of child.children) {
                    if (grandChild.name === "version") {
                      versionNode = grandChild;
                    }
                    if (grandChild.name === "features") {
                      featuresNode = grandChild;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    if (!withinDependenciesBlock) {
      return [];
    }
    if (crateName) {
      if (versionNode) {
        if (versionNode.range.contains(position)) {
          return await versionsCompletionList(
            this.context,
            crateName,
            versionNode.range
          );
        }
      }
      if (featuresNode && featuresNode.children.length !== 0) {
        if (featuresNode.range.contains(position)) {
          const version = document.getText(versionNode?.range);
          let range;
          let existedFeatures = [];
          for (let f of featuresNode.children) {
            if (f.range.contains(position)) {
              range = f.range;
              continue;
            }
            existedFeatures.push(document.getText(f.range));
          }
          return await featuresCompletionList(
            this.context,
            crateName,
            version,
            existedFeatures,
            range
          );
        }
        return [];
      }
    }
    if (!isComplexDependencyBlock) {
      return await versionsCompletionList(
        this.context,
        crateName,
        versionRange
      );
    }
    return [];
  }
};

// src/extension.ts
function activate(context) {
  const documentSelector = { language: "toml", pattern: "**/[Cc]argo.toml" };
  console.log('Congratulations, your extension "crates-cmp" is now active!');
  context.subscriptions.push(
    // Add active text editor listener and run once on start.
    // window.onDidChangeActiveTextEditor(tomlListener),
    // When the text document is changed, fetch + check dependencies
    import_vscode5.workspace.onDidChangeTextDocument((e) => {
    }),
    // Register our versions completions provider
    import_vscode5.languages.registerCompletionItemProvider(
      documentSelector,
      new CratesCompletions(context),
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
    // TODO: Register our features auto completions provider
    // languages.registerCompletionItemProvider(
    //   documentSelector,
    //   new FeaturesCompletions(),
    //   "'", '"'
    // ),
  );
  const disposable = vscode.commands.registerCommand("crates-cmp.helloWorld", () => {
    vscode.window.showInformationMessage("Hello World from crates-cmp!");
  });
  context.subscriptions.push(disposable);
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
