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
            // Try to extract from rawUrl or path
            let eventPath = '';
            
            if (event.rawUrl) {
                try {
                    const eventUrl = new URL(event.rawUrl);
                    eventPath = eventUrl.pathname;
                } catch (e) {
                    // Ignore URL parsing errors
                }
            }
            
            if (!eventPath && event.rawPath) {
                eventPath = event.rawPath;
            }
            
            if (!eventPath && event.path) {
                eventPath = event.path;
            }
            
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
                path = '/';
            }
        }

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
                // Ignore URL parsing errors
            }
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
        if ([ 'POST', 'PUT', 'PATCH' ].includes(fetchOptions.method) && event.body) {
            fetchOptions.body = event.body;
        }

        // Fetch the target URL and properly handle its response
        const response = await fetch(targetUrlString, fetchOptions);
        
        // Get the response body as text first
        const responseText = await response.text();
        
        // Determine the content type
        const contentType = response.headers.get('content-type') || '';
        const isJson = contentType.includes('application/json');
        
        let responseBody;
        
        // Handle empty responses (like 204 No Content)
        if (!responseText || responseText.trim() === '') {
            responseBody = response.ok ? { success: true } : { error: 'Empty response from API' };
        } else if (isJson) {
            // Try to parse as JSON
            try {
                responseBody = JSON.parse(responseText);
            } catch (parseError) {
                responseBody = { 
                    error: 'Invalid JSON response from API',
                    rawResponse: responseText.substring(0, 200)
                };
            }
        } else {
            // Non-JSON response - return as text
            responseBody = {
                error: 'Non-JSON response from API',
                contentType: contentType,
                body: responseText.substring(0, 500)
            };
        }

        // Return in the format expected by Netlify Functions
        return {
            statusCode: response.status,
            body: JSON.stringify(responseBody),
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
