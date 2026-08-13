export type ApiError = {
    error?: string;
    message?: string;
};

export function getCsrfToken(): string {
    const meta = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null;

    if (meta?.content) {
return meta.content;
}

    const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);

    return match ? decodeURIComponent(match[1]) : '';
}

export async function apiFetch<T>(url: string, method: 'GET' | 'POST' | 'DELETE' = 'POST', body?: object): Promise<T> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-CSRF-TOKEN': getCsrfToken(),
    };

    const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        credentials: 'same-origin',
    });

    const text = await response.text();
    let data: T & ApiError;

    try {
        data = JSON.parse(text);
    } catch {
        throw new Error(`Server error (${response.status})`);
    }

    if (!response.ok || data.error) {
        throw new Error(data.error || data.message || `Server error (${response.status})`);
    }

    return data;
}
