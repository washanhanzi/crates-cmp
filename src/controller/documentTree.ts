import { Range } from "vscode"
import { DependencyNode } from "@/entity"

type DocumentTreeNode = {
    value: string,
    range: Range
}

export class DocumentTree {
    private path: string = ""
    private nodes: Map<string, DocumentTreeNode> = new Map()
    private notVisitedNode: Set<string> = new Set()
    private dependencyNodes: { [key: string]: DependencyNode } = {}

    added: Set<string> = new Set()
    valueUpdated: Set<string> = new Set()
    rangeUpdated: Set<string> = new Set()
    dependencyIds: string[] = []
    deleted: Set<string> = new Set()

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
        this.nodes.set(id, { value, range })
    }

    addDependency(node: DependencyNode) {
        this.dependencyNodes[node.id] = node
    }

    visitNode(id: string, node: DocumentTreeNode) {
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

export const documentTree = new DocumentTree()