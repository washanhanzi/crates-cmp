import { Uri, workspace, window, Range, DiagnosticSeverity } from "vscode"
import { DiagnosticStore, diagnosticStore, DiagnosticType, MyDiag } from "./diagnostic"
import { config } from "@/entity"
import { cargoAudit } from "./cargo"


class Audit {
    //lock file path -> cargo audit output
    private initialized: boolean = false
    private state: Map<string, any> = new Map();
    private diagnostic: DiagnosticStore<MyDiag>

    constructor(d: DiagnosticStore<MyDiag>) {
        this.diagnostic = d
    }

    async initialize() {
        if (!config.getEnableAudit()) return
        if (this.initialized) return
        const lockFileList = await workspace.findFiles("**/Cargo.lock")
        for await (let f of lockFileList) {
            const res = await cargoAudit(f.path)
            this.state.set(f.path, res)
        }
        this.initialized = true
        this.updateDiagnostic()
    }

    async onLockFileChange(e: Uri) {
        if (!config.getEnableAudit()) return

        //update state
        const res = await cargoAudit(e.path)
        this.state.set(e.path, res)
        //update diagnostic
        this.updateDiagnostic()
    }

    async onLockFileCreate(e: Uri) {
        if (!config.getEnableAudit()) return

        //set state
        const res = await cargoAudit(e.path)
        this.state.set(e.path, res)
        //update diagnostic
        this.updateDiagnostic()
    }

    async onLockFileDelete(e: Uri) {
        if (!config.getEnableAudit()) return

        this.state.delete(e.path)
        //update diagnostic
        this.updateDiagnostic()
    }

    updateDiagnostic() {
        if (!window.activeTextEditor) return
        if (!window.activeTextEditor.document.fileName.endsWith("Cargo.toml")) return
        const path = window.activeTextEditor.document.uri.path
        let severity = DiagnosticSeverity.Hint
        let message = ""
        for (let [k, v] of this.state) {
            message += `File: ${k} \n\n`
            if (v?.vulnerabilities.found) {
                message += `Vulnerabilities found: ${v.vulnerabilities.count} \n\n`
                severity = DiagnosticSeverity.Error
                for (let d of v!.vulnerabilities.list) {
                    if (d?.advisory) {
                        message += `ID: ${d.advisory.id}\nPackage: ${d.advisory.package}\ntitle: ${d.advisory.title}\nurl: ${d.advisory.url}\n\n`
                    }
                }
            }
            if (v?.warnings?.unsound && v.warnings.unsound.length > 0) {
                if (severity !== DiagnosticSeverity.Error) {
                    severity = DiagnosticSeverity.Warning
                }
                message += `Unsound found: ${v.warnings.unsound.length} \n\n`
                for (let d of v.warnings.unsound) {
                    if (d?.advisory) {
                        message += `ID: ${d.advisory.id}\nPackage: ${d.advisory.package}\ntitle: ${d.advisory.title}\nurl: ${d.advisory.url}\n\n`
                    }
                }
            }
            if (v?.warnings?.yanked && v.warnings.yanked.length > 0) {
                if (severity !== DiagnosticSeverity.Error) {
                    severity = DiagnosticSeverity.Warning
                }
                message += `Yanked found: ${v.warnings.yanked.length} \n\n`
                for (let d of v.warnings.yanked) {
                    message += `Package: ${d.package.name}\nversion: ${d.package.version}\n`
                }
            }
            message += "\n"
        }
        if (severity === DiagnosticSeverity.Hint) return
        this.diagnostic.add(path, {
            id: "package",
            state: new MyDiag(DiagnosticType.AUDIT),
            diagnostic: {
                message: message,
                range: new Range(0, 1, 0, 10),
                severity: severity
            }
        })
        this.diagnostic.render(window.activeTextEditor.document.uri)
    }
}

export const audit = new Audit(diagnosticStore)