import { instances } from "../../config/dato/instances";

export default async (event) => {
    try {
        // Find the current instance
        const currentInstance = instances.find(
            (instance) => instance.name === process.env.DATO_INSTANCE_CURRENT
        );

        if (!currentInstance) {
            return createErrorResponse("Current instance not found", 500);
        }

        const apiUrl = `${currentInstance.apiUrl}/api`;

        if (!apiUrl) {
            return createErrorResponse("API_URL is not configured", 500);
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

        // Prepare headers to forward
        const headers = new Headers();

        // Forward relevant headers from the original request
        if (event.headers) {
            const headersToForward = [
                'authorization',
                'content-type',
                'accept',
                'user-agent',
                'x-requested-with'
            ];

            for (const header of headersToForward) {
                if (event.headers[header]) {
                    headers.set(header, event.headers[header]);
                }
            }
        }

        // Prepare fetch options
        const fetchOptions = {
            method: event.httpMethod || 'GET',
            headers
        };

        // Forward request body for POST, PUT, PATCH methods
        if (['POST', 'PUT', 'PATCH'].includes(fetchOptions.method) && event.body) {
            fetchOptions.body = event.body;
        }

        // Log request details (only in development)
        if (process.env.NODE_ENV !== 'production') {
            console.log(`Proxying ${fetchOptions.method} request to: ${targetUrlString}`);
        }

        console.log('[TARGET URL]', targetUrlString);

        // Fetch the target URL and return its response
        const response = await fetch(targetUrlString, fetchOptions);

        // Get the content type from the response headers
        const contentType = response.headers.get("Content-Type") || "";

        // Handle the response based on content type
        let responseData;
        // Check if the response is binary data
        const isBinaryContent = contentType.includes('image/') ||
            contentType.includes('application/pdf') ||
            contentType.includes('application/octet-stream') ||
            contentType.includes('application/x-netcdf') ||
            contentType.includes('application/x-gzip') ||
            contentType.includes('application/zip') ||
            contentType.includes('application/vnd.google-earth.kml') ||
            contentType.includes('application/x-netcdf4') ||
            contentType.includes('image/tiff') ||
            contentType.includes('application/vnd.') ||
            contentType.includes('application/x-');

        if (isBinaryContent) {
            // For binary data, use arrayBuffer
            responseData = await response.arrayBuffer();
        } else {
            // For text/json data, use text
            responseData = await response.json();
        }

        // Prepare response headers
        const responseHeaders = new Headers();
        responseHeaders.set("Content-Type", contentType);

        // Add CORS headers
        responseHeaders.set("Access-Control-Allow-Origin", "*");
        responseHeaders.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        responseHeaders.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

        // Forward other important headers from the API response
        const headersToForward = ['cache-control', 'etag', 'last-modified'];
        for (const header of headersToForward) {
            const value = response.headers.get(header);
            if (value) {
                responseHeaders.set(header, value);
            }
        }

        // Return the response with appropriate content type
        return new Response(JSON.stringify(responseData), {
            status: response.status,
            headers: Object.fromEntries(responseHeaders)
        });
    } catch (error) {
        console.error("Error proxying request:", error);
        return createErrorResponse("Error proxying request to API", 500);
    }
};

// Helper function to create error responses
function createErrorResponse(message, status) {
    return new Response(JSON.stringify({ error: message }), {
        status,
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
        }
    });
}

// Configure the function path
export const config = {
    path: "/api/*"
};
