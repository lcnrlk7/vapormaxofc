export function waLink(number: string, message?: string): string {
  const clean = (number || "").replace(/\D/g, "")
  const base = `https://wa.me/${clean}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}
