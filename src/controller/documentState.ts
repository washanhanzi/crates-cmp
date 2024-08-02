import { DiagnosticSeverity, ExtensionContext, TextDocument, window, Range, Diagnostic } from "vscode"
import { decorationStore, intoDependencyDecoration } from "./decoration"
import { diagnosticStore, DiagnosticType, MyDiag } from "./diagnostic"
import { documentTree } from "./documentTree"
import { DependenciesTraverser, symbolTree } from "./symbolTree"
import { async } from "@washanhanzi/result-enum"
import { dependenciesDecorations, dependenciesDiagnostics, dependencyTree } from "@/usecase"
import { Ctx, VersionValueWithCtx } from "@/entity"
import { cargoTree } from "./cargo"

class DocumentState {
    private docTree = documentTree
    private depTree = dependencyTree
    private decorations = decorationStore
    private diagnostic = diagnosticStore
    path: string | undefined
    version: number = 0
    rev: number = 0

    reset() {
        this.path = undefined
        this.docTree.reset()
        this.depTree.reset()
        this.decorations.reset()
    }

    init(document: TextDocument) {
        if (this.path !== document.uri.path) {
            this.rev = 0
        }
        this.path = document.uri.path
        this.docTree.init(this.path)
        this.decorations.init(this.path)
        this.version = document.version
    }

    //TODO when there is a error diagnostic on this file, there is no need to parse again
    async parseDocument(extensionCtx: ExtensionContext, document: TextDocument) {
        const tree = await symbolTree(document.uri)
        if (this.noResumeDocTree()) return

        const ctx = {
            extensionContext: extensionCtx,
            path: this.path!,
            rev: this.incRev(),
            uri: document.uri
        }

        const walkerer = new DependenciesTraverser(tree, document, this.docTree)
        walkerer.walk()
        const nodes = this.docTree.finalize()

        //no dependencies
        if (this.docTree.isEmpty()) return

        for (let id of this.docTree.dirtyIds()) {
            this.decorations.setLoading(id, this.docTree.range(id))
            this.diagnostic.delete(ctx.uri, id)
        }

        for (let id of this.docTree.deletedIds()) {
            this.decorations.delete(id)
            this.diagnostic.delete(ctx.uri, id)
        }

        //update decoration range
        for (let id of this.docTree.rangeUpdatedIds()) {
            this.decorations.decorateDependency(id, this.docTree.range(id)!)
        }

        //document tree is clean
        if (this.docTree.isClean()) return

        //populate dependencies
        this.depTree.populateUserInput(ctx.rev, nodes, this.docTree.getAllChanges())

        const currentDepsResult = await async(cargoTree(ctx.path))
        if (this.noResumeDepTree()) return
        if (currentDepsResult.isErr()) {
            return await this.afterCargoErr(ctx)
        }
        const currentDepts = currentDepsResult.unwrap()

        const duplicated = this.depTree.populateCurrent(ctx.rev, currentDepts)

        this.afterCargoOk(ctx, duplicated)
    }

    async afterCargoErr(ctx: Ctx) {
        const deps = this.depTree.dirtyDeps(this.rev)

        //early exit
        if (deps.length === 0) return

        //suspend
        const diagnostics = await dependenciesDiagnostics(ctx, deps)
        //resume check
        if (diagnostics.length === 0) { return }

        diagnostics
            .filter(d => {
                let id = ""
                if ("version" in d) { id = d.version.dependencyId }
                if ("feature" in d) { id = d.feature.dependencyId }
                return this.depTree.checkAndDelDirty(id, d.ctx.rev)
            })
            .forEach(d => {
                let depId = ""
                let rangeId = ""
                let message = ""
                let severity = DiagnosticSeverity.Hint
                if ("version" in d) {
                    depId = d.version.dependencyId
                    rangeId = d.version.id
                    message = d.version.diagnostic!.message
                    severity = d.version.diagnostic!.severity
                    this.depTree.updateVersion(d.version.dependencyId, d.version)
                }
                if ("feature" in d) {
                    depId = d.feature.dependencyId
                    rangeId = d.feature.id
                    message = d.feature.diagnostic!.message
                    severity = d.feature.diagnostic!.severity
                    this.depTree.updateFeature(d.feature.dependencyId, d.feature)
                }
                this.decorations.delete(depId)
                this.diagnostic.add(
                    d.ctx.path,
                    {
                        id: depId,
                        state: new MyDiag(DiagnosticType.DEPENDENCY),
                        diagnostic: new Diagnostic(this.docTree.range(rangeId)!, message, severity)
                    })
            })
        this.diagnostic.render(ctx.uri)
        return
    }

    afterCargoOk(ctx: Ctx, duplicated) {
        if (duplicated.length !== 0) {
            for (let d of duplicated) {
                this.diagnostic.add(
                    ctx.path,
                    {
                        id: d.dependencyId,
                        state: new MyDiag(DiagnosticType.DEPENDENCY),
                        diagnostic: new Diagnostic(this.docTree.range(d.rangeId)!, `Found multiple versions: ${d.crates.join(", ")}`, DiagnosticSeverity.Information)
                    }
                )
            }
            this.diagnostic.render(ctx.uri)
        } else {
            this.diagnostic.clear(ctx.uri, new MyDiag(DiagnosticType.DEPENDENCY))
        }

        for (let key of this.depTree.notFoundIds()) {
            if (this.depTree.checkAndDelDirty(key, ctx.rev)) {
                this.decorations.setNotInstalled(key, this.docTree.range(key))
            }
        }

        const deps = this.depTree.dirtyDeps(this.rev)
        if (deps.length === 0) return

        const promises = dependenciesDecorations(ctx, deps)
        promises.forEach(p => p.then(this.outputPromiseHandler.bind(this)))
    }

    async parseDependencies(extensionContext: ExtensionContext, document: TextDocument) {
        //if dep tree is not clean, the change is triggered by cargo.toml
        if (!this.depTree.isClean()) return

        const ctx = {
            extensionContext: extensionContext,
            path: this.path!,
            rev: this.incRev(),
            uri: document.uri
        }
        const currentDepsResult = await async(cargoTree(ctx.path))
        if (this.noResumeDepTree()) return
        if (currentDepsResult.isErr()) {
            return await this.afterCargoErr(ctx)
        }
        const currentDepts = currentDepsResult.unwrap()

        const duplicated = this.depTree.populateCurrentWithoutDoc(ctx.rev, currentDepts)

        for (let id of this.depTree.dirtyIds()) {
            this.decorations.setLoading(id, this.docTree.range(id))
            this.diagnostic.delete(ctx.uri, id)
        }

        this.afterCargoOk(ctx, duplicated)
    }

    outputPromiseHandler(output: VersionValueWithCtx) {
        if (this.depTree.checkAndDelDirty(output.version.dependencyId, output.ctx.rev)) {
            const deco = intoDependencyDecoration(output.version)
            if (!deco) return
            this.depTree.updateVersion(output.version.dependencyId, output.version)
            this.decorations.decorateDependency(
                output.version.dependencyId,
                this.docTree.range(output.version.dependencyId)!,
                deco
            )
        }
    }

    incRev() {
        this.rev = this.rev + 1
        return this.rev
    }

    noResumeDocTree() {
        if (!window.activeTextEditor) return true
        if (!window.activeTextEditor.document.fileName.endsWith("Cargo.toml")) true
        if (window.activeTextEditor.document.uri.path !== this.path) return true
        if (window.activeTextEditor.document.version < this.version) return true
    }

    noResumeDepTree() {
        if (!window.activeTextEditor) return true
        if (!window.activeTextEditor.document.fileName.endsWith("Cargo.toml")) true
        if (window.activeTextEditor.document.uri.path !== this.path) return true
        if (this.depTree.isEmpty()) return true
    }

    //method from doc tree
    nodeFromRange(range: Range) {
        return this.docTree.nodeFromRange(range)
    }

    //method from dependency tree
    dependency(id: string) {
        return this.depTree.dependency(id)
    }
}

export const documentState = new DocumentState()