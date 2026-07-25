import { Form, Head, router } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import PasswordInput from '@/components/auth/password-input';
import InputError from '@/components/settings/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

declare global {
    interface Window {
        grecaptcha: {
            ready: (cb: () => void) => void;
            execute: (siteKey: string, options: { action: string }) => Promise<string>;
        };
    }
}

interface Props {
    recaptcha_site_key?: string;
    errors?: Record<string, string>;
}

export default function AdminLogin({ recaptcha_site_key, errors: serverErrors }: Props) {
    const [recaptchaToken, setRecaptchaToken] = useState('');
    const [recaptchaReady, setRecaptchaReady] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>(serverErrors || {});
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (!recaptcha_site_key) {
            setRecaptchaReady(true);
            return;
        }

        const script = document.createElement('script');
        script.src = `https://www.google.com/recaptcha/api.js?render=${recaptcha_site_key}`;
        script.async = true;
        script.onload = () => {
            window.grecaptcha.ready(() => {
                setRecaptchaReady(true);
            });
        };
        document.head.appendChild(script);

        return () => {
            document.head.removeChild(script);
        };
    }, [recaptcha_site_key]);

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
            setErrors({ email: 'Verifikasi keamanan gagal. Silakan refresh halaman.' });
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
        <>
            <Head title="Staff Portal" />

            <div className="auth-page-icon">
                <ShieldCheck />
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            autoComplete="email"
                            autoFocus
                            placeholder="admin@esmart.test"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <PasswordInput
                            id="password"
                            name="password"
                            autoComplete="current-password"
                            placeholder="Password"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <Button
                        type="submit"
                        className="mt-2 w-full"
                        disabled={processing || (recaptcha_site_key && !recaptchaReady)}
                    >
                        {processing && <Spinner />}
                        Masuk
                    </Button>
                </div>
            </form>
        </>
    );
}

AdminLogin.layout = {
    title: 'Staff Portal',
    description: 'Masuk menggunakan email dan password',
};
