export function validRange(str) {
    return /^[<>~=]/.test(str) && str.includes('*')
}