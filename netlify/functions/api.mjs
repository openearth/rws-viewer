const { instances } = require("../../config/dato/instances");

// Change to exports.handler format
exports.handler = async (event, context) => {
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
        const eventUrl = new URL(event.rawUrl || `https://${event.headers.host}${event.path}`);
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
        const headers = {};

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
                    headers[header] = event.headers[header];
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

        // Fetch the target URL and properly handle its response
        const response = await fetch(targetUrlString, fetchOptions);

        const json = await response.json();

        console.log('[RESPONSE]', json);
        console.log('[RESPONSE STATUS]', response.status);

        // Return in the format expected by Netlify Functions
        return {
            statusCode: response.status,
            body: JSON.stringify(json),
            headers: {
                'Content-Type': 'application/json',
            }
        };
    } catch (error) {
        console.error("Error proxying request:", error);
        return createErrorResponse("Error proxying request to API", 500);
    }
};

// Helper function to create error responses (updated for Netlify Functions format)
function createErrorResponse(message, statusCode) {
    return {
        statusCode,
        body: JSON.stringify({ error: message }),
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
        }
    };
}

// The path configuration is handled differently in netlify.toml for traditional functions
