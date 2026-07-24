import { customAlphabet } from "nanoid";

// Short, unambiguous alphabet — no 0/O or 1/I/l confusion, since staff may
// occasionally need to read this slug aloud or type it manually as a fallback.
const nanoid = customAlphabet("23456789abcdefghjkmnpqrstuvwxyz", 6);

export function generateShortSlug(): string {
  return nanoid();
}
