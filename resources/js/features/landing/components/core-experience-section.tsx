import {
    TrendingUp,
    Award,
    FolderGit2,
    BarChart3,
    Trophy,
    Target,
    Star,
} from 'lucide-react';

const experiences = [
    { icon: TrendingUp, label: 'Progress Belajar', accent: 'blue' },
    { icon: Award, label: 'Achievement', accent: 'pink' },
    { icon: FolderGit2, label: 'Portfolio', accent: 'blue' },
    { icon: BarChart3, label: 'Nilai & Rapor', accent: 'pink' },
    { icon: Trophy, label: 'Challenge', accent: 'blue' },
    { icon: Target, label: 'Target Berikutnya', accent: 'pink' },
];

export default function CoreExperienceSection() {
    return (
        <section className="lp-experience">
            <div className="lp-experience-inner">
                {/* Left: text */}
                <div className="lp-experience-text" data-reveal>
                    <div className="lp-section-badge lp-section-badge--blue">
                        Core Experience
                    </div>
                    <h2 className="lp-section-h2 text-left">
                        Pengalaman Belajar{' '}
                        <span className="lp-section-h2-accent">
                            yang Berbeda
                        </span>
                    </h2>
                    <p className="lp-section-desc text-left">
                        Ketika siswa membuka ESmartAssessment, mereka langsung
                        melihat hal yang <strong>memotivasi</strong> — bukan
                        sekadar tabel data.
                    </p>

                    <div className="lp-experience-grid">
                        {experiences.map((exp) => (
                            <div
                                key={exp.label}
                                className={`lp-experience-item lp-experience-item--${exp.accent}`}
                            >
                                <div
                                    className={`lp-experience-item-icon lp-experience-item-icon--${exp.accent}`}
                                >
                                    <exp.icon className="h-4 w-4" />
                                </div>
                                <span className="lp-experience-item-label">
                                    {exp.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: mock dashboard card */}
                <div className="lp-experience-card-wrap" data-reveal>
                    {/* Glow ring */}
                    <div className="lp-experience-glow" />

                    <div className="lp-experience-card">
                        {/* Dashboard header */}
                        <div className="lp-dashboard-header">
                            <div className="lp-dashboard-avatar" />
                            <div>
                                <div className="lp-dashboard-name" />
                                <div className="lp-dashboard-sub" />
                            </div>
                            <div className="lp-dashboard-badge">
                                <Star
                                    className="h-3 w-3"
                                    style={{ color: '#F2AEBC' }}
                                />
                                <span>Top 3</span>
                            </div>
                        </div>

                        {/* Progress bar */}
                        <div className="lp-dashboard-section">
                            <div className="lp-dashboard-row">
                                <span className="lp-dashboard-label">
                                    Progress Belajar
                                </span>
                                <span className="lp-dashboard-value">75%</span>
                            </div>
                            <div className="lp-progress-track">
                                <div
                                    className="lp-progress-bar"
                                    style={{ width: '75%' }}
                                />
                            </div>
                        </div>

                        {/* Stats row */}
                        <div className="lp-dashboard-stats">
                            <div className="lp-stat-pill lp-stat-pill--blue">
                                <div className="lp-stat-pill-num">12</div>
                                <div className="lp-stat-pill-lbl">Badge</div>
                            </div>
                            <div className="lp-stat-pill lp-stat-pill--pink">
                                <div className="lp-stat-pill-num">850</div>
                                <div className="lp-stat-pill-lbl">Poin</div>
                            </div>
                            <div className="lp-stat-pill lp-stat-pill--blue">
                                <div className="lp-stat-pill-num">3</div>
                                <div className="lp-stat-pill-lbl">
                                    Challenge
                                </div>
                            </div>
                        </div>

                        {/* Next target */}
                        <div className="lp-dashboard-target">
                            <div className="lp-dashboard-target-label">
                                🎯 Target Berikutnya
                            </div>
                            <div className="lp-dashboard-target-value">
                                Selesaikan Challenge #5
                            </div>
                        </div>

                        {/* Achievement row */}
                        <div className="lp-dashboard-achievements">
                            {['🏆', '⭐', '🎯', '🔥', '💡'].map((emoji, i) => (
                                <div
                                    key={i}
                                    className="lp-achievement-dot"
                                    title={`Achievement ${i + 1}`}
                                >
                                    {emoji}
                                </div>
                            ))}
                            <div className="lp-achievement-more">+8</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
