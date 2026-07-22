import AppLogoIcon from '@/components/layout/app-logo-icon';

export default function AppLogo() {
    return (
        <>
            {/* Gradient icon box — normal mode: 32px with shadow; collapsed: fills button (p-0!) */}
            <div
                className="flex aspect-square size-8 items-center justify-center rounded-lg text-white shadow-sm group-data-[collapsible=icon]:rounded-none group-data-[collapsible=icon]:shadow-none"
                style={{
                    background:
                        'linear-gradient(135deg, #F2AEBC 0%, #436391 100%)',
                }}
            >
                <AppLogoIcon className="size-5" />
            </div>
            {/* Text — hidden in collapsed sidebar */}
            <div className="ml-1.5 grid flex-1 text-left group-data-[collapsible=icon]:hidden">
                <span
                    className="truncate text-sm leading-tight font-bold"
                    style={{
                        background:
                            'linear-gradient(135deg, #436391 0%, #e8889a 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                    }}
                >
                    ESmartAssessment
                </span>
                <span className="text-[9px] leading-tight font-medium tracking-wide text-muted-foreground/70">
                    Learn · Create · Grow
                </span>
            </div>
        </>
    );
}
