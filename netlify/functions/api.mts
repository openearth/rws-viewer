import type { Config } from "@netlify/functions";

export const config: Config = {
  path: ["/api-rewrite/*"],
};

export default async (req: Request) => {
  // a redirect to the configured env.API_URL
  const apiUrl = process.env.API_URL;

  console.log("apiUrl", apiUrl);

  if (!apiUrl) {
    return new Response("API_URL is not configured", { status: 500 });
  }

  // Get the path from the request URL
  const url = new URL(req.url);
  const path = url.pathname;

  // Create the target URL with the path
  const targetUrl = new URL(path, apiUrl);

  // Copy all query parameters from the original request
  url.searchParams.forEach((value, key) => {
    targetUrl.searchParams.set(key, value);
  });

  // Convert to string for the fetch request
  const targetUrlString = targetUrl.toString();

  console.log("targetUrl", targetUrlString);

  // Fetch the target URL and return its response instead of redirecting
  try {
    const response = await fetch(targetUrlString);

    // Get the content type from the response headers
    const contentType = response.headers.get("Content-Type") || "";

    // Check if the response is JSON
    if (contentType.includes("application/json")) {
      const jsonData = await response.text();
      let stringified: string;

      try {
        stringified = JSON.stringify(jsonData);
      } catch (error) {
        stringified = jsonData;
        return new Response(stringified, {
          status: response.status,
          headers: {
            "Content-Type": "text/plain",
          },
        });
      }

      return new Response(stringified, {
        status: response.status,
        headers: {
          "Content-Type": "application/json",
        },
      });
    } else {
      // Handle as text for non-JSON responses
      const textData = await response.text();

      return new Response(textData, {
        status: response.status,
        headers: {
          "Content-Type": contentType,
        },
      });
    }
  } catch (error) {
    console.error("Error proxying request:", error);

    return new Response("Error proxying request to API", { status: 500 });
  }
};
