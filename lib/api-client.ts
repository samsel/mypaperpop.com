/**
 * API Client Utility
 * 
 * A reusable fetch wrapper that handles authentication errors automatically.
 * All API calls should use this client for consistent 401 handling and redirects.
 * 
 * Usage:
 * ```typescript
 * import { apiClient } from '@/lib/api-client';
 * 
 * const data = await apiClient.post('/api/endpoint', { key: 'value' });
 * ```
 */

interface ApiClientOptions extends Omit<RequestInit, 'body'> {
    body?: unknown;
}

class ApiClient {
    private async request<T>(
        url: string,
        options: ApiClientOptions = {}
    ): Promise<T> {
        const { body, ...rest } = options;

        // Prepare request options
        const config: RequestInit = {
            ...rest,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        };

        // Convert body to JSON if it's an object
        if (body !== undefined && body !== null && typeof body === 'object') {
            config.body = JSON.stringify(body);
        } else if (typeof body === 'string') {
            config.body = body;
        }

        try {
            const response = await fetch(url, config);

            // Handle 401 Unauthorized - redirect to sign-in
            if (response.status === 401) {
                if (typeof window !== 'undefined') {
                    window.location.href = '/#sign-in';
                }
                throw new Error('Unauthorized');
            }

            // Handle other non-OK responses
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`
                );
            }

            // Parse and return JSON response
            return await response.json();
        } catch (error) {
            // Re-throw the error for the caller to handle
            throw error;
        }
    }

    /**
     * Make a GET request
     */
    async get<T>(url: string, options?: ApiClientOptions): Promise<T> {
        return this.request<T>(url, { ...options, method: 'GET' });
    }

    /**
     * Make a POST request
     */
    async post<T>(url: string, body?: unknown, options?: ApiClientOptions): Promise<T> {
        return this.request<T>(url, { ...options, method: 'POST', body });
    }

    /**
     * Make a PATCH request
     */
    async patch<T>(url: string, body?: unknown, options?: ApiClientOptions): Promise<T> {
        return this.request<T>(url, { ...options, method: 'PATCH', body });
    }

    /**
     * Make a DELETE request
     */
    async delete<T>(url: string, options?: ApiClientOptions): Promise<T> {
        return this.request<T>(url, { ...options, method: 'DELETE' });
    }
}

// Export a singleton instance
export const apiClient = new ApiClient();
