import { Link } from '@inertiajs/react';
import { BookOpen } from 'lucide-react';

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

export default function Footer() {
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
                <p className="lp-footer-made">Created by Steven Christian</p>
            </div>
        </footer>
    );
}
