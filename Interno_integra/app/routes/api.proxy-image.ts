import type { LoaderFunctionArgs } from "react-router";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const targetUrl = url.searchParams.get("url");

  if (!targetUrl) {
    return new Response("Missing url parameter", { status: 400 });
  }

  // Apenas proxy de URLs HTTP/HTTPS para evitar vazamento
  if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
    return new Response("Invalid URL", { status: 400 });
  }

  try {
    const response = await fetch(targetUrl);
    
    if (!response.ok) {
      return new Response("Failed to fetch image", { status: response.status });
    }

    const contentType = response.headers.get("content-type") || "application/octet-stream";
    const arrayBuffer = await response.arrayBuffer();

    return new Response(arrayBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Proxy image error:", error);
    return new Response("Error fetching image", { status: 500 });
  }
}
