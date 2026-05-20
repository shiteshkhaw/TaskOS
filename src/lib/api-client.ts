/**
 * API Client with authentication support
 */

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface ApiOptions {
    method?: HttpMethod;
    body?: unknown;
    headers?: Record<string, string>;
    requireAuth?: boolean;
}

interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    status: number;
}

const TOKEN_KEY = 'taskguru_token';

function getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
}

export async function apiClient<T = unknown>(
    endpoint: string,
    options: ApiOptions = {}
): Promise<ApiResponse<T>> {
    const {
        method = 'GET',
        body,
        headers = {},
        requireAuth = true,
    } = options;

    const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    const requestHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        ...headers,
    };

    // Add auth token if required
    if (requireAuth) {
        const token = getToken();
        if (token) {
            requestHeaders['Authorization'] = `Bearer ${token}`;
        }
    }

    try {
        const response = await fetch(url, {
            method,
            headers: requestHeaders,
            body: body ? JSON.stringify(body) : undefined,
        });

        const contentType = response.headers.get('content-type');
        let data: any = {};
        
        if (contentType && contentType.includes('application/json')) {
            try {
                data = await response.json();
            } catch (e) {
                console.error('Error parsing JSON:', e);
            }
        } else {
            const text = await response.text();
            data = { message: text || `Request failed with status ${response.status}` };
        }

        if (!response.ok) {
            return {
                success: false,
                error: data.error || data.message || `Request failed with status ${response.status}`,
                status: response.status,
            };
        }

        return {
            success: true,
            data: data.data || data,
            status: response.status,
        };
    } catch (error) {
        console.error('API request failed:', error);
        return {
            success: false,
            error: 'Network error. Please check your connection.',
            status: 0,
        };
    }
}

// Convenience methods
export const api = {
    get: <T>(endpoint: string, options?: Omit<ApiOptions, 'method'>) =>
        apiClient<T>(endpoint, { ...options, method: 'GET' }),

    post: <T>(endpoint: string, body?: unknown, options?: Omit<ApiOptions, 'method' | 'body'>) =>
        apiClient<T>(endpoint, { ...options, method: 'POST', body }),

    put: <T>(endpoint: string, body?: unknown, options?: Omit<ApiOptions, 'method' | 'body'>) =>
        apiClient<T>(endpoint, { ...options, method: 'PUT', body }),

    patch: <T>(endpoint: string, body?: unknown, options?: Omit<ApiOptions, 'method' | 'body'>) =>
        apiClient<T>(endpoint, { ...options, method: 'PATCH', body }),

    delete: <T>(endpoint: string, options?: Omit<ApiOptions, 'method'>) =>
        apiClient<T>(endpoint, { ...options, method: 'DELETE' }),
};

export default api;
