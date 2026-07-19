import { Head, Link, usePage } from '@inertiajs/react';
import { Menu, X, Sparkles } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import HeroSection from '@/features/landing/components/hero-section';
import FeaturesSection from '@/features/landing/components/features-section';
import TargetUsersSection from '@/features/landing/components/target-users-section';
import CoreExperienceSection from '@/features/landing/components/core-experience-section';
import CtaSection from '@/features/landing/components/cta-section';
import Footer from '@/features/landing/components/footer';
import { dashboard, login } from '@/routes';

export default function Welcome() {
    const { auth } = usePage().props;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setTimeout(() => {
            document.querySelectorAll('.lp-hero-blob').forEach((el) => el.classList.add('lp-anim-running'));
        }, 3000);
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('lp-revealed');
                    } else {
                        entry.target.classList.remove('lp-revealed');
                    }
                });
            },
            { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
        );

        const targets = document.querySelectorAll('[data-reveal]');
        targets.forEach((el) => {
            if (!el.classList.contains('lp-reveal') &&
                !el.classList.contains('lp-reveal-left') &&
                !el.classList.contains('lp-reveal-right') &&
                !el.classList.contains('lp-reveal-scale')) {
                el.classList.add('lp-reveal');
            }
            observer.observe(el);
        });

        return () => observer.disconnect();
    }, []);

    const scrollToFeatures = useCallback(() => {
        document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    return (
        <>
            <Head title="ESmartAssessment — Learn. Create. Grow." />

            <div className="lp-root">
                {/* ── Navbar ── */}
                <header className={`lp-navbar${scrolled ? ' lp-navbar--scrolled' : ''}`}>
                    <nav className="lp-nav-inner">
                        {/* Logo */}
                        <Link href="/" className="lp-nav-logo">
                            <div className="lp-nav-logo-icon">
                                <span>ES</span>
                            </div>
                            <span className="lp-nav-logo-text">ESmartAssessment</span>
                        </Link>

                        {/* Desktop nav links */}
                        <div className="lp-nav-links">
                            <a href="#features" className="lp-nav-link">Fitur</a>
                            <a href="#users" className="lp-nav-link">Pengguna</a>
                            <a href="#experience" className="lp-nav-link">Pengalaman</a>
                        </div>

                        {/* Desktop CTA */}
                        <div className="lp-nav-cta">
                            {auth.user ? (
                                <Link href={dashboard()}>
                                    <Button className="lp-btn-primary">Dashboard</Button>
                                </Link>
                            ) : (
                                <>
                                    <Link href={login()}>
                                        <button className="lp-btn-ghost">Masuk</button>
                                    </Link>
                                    <a href="/auth/google">
                                        <button className="lp-btn-primary">Daftar Gratis</button>
                                    </a>
                                </>
                            )}
                        </div>

                        {/* Mobile toggle */}
                        <button
                            type="button"
                            className="lp-mobile-toggle"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen
                                ? <X className="h-5 w-5" />
                                : <Menu className="h-5 w-5" />
                            }
                        </button>
                    </nav>

                    {/* Mobile Menu */}
                    {mobileMenuOpen && (
                        <div className="lp-mobile-menu">
                            <a href="#features" className="lp-mobile-link" onClick={() => setMobileMenuOpen(false)}>Fitur</a>
                            <a href="#users" className="lp-mobile-link" onClick={() => setMobileMenuOpen(false)}>Pengguna</a>
                            <a href="#experience" className="lp-mobile-link" onClick={() => setMobileMenuOpen(false)}>Pengalaman</a>
                            <div className="lp-mobile-cta">
                                {auth.user ? (
                                    <Link href={dashboard()} onClick={() => setMobileMenuOpen(false)}>
                                        <button className="lp-btn-primary w-full">Dashboard</button>
                                    </Link>
                                ) : (
                                    <>
                                        <Link href={login()} onClick={() => setMobileMenuOpen(false)}>
                                            <button className="lp-btn-outline w-full">Masuk</button>
                                        </Link>
                                        <a href="/auth/google" onClick={() => setMobileMenuOpen(false)}>
                                            <button className="lp-btn-primary w-full">Daftar Gratis</button>
                                        </a>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </header>

                {/* ── Main ── */}
                <main>
                    <HeroSection onScrollDown={scrollToFeatures} />
                    <div id="features"><FeaturesSection /></div>
                    <div id="users"><TargetUsersSection /></div>
                    <div id="experience"><CoreExperienceSection /></div>
                    <CtaSection />
                </main>

                <Footer />
            </div>
        </>
    );
}
