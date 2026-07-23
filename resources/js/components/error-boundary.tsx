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
