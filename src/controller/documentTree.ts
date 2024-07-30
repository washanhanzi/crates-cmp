import { Range } from "vscode"
import { DependencyNode, DocumentNode } from "@/entity"


export class DocumentTree {
    private path: string = ""
    private nodes: Map<string, DocumentNode> = new Map()
    private notVisitedNode: Set<string> = new Set()
    private dependencyNodes: { [key: string]: DependencyNode } = {}
    private rangeStore = new RangeStore()

    added: Set<string> = new Set()
    valueUpdated: Set<string> = new Set()
    rangeUpdated: Set<string> = new Set()
    dependencyIds: string[] = []
    deleted: Set<string> = new Set()

    setRnages(range: Range, ids: string[]) {
        this.rangeStore.set(range.start.line, range.end.line, ids)
    }

    isEmpty() {
        return this.nodes.size === 0
    }

    reset() {
        this.path = ""
        this.nodes.clear()
        this.notVisitedNode.clear()
        this.dependencyNodes = {}
        this.added.clear()
        this.valueUpdated.clear()
        this.rangeUpdated.clear()
        this.dependencyIds.length = 0
        this.deleted.clear()
    }

    init(path: string) {
        this.rangeStore.clear()
        this.dependencyNodes = {}
        if (this.path !== path) {
            this.nodes.clear()
            this.path = path
            this.added.clear()
            this.valueUpdated.clear()
            this.rangeUpdated.clear()
            this.deleted.clear()
            this.dependencyIds.length = 0
            return
        }
        this.added.clear()
        this.valueUpdated.clear()
        this.rangeUpdated.clear()
        this.deleted.clear()

        for (let k of this.nodes.keys()) {
            this.notVisitedNode.add(k)
        }
        for (let k of this.dependencyIds) {
            this.deleted.add(k)
        }
        this.dependencyIds.length = 0
    }

    visitDependency(id: string, value: string, range: Range) {
        this.dependencyIds.push(id)
        this.deleted.delete(id)
        const existingNode = this.nodes.get(id)
        if (existingNode) {
            if (existingNode.value !== value) {
                this.valueUpdated.add(id)
            }
            if (!existingNode.range.isEqual(range)) {
                this.rangeUpdated.add(id)
            }
        } else {
            this.added.add(id)
        }
        // this.notVisitedNode.delete(id)
        // this.nodes.set(id, { id, value, range, table, dependency: { dependencyId, key } })
    }

    addDependency(node: DependencyNode) {
        this.dependencyNodes[node.id] = node
    }

    visitNode(id: string, node: DocumentNode) {
        this.notVisitedNode.delete(id)
        this.nodes.set(id, node)
    }

    finalize() {
        for (let k of this.notVisitedNode) {
            this.nodes.delete(k)
        }
        return this.dependencyNodes
    }

    deletedIds() {
        return Array.from(this.deleted)
    }

    dirtyIds() {
        return [...this.added, ...this.valueUpdated]
    }

    isClean() {
        return this.dirtyIds().length === 0
    }

    rangeUpdatedIds() {
        return Array.from(this.rangeUpdated)
    }

    node(id: string) {
        return this.nodes.get(id)
    }

    nodeFromRange(range: Range) {
        const ids = this.rangeStore.ids(range.start.line)
        if (!ids) return
        //reverse loop to check smaller range first
        for (let i = ids.length - 1; i >= 0; i--) {
            const id = ids[i]
            const node = this.node(id)
            if (node
                && node.range.isSingleLine
                && node.range.start.line === range.start.line
                && node.range.start.isBefore(range.start)
                && node.range.end.isAfter(range.end)
            ) {
                return node
            }
        }
        return undefined
    }

    range(id: string) {
        const node = this.nodes.get(id)
        return node ? node.range : undefined
    }

    getAllChanges() {
        return {
            added: Array.from(this.added),
            valueUpdated: Array.from(this.valueUpdated),
            rangeUpdated: Array.from(this.rangeUpdated),
            deleted: Array.from(this.deleted)
        }
    }
}

class RangeStore {
    private ranges: Map<number, string[]> = new Map()

    set(start: number, end: number, ids: string[]) {
        for (let i = start; i <= end; i++) {
            this.ranges.set(i, ids)
        }
    }

    clear() {
        this.ranges.clear()
    }

    ids(line: number) {
        return this.ranges.get(line)
    }
}

export const documentTree = new DocumentTree()