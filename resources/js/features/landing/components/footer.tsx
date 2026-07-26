import { Link, router } from '@inertiajs/react';
import { BookOpen } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

declare global {
    interface Window {
        grecaptcha: {
            ready: (cb: () => void) => void;
            execute: (siteKey: string, options: { action: string }) => Promise<string>;
        };
    }
}

const footerLinks = {
    Produk: [
        { name: 'Fitur Unggulan', href: '#features' },
        { name: 'Demo Platform', href: '#' },
        { name: 'Harga', href: '#' },
        { name: 'Roadmap', href: '#' },
    ],
    Perusahaan: [
        { name: 'Tentang Kami', href: '#' },
        { name: 'Blog', href: '#' },
        { name: 'Karir', href: '#' },
        { name: 'Mitra', href: '#' },
    ],
    Dukungan: [
        { name: 'Pusat Bantuan', href: '#' },
        { name: 'Hubungi Kami', href: '#' },
        { name: 'Dokumentasi', href: '#' },
        { name: 'Status', href: '#' },
    ],
};

interface Props {
    recaptcha_site_key?: string;
}

export default function Footer({ recaptcha_site_key }: Props) {
    const [showModal, setShowModal] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [recaptchaReady, setRecaptchaReady] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (!showModal || !recaptcha_site_key) return;

        if (window.grecaptcha) {
            window.grecaptcha.ready(() => setRecaptchaReady(true));
            return;
        }

        const script = document.createElement('script');
        script.src = `https://www.google.com/recaptcha/api.js?render=${recaptcha_site_key}`;
        script.async = true;
        script.onload = () => {
            window.grecaptcha.ready(() => setRecaptchaReady(true));
        };
        document.head.appendChild(script);

        return () => {
            document.head.removeChild(script);
        };
    }, [showModal, recaptcha_site_key]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!recaptcha_site_key) {
            submitForm('');
            return;
        }

        if (!recaptchaReady) return;

        try {
            setProcessing(true);
            const token = await window.grecaptcha.execute(recaptcha_site_key, { action: 'login' });
            submitForm(token);
        } catch {
            setProcessing(false);
            setErrors({ email: 'Verifikasi keamanan gagal. Silakan coba lagi.' });
        }
    };

    const submitForm = (token: string) => {
        const form = formRef.current;
        if (!form) return;

        const formData = new FormData(form);
        formData.append('g-recaptcha-response', token);

        router.post('/admin/login', Object.fromEntries(formData), {
            onFinish: () => setProcessing(false),
            onError: (errs) => setErrors(errs),
        });
    };

    return (
        <footer className="lp-footer">
            {/* Top border gradient */}
            <div className="lp-footer-border" />

            <div className="lp-footer-inner">
                {/* Brand column */}
                <div className="lp-footer-brand">
                    <Link href="/" className="lp-footer-logo">
                        <div className="lp-footer-logo-icon">ES</div>
                        <span className="lp-footer-logo-text">
                            ESmartAssessment
                        </span>
                    </Link>
                    <p className="lp-footer-tagline">
                        Learn. Create. Grow. — Platform pembelajaran dan
                        penilaian terintegrasi untuk ekosistem pendidikan
                        modern.
                    </p>
                    <div className="lp-footer-socials">
                        <div className="lp-footer-social-icon">
                            <BookOpen className="h-4 w-4" />
                        </div>
                    </div>
                </div>

                {/* Link columns */}
                {Object.entries(footerLinks).map(([category, links]) => (
                    <div key={category} className="lp-footer-col">
                        <h3 className="lp-footer-col-title">{category}</h3>
                        <ul className="lp-footer-col-links">
                            {links.map((link) => (
                                <li key={link.name}>
                                    <a
                                        href={link.href}
                                        className="lp-footer-link"
                                    >
                                        {link.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            {/* Bottom bar */}
            <div className="lp-footer-bottom">
                <p className="lp-footer-copy">
                    &copy; {new Date().getFullYear()} ESmartAssessment. All
                    rights reserved.
                </p>
                <div className="lp-footer-bottom-right">
                    <p className="lp-footer-made">Created by Steven Christian</p>
                    <button type="button" className="lp-footer-dot" onClick={() => { setShowModal(true); setErrors({}); }}>
                        ●
                    </button>
                </div>
            </div>

            {/* Admin Login Modal */}
            {showModal && (
                <div className="lp-admin-overlay" onClick={() => setShowModal(false)}>
                    <div className="lp-admin-modal" onClick={(e) => e.stopPropagation()}>
                        <button type="button" className="lp-admin-close" onClick={() => setShowModal(false)}>
                            &times;
                        </button>
                        <h3 className="lp-admin-title">Masuk</h3>
                        <p className="lp-admin-desc">Masukkan kredensial Anda</p>

                        <form ref={formRef} onSubmit={handleSubmit} className="lp-admin-form">
                            <div className="lp-admin-field">
                                <label className="lp-admin-label" htmlFor="lp-email">Email</label>
                                <input
                                    id="lp-email"
                                    type="email"
                                    name="email"
                                    autoFocus
                                    placeholder="email@esmart.test"
                                    className="lp-admin-input"
                                />
                            </div>

                            <div className="lp-admin-field">
                                <label className="lp-admin-label" htmlFor="lp-password">Password</label>
                                <input
                                    id="lp-password"
                                    type="password"
                                    name="password"
                                    placeholder="Password"
                                    className="lp-admin-input"
                                />
                            </div>

                            {errors.email && (
                                <p className="lp-admin-error">{errors.email}</p>
                            )}

                            <button
                                type="submit"
                                className="lp-admin-btn"
                                disabled={processing || (recaptcha_site_key && !recaptchaReady)}
                            >
                                {processing ? 'Memproses...' : 'Masuk'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </footer>
    );
}
