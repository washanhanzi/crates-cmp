import { DiagnosticSeverity, ExtensionContext, TextDocument, Uri, window } from "vscode"
import { decorationStore } from "./decoration"
import { diagnosticStore } from "./diagnostic"
import { documentTree } from "./documentTree"
import { DependenciesTraverser, symbolTree } from "./symbolTree"
import { dependencyTree } from "./dependencyTree"
import { async } from "@washanhanzi/result-enum"
import { cargoTree } from "./cargo"
import { dependenciesDecorations, dependenciesDiagnostics } from "@/usecase"
import { DependencyDecorationWithCtx, DependencyItemType } from "@/entity"

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
            const deps = this.depTree.dirtyDeps(this.rev)

            //early exit
            if (deps.length === 0) return

            //suspend
            const diagnostics = await dependenciesDiagnostics(ctx, deps)
            //resume check
            if (diagnostics.length === 0) { return }

            diagnostics
                .filter(d => this.depTree.checkAndDelDirty(d.diagnostic.id, d.ctx.rev))
                .forEach(d => {
                    this.decorations.delete(d.diagnostic.id)
                    this.diagnostic.add(d.ctx.path, this.docTree.range(d.diagnostic.id)!, d.diagnostic)
                })
            this.diagnostic.render(ctx.uri)
            return
        }
        const currentDepts = currentDepsResult.unwrap()

        const duplicated = this.depTree.populateCurrent(ctx.rev, currentDepts)
        if (duplicated.size !== 0) {
            for (let [key, value] of duplicated) {
                this.diagnostic.add(
                    ctx.path,
                    this.docTree.range(key)!,
                    {
                        id: key,
                        type: DependencyItemType.CRATE,
                        severity: DiagnosticSeverity.Information,
                        message: `Found multiple versions: ${value.join(", ")}`,
                        source: "crates-cmp"
                    },
                )
            }
            this.diagnostic.render(ctx.uri)
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
            const deps = this.depTree.dirtyDeps(this.rev)

            //early exit
            if (deps.length === 0) return

            //suspend
            const diagnostics = await dependenciesDiagnostics(ctx, deps)
            //resume check
            if (diagnostics.length === 0) { return }

            diagnostics
                .filter(d => this.depTree.checkAndDelDirty(d.diagnostic.id, d.ctx.rev))
                .forEach(d => {
                    this.decorations.delete(d.diagnostic.id)
                    this.diagnostic.add(d.ctx.path, this.docTree.range(d.diagnostic.id)!, d.diagnostic)
                })
            this.diagnostic.render(ctx.uri)
            return
        }
        const currentDepts = currentDepsResult.unwrap()

        const duplicated = this.depTree.populateCurrentWithoutDoc(ctx.rev, currentDepts)

        for (let id of this.depTree.dirtyIds()) {
            this.decorations.setLoading(id, this.docTree.range(id))
            this.diagnostic.delete(ctx.uri, id)
        }

        if (duplicated.size !== 0) {
            for (let [key, value] of duplicated) {
                this.diagnostic.add(
                    ctx.path,
                    this.docTree.range(key)!,
                    {
                        id: key,
                        type: DependencyItemType.CRATE,
                        severity: DiagnosticSeverity.Information,
                        message: `Found multiple versions: ${value.join(", ")}`,
                        source: "crates-cmp"
                    },
                )
            }
            this.diagnostic.render(ctx.uri)
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

    outputPromiseHandler(output: DependencyDecorationWithCtx) {
        if (this.depTree.checkAndDelDirty(output.decoration.id, output.ctx.rev)) {
            this.decorations.decorateDependency(output.decoration.id, this.docTree.range(output.decoration.id)!, output.decoration)
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
}

export const documentState = new DocumentState()