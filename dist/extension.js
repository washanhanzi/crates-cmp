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
var import_vscode2 = require("vscode");

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
      versions.push(j.vers);
      if (j.rust_version) {
        rustVersion[j.vers] = j.rust_version;
      }
      features[j.vers] = Object.keys(j.features).filter((f) => {
        if (f === "default") {
          defaultFeatures = j.features[f];
          return false;
        }
        return true;
      });
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

// src/controller/cratesCompletions.ts
var import_vscode = require("vscode");
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
    const tree = await import_vscode.commands.executeCommand("vscode.executeDocumentSymbolProvider", document.uri);
    if (!tree || tree.length === 0) {
      import_vscode.window.showErrorMessage("Try install Even Better TOML extension");
      return [];
    }
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
    console.log("crateName: ", crateName);
    console.log("versionNode: ", versionNode);
    console.log("featuresNode: ", featuresNode);
    if (crateName) {
      if (versionNode) {
        if (versionNode.range.contains(position)) {
          console.log("you are typing version");
          return [];
        }
      }
      if (featuresNode) {
        if (featuresNode.range.contains(position)) {
          console.log("you are typing features");
          return [];
        }
      }
      if (!isComplexDependencyBlock) {
        const versions = await versionCmp(this.context, crateName);
        const items = versions.map((version, i) => {
          const item = new import_vscode.CompletionItem(version, import_vscode.CompletionItemKind.Constant);
          item.insertText = version;
          item.sortText = sortString(i++);
          item.preselect = i === 0;
          item.range = new import_vscode.Range(
            versionRange?.start.translate(0, 1),
            versionRange?.end.translate(0, -1)
          );
          return item;
        });
        return new import_vscode.CompletionList(items);
      }
      return [];
    }
    console.log("you are typing crate name");
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
    import_vscode2.workspace.onDidChangeTextDocument((e) => {
    }),
    // Register our versions completions provider
    import_vscode2.languages.registerCompletionItemProvider(
      documentSelector,
      new CratesCompletions(context),
      "'",
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
      "9",
      "a",
      "b",
      "c",
      "d",
      "e",
      "f",
      "g",
      "h",
      "i",
      "j",
      "k",
      "l",
      "m",
      "n",
      "o",
      "p",
      "q",
      "r",
      "s",
      "t",
      "u",
      "v",
      "w",
      "x",
      "y",
      "z"
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
