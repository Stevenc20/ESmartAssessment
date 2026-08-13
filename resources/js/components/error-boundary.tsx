import React from 'react';

export class ErrorBoundary extends React.Component<
    { children: React.ReactNode; fallback?: React.ReactNode },
    { hasError: boolean; error?: Error }
> {
    state = { hasError: false, error: undefined as Error | undefined };

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    render() {
        if (this.state.hasError) {
            const message = this.state.error?.message;
            const stack = this.state.error?.stack;

            return (
                this.props.fallback || (
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: '100svh',
                            gap: '1rem',
                            padding: '2rem',
                            textAlign: 'center',
                            fontFamily: 'system-ui, sans-serif',
                        }}
                    >
                        <p style={{ fontSize: '1rem', color: '#4a5568' }}>
                            Terjadi kesalahan. Silakan muat ulang halaman.
                        </p>
                        {message && (
                            <p
                                style={{
                                    maxWidth: '640px',
                                    fontSize: '0.875rem',
                                    color: '#c53030',
                                    fontFamily:
                                        'ui-monospace, SFMono-Regular, Menlo, monospace',
                                    wordBreak: 'break-word',
                                    whiteSpace: 'pre-wrap',
                                }}
                            >
                                {message}
                            </p>
                        )}
                        {stack && (
                            <details
                                style={{ maxWidth: '640px', width: '100%' }}
                            >
                                <summary
                                    style={{
                                        cursor: 'pointer',
                                        fontSize: '0.75rem',
                                        color: '#718096',
                                    }}
                                >
                                    Lihat detail teknis
                                </summary>
                                <pre
                                    style={{
                                        overflowX: 'auto',
                                        marginTop: '0.5rem',
                                        background: '#f7fafc',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        padding: '1rem',
                                        fontSize: '0.7rem',
                                        lineHeight: 1.5,
                                        color: '#2d3748',
                                        textAlign: 'left',
                                        maxHeight: '50vh',
                                        overflowY: 'auto',
                                    }}
                                >
                                    {stack}
                                </pre>
                            </details>
                        )}
                        <button
                            onClick={() => window.location.reload()}
                            style={{
                                padding: '0.5rem 1.5rem',
                                borderRadius: '8px',
                                background: '#436391',
                                color: 'white',
                                border: 'none',
                                fontWeight: 600,
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                            }}
                        >
                            Muat Ulang
                        </button>
                    </div>
                )
            );
        }
        return this.props.children;
    }
}
