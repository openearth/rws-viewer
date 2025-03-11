import { instances } from "../../config/dato/instances";

export default async (event) => {
    try {
        // Find the current instance
        const currentInstance = instances.find(
            (instance) => instance.name === process.env.DATO_INSTANCE_CURRENT
        );

        if (!currentInstance) {
            return new Response("Current instance not found", {
                status: 500
            });
        }

        const apiUrl = currentInstance.apiUrl;

        if (!apiUrl) {
            return new Response("API_URL is not configured", {
                status: 500
            });
        }

        // Get the path and query parameters from the request URL
        const eventUrl = new URL(event.url);
        const path = eventUrl.pathname.replace('/.netlify/functions/api', '');

        // Create the target URL with the path
        const targetUrl = new URL(path, apiUrl);

        // Copy all query parameters from the original request URL
        for (const [key, value] of eventUrl.searchParams.entries()) {
            targetUrl.searchParams.set(key, value);
        }

        // Also check event.queryStringParameters as a fallback for compatibility
        const params = event.queryStringParameters || {};
        Object.keys(params).forEach(key => {
            // Only set if not already set from URL search params
            if (!targetUrl.searchParams.has(key)) {
                targetUrl.searchParams.set(key, params[key]);
            }
        });

        // Convert to string for the fetch request
        const targetUrlString = targetUrl.toString();

        console.log("targetUrl", targetUrlString);
        console.log("event", event);

        // Fetch the target URL and return its response
        const response = await fetch(targetUrlString);

        // Get the content type from the response headers
        const contentType = response.headers.get("Content-Type") || "";

        // Check if the response is JSON
        if (contentType.includes("application/json")) {
            const jsonData = await response.text();

            try {
                // Return the JSON response
                return new Response({
                    data: jsonData,
                }, {
                    status: response.status,
                    headers: {
                        "Content-Type": "application/json"
                    }
                });
            } catch (error) {
                console.error("Error parsing JSON:", error);

                // Return as plain text if JSON parsing fails
                return new Response({
                    data: jsonData,
                }, {
                    status: response.status,
                    headers: {
                        "Content-Type": "text/plain"
                    }
                });
            }
        } else {
            // Handle as text for non-JSON responses
            const textData = await response.text();

            return new Response({
                data: textData,
            }, {
                status: response.status,
                headers: {
                    "Content-Type": contentType
                }
            });
        }
    } catch (error) {
        console.error("Error proxying request:", error);

        return new Response("Error proxying request to API", {
            status: 500
        });
    }
};

// Configure the function path
export const config = {
    path: "/api-rewrite/*"
};
