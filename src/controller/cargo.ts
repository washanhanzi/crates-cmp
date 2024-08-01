import { parseCargoTreeOutput } from "@/usecase"
import { execAsync } from "@/util"
import { cargoPath } from "./executable"

export async function cargoTree(path: string) {
    const executable = await cargoPath()

    const tree = await execAsync(`${executable} tree --manifest-path ${path} --depth 1 --all-features`)
        .catch(e => { throw e })

    return parseCargoTreeOutput(tree as string)
}