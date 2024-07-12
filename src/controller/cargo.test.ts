import { expect, test } from 'vitest'
import { parseCargoTreeOutput } from './cargo'

test('normal one', () => {
	const input = `
tauri v2.0.0-beta.18 (/Users/jingyu/Github/tauri/core/tauri)
├── anyhow v1.0.81
├── bytes v1.6.0
├── cocoa v0.25.0
├── data-url v0.3.1
├── dirs-next v2.0.0
├── dunce v1.0.4
├── embed_plist v1.2.2
├── futures-util v0.3.30
├── getrandom v0.2.12
├── glob v0.3.1
├── heck v0.5.0
├── http v1.1.0
├── http-range v0.1.5
├── image v0.24.9
├── log v0.4.21
├── mime v0.3.17
├── muda v0.13.1
├── objc v0.2.7
├── percent-encoding v2.3.1
├── raw-window-handle v0.6.0
├── reqwest v0.12.2
├── serde v1.0.204
├── serde_json v1.0.115
├── serde_repr v0.1.18 (proc-macro)
├── serialize-to-javascript v0.1.1
├── specta v2.0.0-rc.9
├── state v0.6.0
├── tauri-macros v2.0.0-beta.14 (proc-macro) (/Users/jingyu/Github/tauri/core/tauri-macros)
├── tauri-runtime v2.0.0-beta.15 (/Users/jingyu/Github/tauri/core/tauri-runtime)
├── tauri-runtime-wry v2.0.0-beta.15 (/Users/jingyu/Github/tauri/core/tauri-runtime-wry)
├── tauri-utils v2.0.0-beta.14 (/Users/jingyu/Github/tauri/core/tauri-utils)
├── thiserror v1.0.58
├── tokio v1.37.0
├── tracing v0.1.40
├── tray-icon v0.13.5
├── url v2.5.0
├── urlpattern v0.2.0
├── uuid v1.8.0
└── window-vibrancy v0.5.0
[build-dependencies]
├── heck v0.5.0
├── tauri-build v2.0.0-beta.14 (/Users/jingyu/Github/tauri/core/tauri-build)
└── tauri-utils v2.0.0-beta.14 (/Users/jingyu/Github/tauri/core/tauri-utils)
[dev-dependencies]
├── cargo_toml v0.17.2
├── proptest v1.5.0
├── quickcheck v1.0.3
├── quickcheck_macros v1.0.0 (proc-macro)
├── serde v0.9.15
├── serde_json v1.0.115 (*)
├── tauri v2.0.0-beta.18 (/Users/jingyu/Github/tauri/core/tauri) (*)
└── tokio v1.37.0 (*)
`
	const res = parseCargoTreeOutput(input)
	expect(Object.keys(res.dependencies).length).toBe(39)
	expect(Object.keys(res['dev-dependencies']).length).toBe(8)
	expect(Object.keys(res['build-dependencies']).length).toBe(3)

	expect(res['dev-dependencies']["tokio"].version).toBe("1.37.0")
	expect(res['dev-dependencies']["tokio"].deduplicated).toBe(true)
	expect(res['dev-dependencies']["tokio"].path).toBe(undefined)
	expect(res['dev-dependencies']["tokio"].procMacro).toBe(false)

	expect(res['build-dependencies']["tauri-utils"].version).toBe("2.0.0-beta.14")
	expect(res['build-dependencies']["tauri-utils"].deduplicated).toBe(false)
	expect(res['build-dependencies']["tauri-utils"].path).toBe("/Users/jingyu/Github/tauri/core/tauri-utils")
	expect(res['build-dependencies']["tauri-utils"].procMacro).toBe(false)

	expect(res['dev-dependencies']["quickcheck_macros"].version).toBe("1.0.0")
	expect(res['dev-dependencies']["quickcheck_macros"].deduplicated).toBe(false)
	expect(res['dev-dependencies']["quickcheck_macros"].path).toBe(undefined)
	expect(res['dev-dependencies']["quickcheck_macros"].procMacro).toBe(true)

	expect(res['dev-dependencies']["tauri"].version).toBe("2.0.0-beta.18")
	expect(res['dev-dependencies']["tauri"].deduplicated).toBe(true)
	expect(res['dev-dependencies']["tauri"].path).toBe("/Users/jingyu/Github/tauri/core/tauri")
	expect(res['dev-dependencies']["tauri"].procMacro).toBe(false)

	expect(res.dependencies["log"].version).toBe("0.4.21")
	expect(res.dependencies["log"].deduplicated).toBe(false)
	expect(res.dependencies["log"].path).toBe(undefined)
	expect(res.dependencies["log"].procMacro).toBe(false)
})