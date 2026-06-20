export const dynamic = "force-static"

export function GET() {
  const manifest = {
    name: "Vapor Max",
    short_name: "Vapor Max",
    description: "Pods, vapes e essências com entrega rápida.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
    ],
  }
  return Response.json(manifest, {
    headers: { "Content-Type": "application/manifest+json" },
  })
}
