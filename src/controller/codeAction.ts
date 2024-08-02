import { CodeActionKind, CodeActionProvider, TextDocument, Range, CodeAction, WorkspaceEdit } from "vscode"
import { documentState } from "./documentState"
import { DependencyKey, VersionState } from "@/entity"

export class CargoTomlAction implements CodeActionProvider {
    //TODO why not interface
    private state = documentState

    public static readonly providedCodeActionKinds = [
        CodeActionKind.RefactorRewrite
    ];

    public provideCodeActions(document: TextDocument, range: Range): CodeAction[] | undefined {
        const node = this.state.nodeFromRange(range)
        if (!node) return
        if (node.dependency) {
            const dep = this.state.dependency(node.dependency?.dependencyId)
            const actions: CodeAction[] = []

            switch (node.dependency.key) {
                //version
                case DependencyKey.SIMPLE_VERSION:
                case DependencyKey.VERSION:
                    const state = dep?.version.state ?? VersionState.UNKNOWN
                    switch (state) {
                        //fix version not exist
                        case VersionState.NOT_EXIST:
                            const notExistAction = new CodeAction(dep!.version.latest!, CodeActionKind.QuickFix)
                            notExistAction.edit = new WorkspaceEdit()
                            notExistAction.edit.replace(document.uri, node.range, "\"" + dep!.version.latest! + "\"")
                            actions.push(notExistAction)
                            break
                        //update to latest
                        case VersionState.OUTDATED:
                            const outdatedAction = new CodeAction(dep!.version.latest!, CodeActionKind.RefactorRewrite)
                            outdatedAction.edit = new WorkspaceEdit()
                            outdatedAction.edit.replace(document.uri, node.range, "\"" + dep!.version.latest! + "\"")
                            actions.push(outdatedAction)
                            break
                        //lock to current version
                        // default:
                        //     if (!dep?.version.value.startsWith("\"=")) {
                        //         const lockText = "=" + dep!.currentVersion
                        //         const lockVersion = new CodeAction(lockText, CodeActionKind.RefactorRewrite)
                        //         lockVersion.edit = new WorkspaceEdit()
                        //         lockVersion.edit.replace(document.uri, node.range, "\"" + lockText + "\"")
                        //         actions.push(lockVersion)
                        //     }
                    }
            }
            return actions
        }
    }
}

export const cargoTomlAction = new CargoTomlAction()