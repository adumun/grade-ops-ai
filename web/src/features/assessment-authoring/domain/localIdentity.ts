/** Browser-local identity, independent of array positions and preserved on edits. */
export function createLocalId(prefix: string): string {
  const random = crypto.getRandomValues(new Uint32Array(4));
  return `${prefix}-${Array.from(random, value => value.toString(16).padStart(8, "0")).join("")}`;
}
