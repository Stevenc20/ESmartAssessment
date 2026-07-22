import { Shield, Users, GraduationCap, User, CheckCircle } from 'lucide-react';

const roles = [
    {
        icon: Shield,
        title: 'Super Admin',
        description:
            'Akses penuh ke seluruh sistem, konfigurasi platform, dan manajemen pengguna.',
        accent: 'blue',
        perks: ['Konfigurasi sistem', 'Manajemen user', 'Laporan global'],
    },
    {
        icon: Users,
        title: 'Admin',
        description:
            'Mengelola pengguna, konten, dan pengaturan institusi dengan mudah.',
        accent: 'pink',
        perks: [
            'Manajemen konten',
            'Pengaturan institusi',
            'Monitoring aktifitas',
        ],
    },
    {
        icon: GraduationCap,
        title: 'Guru / Pembina',
        description:
            'Membuat materi, memberikan penilaian, dan memonitor perkembangan siswa.',
        accent: 'blue',
        perks: ['Buat materi & soal', 'Nilai & feedback', 'Pantau progress'],
    },
    {
        icon: User,
        title: 'Siswa',
        description:
            'Belajar, mengerjakan tantangan, membangun portfolio, dan lacak progress sendiri.',
        accent: 'pink',
        perks: ['Learning journey', 'Challenge & badge', 'Portfolio digital'],
    },
];

export default function TargetUsersSection() {
    return (
        <section className="lp-users">
            {/* Background decoration */}
            <div className="lp-users-bg" />

            <div className="lp-section-header" data-reveal>
                <div className="lp-section-badge lp-section-badge--pink">
                    Untuk siapa?
                </div>
                <h2 className="lp-section-h2">
                    Dirancang untuk{' '}
                    <span className="lp-section-h2-accent">Semua Peran</span>
                </h2>
                <p className="lp-section-desc">
                    Satu platform, empat peran — setiap pengguna mendapat
                    pengalaman yang disesuaikan dengan kebutuhan mereka.
                </p>
            </div>

            <div className="lp-users-grid">
                {roles.map((role, i) => (
                    <div
                        key={role.title}
                        className={`lp-user-card lp-user-card--${role.accent} lp-reveal`}
                        style={{ transitionDelay: `${i * 0.12}s` }}
                        data-reveal
                    >
                        {/* Icon */}
                        <div
                            className={`lp-user-icon lp-user-icon--${role.accent}`}
                        >
                            <role.icon className="h-7 w-7" />
                        </div>

                        <h3 className="lp-user-title">{role.title}</h3>
                        <p className="lp-user-desc">{role.description}</p>

                        {/* Perks */}
                        <ul className="lp-user-perks">
                            {role.perks.map((perk) => (
                                <li key={perk} className="lp-user-perk">
                                    <CheckCircle
                                        className={`h-3.5 w-3.5 lp-user-perk-icon--${role.accent}`}
                                    />
                                    <span>{perk}</span>
                                </li>
                            ))}
                        </ul>

                        {/* Corner accent */}
                        <div
                            className={`lp-user-corner lp-user-corner--${role.accent}`}
                        />
                    </div>
                ))}
            </div>
        </section>
    );
}
