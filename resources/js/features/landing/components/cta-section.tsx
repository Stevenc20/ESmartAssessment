import { Link } from '@inertiajs/react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { login } from '@/routes';

export default function CtaSection() {
    return (
        <section className="lp-cta">
            {/* Decorative blobs */}
            <div className="lp-cta-blob lp-cta-blob-1" />
            <div className="lp-cta-blob lp-cta-blob-2" />
            <div className="lp-cta-blob lp-cta-blob-3" />

            {/* Dot grid */}
            <div className="lp-cta-grid" />

            <div className="lp-cta-content" data-reveal>
                {/* Badge */}
                <div className="lp-cta-badge">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Mulai perjalanan belajarmu</span>
                </div>

                <h2 className="lp-cta-h2">
                    Siap Memulai{' '}
                    <span className="lp-cta-h2-accent">Perjalanan</span>
                    <br />
                    Belajarmu?
                </h2>

                <p className="lp-cta-desc">
                    Bergabunglah dengan ribuan guru dan siswa yang sudah
                    merasakan pengalaman belajar yang lebih baik, lebih
                    menyenangkan, dan lebih terukur.
                </p>

                <div className="lp-cta-actions">
                    <a href="/auth/google">
                        <button className="lp-btn-cta-primary">
                            Daftar Gratis Sekarang
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    </a>
                    <Link href={login()}>
                        <button className="lp-btn-cta-outline">
                            Sudah punya akun? Masuk
                        </button>
                    </Link>
                </div>

                {/* Trust badges */}
                <div className="lp-cta-trust">
                    <span className="lp-cta-trust-item">
                        ✓ Gratis untuk memulai
                    </span>
                    <span className="lp-cta-trust-sep">·</span>
                    <span className="lp-cta-trust-item">
                        ✓ Tanpa kartu kredit
                    </span>
                    <span className="lp-cta-trust-sep">·</span>
                    <span className="lp-cta-trust-item">
                        ✓ Setup dalam 5 menit
                    </span>
                </div>
            </div>
        </section>
    );
}
