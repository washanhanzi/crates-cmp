import { DependencyNode } from "@/entity"
import { ParsedCargoTreeOutput } from "./cargo"
import { Diagnostic } from "vscode"

class DependencyTree {
    private path: string | undefined = undefined
    private dependencies: Map<string, DependencyNode> = new Map()
    private dirtyNodes: Map<string, number> = new Map() // New map to track changed nodes and their revisions
    private notFoundNodes: Set<string> = new Set()

    isEmpty() {
        return this.dependencies.size === 0
    }

    checkAndDelDirty(id: string, rev: number) {
        if (this.dirtyNodes.has(id) && this.dirtyNodes.get(id)! <= rev) {
            this.dirtyNodes.delete(id)
            return true
        }
        return false
    }

    reset() {
        this.dependencies.clear()
        this.dirtyNodes.clear()
        this.notFoundNodes.clear()
    }


    init(path: string, nodes?: DependencyNode[]) {
        if (path !== this.path) {
            this.dependencies.clear()
            this.dirtyNodes.clear()
            this.notFoundNodes.clear()
        }
    }

    getDependencies() {
        return this.dependencies
    }


    populateUserInput(rev: number, nodes: { [key: string]: DependencyNode }, changes: any): void {
        // Handle additions and updates
        for (const id of [...changes.added, ...changes.valueUpdated]) {
            const node = nodes[id]
            if (node) {
                this.dependencies.set(id, { ...node })
                this.dirtyNodes.set(id, rev)
                // this.deletedNodes.delete(id)
            }
        }

        // Handle deletions
        for (const id of changes.deleted) {
            this.dependencies.delete(id)
            // this.dirtyNodes.set(id, rev)
            // this.deletedNodes.add(id)
        }
    }

    //populate from cargo tree, also include rev, only populate
    populateCurrent(rev: number, currentDeps: ParsedCargoTreeOutput) {
        for (let key of this.dirtyNodes.keys()) {
            //no update
            if (!this.dirtyNodes.get(key)) {
                continue
            }
            const dep = this.dependencies.get(key)
            const crateName = dep!.packageName ?? dep!.name
            const cur = currentDeps[dep!.tableName][crateName] ?? undefined
            if (!cur) {
                this.notFoundNodes.add(key)
                continue
            }
            this.dependencies.set(key, { ...dep!, currentVersion: cur.version })
        }
        let newDuplicated = new Map<string, string[]>()
        if (currentDeps.duplicated.size !== 0) {
            for (let [k, v] of this.dependencies.entries()) {
                const crateName = v.packageName ?? v.name
                if (currentDeps.duplicated.has(crateName)) {
                    newDuplicated.set(k, currentDeps.duplicated.get(crateName)!)
                }
            }
        }
        return newDuplicated
    }

    populateCurrentWithoutDoc(rev: number, currentDeps: ParsedCargoTreeOutput) {
        for (let dep of this.dependencies.values()) {
            const crateName = dep!.packageName ?? dep!.name
            if (!currentDeps[dep.tableName][crateName]) continue
            if (dep.currentVersion !== currentDeps[dep.tableName][crateName].version) {
                this.dependencies.set(dep.id, { ...dep, currentVersion: currentDeps[dep.tableName][crateName].version })
                this.dirtyNodes.set(dep.id, rev)
            }
        }
        let newDuplicated = new Map<string, string[]>()
        if (currentDeps.duplicated.size !== 0) {
            for (let [k, v] of this.dependencies.entries()) {
                const crateName = v.packageName ?? v.name
                if (currentDeps.duplicated.has(crateName)) {
                    newDuplicated.set(k, currentDeps.duplicated.get(crateName)!)
                }
            }
        }
        return newDuplicated
    }

    dirtyIds() {
        return Array.from(this.dirtyNodes.keys())
    }

    isClean() {
        return this.dirtyNodes.size === 0
    }

    notFoundIds() {
        return Array.from(this.notFoundNodes)
    }

    dirtyDeps(rev: number = 0) {
        let res: DependencyNode[] = []
        for (let [id, v] of this.dirtyNodes.entries()) {
            if (v > rev) {
                return []
            }
            const dep = this.dependencies.get(id)
            res.push(dep!)
        }
        return res
    }
}

export const dependencyTree = new DependencyTree()