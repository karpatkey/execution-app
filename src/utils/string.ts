export const trimAll = (obj: any) => {
  Object.keys(obj as any).map((key) => {
    if (typeof obj[key] === 'string') {
      obj[key] = obj[key].trim()
    } else {
      trimAll(obj[key])
    }
  })
}

export const isObject = (value: any) => {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export const shortenAddress = (address: string, chars = 4): string => {
  return `${address.substring(0, chars + 2)}...${address.substring(42 - chars)}`
}

export function slug(value: string): string {
  return value.replaceAll(' ', '-').toLowerCase()
}
