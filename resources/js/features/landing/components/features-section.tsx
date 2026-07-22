import {
    BookOpen,
    BarChart3,
    FolderGit2,
    Trophy,
    Gamepad2,
    LineChart,
    Award,
} from 'lucide-react';

const features = [
    {
        icon: BookOpen,
        title: 'Learning Journey',
        description:
            'Peta perjalanan belajar yang personal dan terstruktur untuk setiap siswa.',
        accent: 'blue',
    },
    {
        icon: BarChart3,
        title: 'Smart Assessment',
        description:
            'Penilaian cerdas berbasis data untuk evaluasi yang objektif dan transparan.',
        accent: 'pink',
    },
    {
        icon: FolderGit2,
        title: 'Portfolio Digital',
        description:
            'Kumpulan karya dan pencapaian siswa dalam satu platform digital.',
        accent: 'blue',
    },
    {
        icon: Trophy,
        title: 'Challenge Based',
        description:
            'Pembelajaran berbasis tantangan yang menstimulasi kreativitas siswa.',
        accent: 'pink',
    },
    {
        icon: Gamepad2,
        title: 'Gamification',
        description:
            'Sistem poin, badge, dan leaderboard untuk memotivasi belajar.',
        accent: 'blue',
    },
    {
        icon: LineChart,
        title: 'Learning Analytics',
        description:
            'Dashboard analitik untuk memantau progress dan performa siswa.',
        accent: 'pink',
    },
    {
        icon: Award,
        title: 'Auto Certification',
        description:
            'Sertifikasi otomatis untuk pencapaian dan kompetensi siswa.',
        accent: 'blue',
    },
];

export default function FeaturesSection() {
    return (
        <section className="lp-features">
            {/* Section header */}
            <div className="lp-section-header" data-reveal>
                <div className="lp-section-badge lp-section-badge--blue">
                    Apa yang kami tawarkan
                </div>
                <h2 className="lp-section-h2">
                    Ekosistem Belajar{' '}
                    <span className="lp-section-h2-accent">
                        Modern & Lengkap
                    </span>
                </h2>
                <p className="lp-section-desc">
                    Semua yang dibutuhkan untuk pengalaman pembelajaran yang
                    luar biasa — dalam satu platform terintegrasi.
                </p>
            </div>

            {/* Feature cards grid */}
            <div className="lp-features-grid">
                {features.map((feature, i) => (
                    <div
                        key={feature.title}
                        className={`lp-feature-card lp-feature-card--${feature.accent} lp-reveal`}
                        style={{ transitionDelay: `${i * 0.08}s` }}
                        data-reveal
                    >
                        <div
                            className={`lp-feature-icon lp-feature-icon--${feature.accent}`}
                        >
                            <feature.icon className="h-5 w-5" />
                        </div>
                        <h3 className="lp-feature-title">{feature.title}</h3>
                        <p className="lp-feature-desc">{feature.description}</p>
                        <div
                            className={`lp-feature-corner lp-feature-corner--${feature.accent}`}
                        />
                    </div>
                ))}
            </div>
        </section>
    );
}
