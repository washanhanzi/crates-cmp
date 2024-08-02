import { parseCargoTreeOutput } from "@/usecase"
import { execAsync, execCargoAuditAsync } from "@/util"
import { cargoPath } from "./executable"

export async function cargoTree(path: string) {
    const executable = await cargoPath()

    const tree = await execAsync(`${executable} tree --manifest-path ${path} --depth 1 --all-features`)
        .catch(e => { throw e })

    return parseCargoTreeOutput(tree as string)
}

export async function cargoAudit(path: string) {
    const executable = await cargoPath()

    const auditOutput = await execCargoAuditAsync(`${executable} audit --json -f ${path}`)
        .catch(e => { throw e })

    return JSON.parse(auditOutput as string)
}