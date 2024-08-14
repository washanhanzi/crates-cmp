import { ConfigurationChangeEvent, workspace, window, ColorThemeKind } from "vscode"

const SECTION = "crates-cmp"
const SPARSE_INDEX_CONFIG = "crates.sparse-index.url"
const ENABLE_CARGO_AUDIT = "cargo.audit.enable"

class Config {
    private sparseIndexUrl: string = "https://index.crates.io"
    private enableAudit: boolean = false
    private currentTheme: ColorThemeKind

    constructor() {
        this.updateSparseIndexUrl()
        this.updateCargoAudit()
        this.currentTheme = window.activeColorTheme.kind
    }

    getSparseIndexUrl() {
        return this.sparseIndexUrl
    }

    getEnableAudit() {
        return this.enableAudit
    }

    getCurrentTheme() {
        return this.currentTheme
    }

    updateSparseIndexUrl() {
        const sparseIndexUrl = workspace.getConfiguration("crates-cmp").get(SPARSE_INDEX_CONFIG)
        if (typeof sparseIndexUrl === "string") {
            this.sparseIndexUrl = sparseIndexUrl
        }
    }

    updateCargoAudit() {
        const enableAudit = workspace.getConfiguration("workbench.colorTheme").get(ENABLE_CARGO_AUDIT)
        if (typeof enableAudit === "boolean") {
            this.enableAudit = enableAudit
        }
    }

    onThemeChange(theme) {
        this.currentTheme = theme.kind
    }


    onChange(e: ConfigurationChangeEvent) {
        if (e.affectsConfiguration(SECTION + "." + SPARSE_INDEX_CONFIG)) {
            this.updateSparseIndexUrl()
        }
        if (e.affectsConfiguration(SECTION + "." + ENABLE_CARGO_AUDIT)) {
            this.updateCargoAudit()
        }
    }
}

export const config = new Config()
