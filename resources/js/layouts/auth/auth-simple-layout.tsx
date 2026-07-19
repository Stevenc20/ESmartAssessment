import { Link, usePage } from '@inertiajs/react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import AppLogoIcon from '@/components/layout/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({ children, title, description }: AuthLayoutProps) {
    const { registration_open } = usePage().props as { registration_open?: boolean };

    return (
        <div className="auth-root">
            {/* Animated Background */}
            <div className="auth-bg-layer" />

            {/* Floating Blobs */}
            <div className="auth-blob auth-blob-1" />
            <div className="auth-blob auth-blob-2" />
            <div className="auth-blob auth-blob-3" />

            {/* Dot Grid Overlay */}
            <div className="auth-dot-grid" />

            {/* Back to home — top left corner */}
            <Link href={home()} className="auth-back-link">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                Back to home
            </Link>

            {/* Content */}
            <div className="auth-content-wrapper">
                {registration_open === false && (
                    <Alert
                        variant="default"
                        className="mb-6 border border-red-300 bg-red-50 text-red-900"
                    >
                        <AlertCircle className="mx-auto size-5 text-red-600" />
                        <AlertTitle className="text-center font-semibold text-red-900">
                            Pendaftaran Ditutup
                        </AlertTitle>
                        <AlertDescription className="text-center text-red-800">
                            Maaf, pendaftaran akun baru sedang tidak dibuka. Silakan hubungi administrator.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Logo */}
                <Link href={home()} className="auth-logo-link">
                    <div className="auth-logo-ring">
                        <AppLogoIcon className="size-9 fill-current text-[var(--brand-blue)]" />
                    </div>
                    <span className="auth-brand-name">ESmartAssessment</span>
                </Link>

                {/* Glass Card */}
                <div className="auth-glass-card">
                    {/* Card Shimmer Border */}
                    <div className="auth-card-shimmer" />

                    {/* Header */}
                    <div className="auth-card-header">
                        <h1 className="auth-title">{title}</h1>
                        <p className="auth-description">{description}</p>
                    </div>

                    {/* Body */}
                    <div className="auth-card-body">{children}</div>
                </div>

                {/* Footer */}
                <p className="auth-footer-text">
                    &copy; {new Date().getFullYear()} ESmartAssessment &mdash; Created by Steven Christian
                </p>
            </div>
        </div>
    );
}
