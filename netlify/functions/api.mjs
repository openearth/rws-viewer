const { instances } = require("../../config/dato/instances");

// Change to exports.handler format
exports.handler = async (event, context) => {
    try {
        // DEBUG: Log the entire event structure
        console.log('[DEBUG] Full event object:', JSON.stringify({
            path: event.path,
            rawPath: event.rawPath,
            rawUrl: event.rawUrl,
            pathParameters: event.pathParameters,
            queryStringParameters: event.queryStringParameters,
            httpMethod: event.httpMethod,
            headers: event.headers ? Object.keys(event.headers) : null
        }, null, 2));

        // Find the current instance
        const currentInstance = instances.find(
            (instance) => instance.name === process.env.DATO_INSTANCE_CURRENT
        );

        if (!currentInstance) {
            return createErrorResponse("Current instance not found", 500);
        }

        const apiUrl = `${ currentInstance.apiUrl }/api`;

        if (!apiUrl) {
            return createErrorResponse("API_URL is not configured", 500);
        }

        // Extract path - prioritize pathParameters.splat for redirects
        let path = '';
        
        // First, check if we have pathParameters.splat (from redirect)
        if (event.pathParameters && event.pathParameters.splat) {
            path = '/' + event.pathParameters.splat;
            console.log('[DEBUG] Using pathParameters.splat:', path);
        } else {
            // Try to extract from rawUrl or path
            let eventPath = '';
            
            if (event.rawUrl) {
                try {
                    const eventUrl = new URL(event.rawUrl);
                    eventPath = eventUrl.pathname;
                } catch (e) {
                    console.log('[DEBUG] Failed to parse rawUrl:', e.message);
                }
            }
            
            if (!eventPath && event.rawPath) {
                eventPath = event.rawPath;
            }
            
            if (!eventPath && event.path) {
                eventPath = event.path;
            }
            
            console.log('[DEBUG] Extracted eventPath:', eventPath);
            
            // Remove the function path prefix
            if (eventPath) {
                path = eventPath.replace('/.netlify/functions/api', '');
                
                // If still empty, try extracting from /api/ pattern
                if (!path || path === '/') {
                    const apiMatch = eventPath.match(/\/api\/(.+)$/);
                    if (apiMatch) {
                        path = '/' + apiMatch[1];
                    }
                }
            }
            
            // Fallback: if still empty, default to root
            if (!path || path === '/') {
                console.log('[DEBUG] Path is empty after extraction, defaulting to /');
                path = '/';
            }
        }

        console.log('[DEBUG] Final extracted path:', path);

        // Create the target URL with the path
        const targetUrl = new URL(path, apiUrl);

        // Copy all query parameters
        if (event.rawUrl) {
            try {
                const eventUrl = new URL(event.rawUrl);
                for (const [ key, value ] of eventUrl.searchParams.entries()) {
                    targetUrl.searchParams.set(key, value);
                }
            } catch (e) {
                console.log('[DEBUG] Failed to parse rawUrl for query params:', e.message);
            }
        }

        // Also check event.queryStringParameters as a fallback
        const params = event.queryStringParameters || {};
        Object.keys(params).forEach(key => {
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
                // Netlify lowercases header names, so check both cases
                const headerKey = Object.keys(event.headers).find(
                    h => h.toLowerCase() === header.toLowerCase()
                );
                if (headerKey && event.headers[headerKey]) {
                    headers[header] = event.headers[headerKey];
                }
            }
        }

        // Prepare fetch options
        const fetchOptions = {
            method: event.httpMethod || 'GET',
            headers
        };

        // Forward request body for POST, PUT, PATCH methods
        if ([ 'POST', 'PUT', 'PATCH' ].includes(fetchOptions.method) && event.body) {
            fetchOptions.body = event.body;
        }

        console.log('[DEBUG] Fetch options:', JSON.stringify({
            method: fetchOptions.method,
            headers: Object.keys(fetchOptions.headers),
            hasBody: !!fetchOptions.body
        }, null, 2));
        console.log('[TARGET URL]', targetUrlString);

        // Fetch the target URL and properly handle its response
        const response = await fetch(targetUrlString, fetchOptions);
        
        // Check if response is ok before trying to parse JSON
        if (!response.ok) {
            console.log('[DEBUG] Response not OK:', response.status, response.statusText);
            const errorText = await response.text();
            console.log('[DEBUG] Error response body:', errorText);
        }

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
        // Enhanced error logging
        console.error("Error proxying request:", error);
        console.error("Error stack:", error.stack);
        console.error("Error details:", JSON.stringify({
            message: error.message,
            name: error.name,
            cause: error.cause
        }, null, 2));
        
        return createErrorResponse(
            `Error proxying request to API: ${ error.message }`,
            500
        );
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
