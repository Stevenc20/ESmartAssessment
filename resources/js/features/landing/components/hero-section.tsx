import { Link } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { BookOpen, Sparkles, ArrowRight, ChevronDown } from 'lucide-react';
import { login } from '@/routes';

interface HeroSectionProps {
    onScrollDown?: () => void;
}

function CountUp({ target, suffix = '' }: { target: number; suffix?: string }) {
    const [count, setCount] = useState(0);
    const elRef = useRef<HTMLDivElement>(null);
    const startedRef = useRef(false);

    useEffect(() => {
        const el = elRef.current;
        if (!el) return;

        const parent = el.closest('[data-reveal]') as HTMLElement | null;
        if (!parent) return;

        const observer = new MutationObserver(() => {
            if (parent.classList.contains('lp-revealed')) {
                if (!startedRef.current) {
                    startedRef.current = true;
                    setCount(0);
                    const duration = 1200;
                    const start = performance.now();

                    const animate = (now: number) => {
                        const elapsed = now - start;
                        const progress = Math.min(elapsed / duration, 1);
                        const eased = 1 - Math.pow(1 - progress, 3);
                        setCount(Math.round(eased * target));
                        if (progress < 1) requestAnimationFrame(animate);
                    };

                    requestAnimationFrame(animate);
                }
            } else {
                startedRef.current = false;
                setCount(0);
            }
        });

        observer.observe(parent, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, [target]);

    return <div ref={elRef}>{count}{suffix}</div>;
}

export default function HeroSection({ onScrollDown }: HeroSectionProps) {
    return (
        <section className="lp-hero">
            {/* Animated background blobs */}
            <div className="lp-hero-blob lp-hero-blob-1" />
            <div className="lp-hero-blob lp-hero-blob-2" />
            <div className="lp-hero-blob lp-hero-blob-3" />

            {/* Dot grid */}
            <div className="lp-hero-grid" />

            {/* Content */}
            <div className="lp-hero-content">
                {/* Badge */}
                <div className="lp-hero-badge">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Intelligent Learning Platform v1.0</span>
                </div>

                {/* Headline */}
                <h1 className="lp-hero-h1">
                    <span className="lp-hero-h1-plain">Belajar Lebih</span>
                    <span className="lp-hero-h1-gradient"> Cerdas.</span>
                    <br />
                    <span className="lp-hero-h1-plain">Menilai Lebih</span>
                    <span className="lp-hero-h1-accent"> Baik.</span>
                    <br />
                    <span className="lp-hero-h1-plain">Tumbuh</span>
                    <span className="lp-hero-h1-gradient"> Bersama.</span>
                </h1>

                {/* Tagline */}
                <p className="lp-hero-desc">
                    Platform pembelajaran dan penilaian terintegrasi — membantu guru memonitor
                    perkembangan siswa secara <strong>objektif</strong>,{' '}
                    <strong>transparan</strong>, dan berbasis <strong>data</strong>.
                </p>

                {/* CTA buttons */}
                <div className="lp-hero-actions">
                    <a href="/auth/google">
                        <button className="lp-btn-hero-primary">
                            <BookOpen className="h-4 w-4" />
                            Mulai Sekarang
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    </a>
                    <Link href={login()}>
                        <button className="lp-btn-hero-outline">
                            Lihat Demo
                        </button>
                    </Link>
                </div>

                {/* Stats row */}
                <div className="lp-hero-stats" data-reveal data-reveal-delay="200">
                    <div className="lp-hero-stat">
                        <div className="lp-hero-stat-number lp-hero-stat-blue">
                            <CountUp target={7} suffix="+" />
                        </div>
                        <div className="lp-hero-stat-label">Fitur Unggulan</div>
                    </div>
                    <div className="lp-hero-stat-divider" />
                    <div className="lp-hero-stat">
                        <div className="lp-hero-stat-number lp-hero-stat-pink">
                            <CountUp target={4} />
                        </div>
                        <div className="lp-hero-stat-label">Peran Pengguna</div>
                    </div>
                    <div className="lp-hero-stat-divider" />
                    <div className="lp-hero-stat">
                        <div className="lp-hero-stat-number lp-hero-stat-blue">
                            <CountUp target={100} suffix="%" />
                        </div>
                        <div className="lp-hero-stat-label">Data Driven</div>
                    </div>
                </div>

                {/* Scroll hint */}
                <button
                    type="button"
                    className="lp-hero-scroll-hint"
                    onClick={onScrollDown}
                    aria-label="Scroll to features"
                >
                    <ChevronDown className="h-5 w-5" />
                </button>
            </div>
        </section>
    );
}
