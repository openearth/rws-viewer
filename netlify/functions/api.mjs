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
        } else {
            // Try to extract from the path - when redirected, event.path might be the full path
            // or event.rawPath might contain the original /api/feedback path
            let eventPath = '';
            
            // Check rawPath first (contains original request path before redirect)
            if (event.rawPath) {
                eventPath = event.rawPath;
                // Extract from /api/feedback pattern
                const apiMatch = eventPath.match(/^\/api\/(.+)$/);
                if (apiMatch) {
                    path = '/' + apiMatch[1];
                }
            }
            
            // If not found, try event.path (after redirect processing)
            if (!path && event.path) {
                eventPath = event.path;
                // Remove function base path
                path = eventPath.replace('/.netlify/functions/api', '');
                // If path is empty or just '/', try to extract from full path
                if (!path || path === '/') {
                    // Try matching the full path pattern
                    const fullPathMatch = eventPath.match(/\/\.netlify\/functions\/api\/(.+)$/);
                    if (fullPathMatch) {
                        path = '/' + fullPathMatch[1];
                    }
                }
            }
            
            // Last resort: try rawUrl
            if (!path && event.rawUrl) {
                try {
                    const eventUrl = new URL(event.rawUrl);
                    const urlPath = eventUrl.pathname;
                    // Try to extract /api/feedback from the URL
                    const apiMatch = urlPath.match(/\/api\/(.+)$/);
                    if (apiMatch) {
                        path = '/' + apiMatch[1];
                    } else {
                        // Or remove function path
                        path = urlPath.replace('/.netlify/functions/api', '');
                    }
                } catch (e) {
                    // Ignore URL parsing errors
                }
            }
            
            // Final fallback
            if (!path || path === '/') {
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
