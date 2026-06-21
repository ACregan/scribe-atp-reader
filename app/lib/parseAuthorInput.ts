export function parseAuthorInput(value: string): string {
  return value.trim().replace(/^at:\/\//, "");
}
