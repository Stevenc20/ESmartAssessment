<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: #f8fafc;
            }

            html.dark {
                background-color: #f8fafc;
            }
        </style>

        <link rel="icon" href="/favicon.ico" sizes="any">
        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">

        <link rel="preconnect" href="https://fonts.bunny.net" crossorigin />
        <link rel="preload" href="https://fonts.bunny.net/css?family=instrument-sans:400,600&display=swap" as="style" crossorigin="anonymous" />

        @fonts

        {{-- Critical CSS inline --}}
        <style>
            *,:after,:before{--tw-border-style:solid;--tw-translate-x:0;--tw-translate-y:0;--tw-translate-z:0;--tw-rotate-x:initial;--tw-rotate-y:initial;--tw-rotate-z:initial;--tw-skew-x:initial;--tw-skew-y:initial;--tw-space-y-reverse:0;--tw-space-x-reverse:0;--tw-border-style:solid;--tw-leading:initial;--tw-font-weight:initial;--tw-shadow:0 0 #0000;--tw-shadow-color:initial;--tw-inset-shadow:0 0 #0000;--tw-inset-shadow-color:initial;--tw-ring-color:initial;--tw-ring-shadow:0 0 #0000;--tw-inset-ring-color:initial;--tw-inset-ring-shadow:0 0 #0000;--tw-ring-offset-color:#fff;--tw-ring-offset-shadow:0 0 #0000}
            *,::backdrop,::after,::before{box-sizing:border-box;border-width:0;border-style:solid;border-color:oklch(.922 0 0)}:host,html{line-height:1.5;-webkit-text-size-adjust:100%;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji;font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}
            :root{--background:#f8fafc;--foreground:#1a2236;--card:#ffffff;--card-foreground:#1a2236;--popover:#ffffff;--popover-foreground:#1a2236;--primary:#436391;--primary-foreground:#ffffff;--secondary:#f7cad0;--secondary-foreground:#436391;--muted:#f8fafc;--muted-foreground:#64748b;--accent:#F2AEBC;--accent-foreground:#2d3748;--destructive:#e53e3e;--destructive-foreground:#ffffff;--border:#e9edf3;--input:#f5f0f1;--ring:#436391;--chart-1:#436391;--chart-2:#F2AEBC;--chart-3:#6B8ABF;--chart-4:#10b981;--chart-5:#f59e0b;--radius:0.75rem;--sidebar:#fceef1;--sidebar-foreground:#2d3748;--sidebar-primary:#436391;--sidebar-primary-foreground:#ffffff;--sidebar-accent:rgba(67,99,145,0.18);--sidebar-accent-foreground:#436391;--sidebar-border:rgba(242,174,188,0.35);--sidebar-ring:#436391;--brand-pink:#F2AEBC;--brand-pink-light:#F2DCDB;--brand-blue:#436391;--brand-blue-light:#6B8ABF;--brand-surface:#F2DCDB}

            @if($page['component'] === 'welcome')
            .lp-root{font-family:system-ui,-apple-system,sans-serif}.lp-navbar{position:fixed;left:0;right:0;top:0;z-index:50;transition:all .3s ease;background:rgba(255,255,255,.85);-webkit-backdrop-filter:blur(20px);backdrop-filter:blur(20px);border-bottom:1px solid rgba(242,174,188,.2)}.lp-nav-inner{width:100%;padding:0 1.5rem;height:64px;display:flex;align-items:center;justify-content:space-between}.lp-nav-logo{display:flex;align-items:center;gap:.625rem;text-decoration:none}.lp-nav-logo-icon{width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#436391,#2d4f7a);display:flex;align-items:center;justify-content:center;font-size:.8rem;font-weight:700;color:#fff;box-shadow:0 4px 12px rgba(67,99,145,.3)}.lp-nav-logo-text{font-size:1rem;font-weight:700;color:#1b1b18}.lp-nav-links{display:none;gap:2rem}@media(min-width:1024px){.lp-nav-links{display:flex}}.lp-nav-link{font-size:.875rem;font-weight:500;color:#706f6c;text-decoration:none;transition:color .2s}.lp-nav-link:hover{color:#436391}.lp-nav-cta{display:none;gap:.75rem;align-items:center}@media(min-width:1024px){.lp-nav-cta{display:flex}}.lp-btn-primary{padding:.5rem 1.25rem;border-radius:10px;background:linear-gradient(135deg,#436391,#2d4f7a);color:#fff;font-size:.875rem;font-weight:600;border:none;cursor:pointer;transition:all .2s;box-shadow:0 4px 14px rgba(67,99,145,.3)}.lp-btn-ghost{padding:.5rem 1rem;border-radius:10px;background:0 0;color:#436391;font-size:.875rem;font-weight:600;border:none;cursor:pointer;transition:all .2s}.lp-btn-ghost:hover{background:rgba(67,99,145,.08)}
            .lp-hero{position:relative;min-height:100vh;display:flex;align-items:center;justify-content:center;overflow:hidden;background:linear-gradient(160deg,#fdf0f2 0%,#F2DCDB 30%,#dce7f5 65%,#c5d4ea 100%);padding-top:64px}.lp-hero-content{position:relative;z-index:10;max-width:800px;margin:0 auto;padding:4rem 1.5rem;text-align:center;display:flex;flex-direction:column;align-items:center;gap:1.5rem}.lp-hero-badge{display:inline-flex;align-items:center;gap:.5rem;padding:.4rem 1rem;border-radius:100px;background:rgba(255,255,255,.7);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);border:1px solid rgba(242,174,188,.5);color:#436391;font-size:.8125rem;font-weight:600;box-shadow:0 2px 12px rgba(67,99,145,.1)}
            .lp-hero-h1{font-size:clamp(2.5rem,6vw,4.5rem);font-weight:800;line-height:1.1;letter-spacing:-.03em;margin:0;font-family:system-ui,-apple-system,sans-serif}.lp-hero-h1-plain{color:#1b1b18}.lp-hero-h1-gradient{background:linear-gradient(135deg,#F2AEBC 0%,#e8899d 50%,#d4607a 100%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}.lp-hero-h1-accent{background:linear-gradient(135deg,#436391 0%,#2d4f7a 100%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}.lp-hero-desc{max-width:560px;font-size:1.0625rem;line-height:1.7;color:#706f6c;margin:0}.lp-hero-desc strong{color:#436391}.lp-hero-actions{display:flex;flex-wrap:wrap;gap:.875rem;justify-content:center}.lp-btn-hero-primary{display:inline-flex;align-items:center;gap:.5rem;padding:.875rem 2rem;border-radius:14px;background:linear-gradient(135deg,#436391,#2d4f7a);color:#fff;font-size:1rem;font-weight:700;border:none;cursor:pointer;box-shadow:0 8px 28px rgba(67,99,145,.35);transition:all .2s}.lp-btn-hero-outline{display:inline-flex;align-items:center;gap:.5rem;padding:.875rem 2rem;border-radius:14px;background:rgba(255,255,255,.8);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);color:#436391;font-size:1rem;font-weight:600;border:1.5px solid rgba(67,99,145,.3);cursor:pointer;transition:all .2s}
            @keyframes lp-fade-up{from{transform:translateY(20px)}to{transform:translateY(0)}}
            @elseif(str_starts_with($page['component'], 'auth/'))
            .auth-root{position:relative;height:100svh;display:flex;align-items:center;justify-content:center;overflow-x:hidden;overflow-y:auto;background:linear-gradient(135deg,#F2DCDB,#F2AEBC 40%,#c9d8ed 75%,#436391)}.auth-bg-layer{position:absolute;inset:0;background:radial-gradient(ellipse 80% 60% at 20% 20%,rgba(242,174,188,.6),transparent 60%),radial-gradient(ellipse 60% 80% at 80% 80%,rgba(67,99,145,.35),transparent 60%),radial-gradient(ellipse 50% 50% at 50% 50%,rgba(242,220,219,.4),transparent 70%);pointer-events:none}.auth-content-wrapper{position:relative;z-index:10;width:100%;max-width:420px;padding:1.5rem;display:flex;flex-direction:column;align-items:center;gap:1.5rem}.auth-logo-link{display:flex;flex-direction:column;align-items:center;gap:.625rem;text-decoration:none}.auth-logo-ring{width:64px;height:64px;border-radius:18px;background:linear-gradient(135deg,#F2AEBC,#F2DCDB 50%,#c9d8ed);display:flex;align-items:center;justify-content:center;padding:4px;box-shadow:0 8px 32px rgba(67,99,145,.25),0 2px 8px rgba(242,174,188,.4)}.auth-logo-ring>svg{border-radius:12px;background:#fff;width:100%;height:100%;padding:8px}.auth-brand-name{font-size:.875rem;font-weight:600;color:#436391;letter-spacing:.03em;opacity:.85}.auth-glass-card{position:relative;width:100%;background:rgba(255,255,255,.85);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);border-radius:24px;border:1px solid rgba(242,174,188,.45);box-shadow:0 20px 60px rgba(67,99,145,.12),0 4px 16px rgba(242,174,188,.15),inset 0 1px 0 rgba(255,255,255,.9);overflow:hidden}.auth-card-header{padding:2rem 2rem 0;text-align:center}.auth-title{font-family:system-ui,-apple-system,sans-serif;font-size:1.375rem;font-weight:700;color:#2d3748;letter-spacing:-.02em;margin:0 0 .375rem;line-height:1.3}.auth-description{font-family:system-ui,-apple-system,sans-serif;font-size:.8125rem;color:#718096;margin:0;line-height:1.5}.auth-card-body{padding:1.75rem 2rem 2rem}.auth-footer-text{font-size:.75rem;color:rgba(67,99,145,.7);text-align:center;margin:0}
            @endif
            @media(max-width:640px){.auth-glass-card{-webkit-backdrop-filter:none;backdrop-filter:none}.auth-bg-layer{display:none}.auth-root{background:linear-gradient(135deg,#F2DCDB 0%,#c9d8ed 100%)}}
        </style>

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        <x-inertia::head>
            <title>{{ config('app.name', 'Laravel') }}</title>
        </x-inertia::head>
    </head>
    <body class="font-sans antialiased">
        <x-inertia::app />
    </body>
</html>
