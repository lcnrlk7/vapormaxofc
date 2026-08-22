// Prices are stored as integer centavos.
export function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
}

// Parse a "R$ 59,90" or "59,90" or "59.90" string into integer centavos.
export function parseBRLToCents(input: string): number {
  if (!input) return 0
  const clean = input
    .toString()
    .replace(/[^\d,.-]/g, "")
    .replace(/\.(?=\d{3}(\D|$))/g, "") // remove thousands dot
    .replace(",", ".")
  const value = Number.parseFloat(clean)
  if (Number.isNaN(value)) return 0
  return Math.round(value * 100)
}

export function centsToReaisInput(cents: number): string {
  return (cents / 100).toFixed(2).replace(".", ",")
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function slugify(text: string): string {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function flavorsToArray(flavors: string | null | undefined): string[] {
  if (!flavors) return []

  const value = flavors.trim()
  if (value.startsWith("[")) {
    try {
      const parsed: unknown = JSON.parse(value)
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
      }
    } catch {
      // Registros antigos continuam usando o formato separado por vírgulas.
    }
  }

  return value
    .split(",")
    .map((flavor) => flavor.trim())
    .filter(Boolean)
}
