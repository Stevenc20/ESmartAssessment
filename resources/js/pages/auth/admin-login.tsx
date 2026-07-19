import { Form, Head, Link } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';
import InputError from '@/components/settings/input-error';
import PasswordInput from '@/components/auth/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login as loginUrl } from '@/routes';
import login from '@/routes/login';
import { request } from '@/routes/password';

export default function AdminLogin() {
    return (
        <>
            <Head title="Login Admin" />

            <div className="auth-page-icon">
                <ShieldCheck />
            </div>

            <Form
                {...login.store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
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
                                disabled={processing}
                            >
                                {processing && <Spinner />}
                                Masuk
                            </Button>
                        </div>
                    </>
                )}
            </Form>

            <div className="auth-admin-footer">
                <Link href={loginUrl()} className="auth-back-to-student">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    <span>Kembali ke Login Siswa</span>
                </Link>
                <Link href={request()} className="auth-forgot-password">
                    Lupa password?
                </Link>
            </div>
        </>
    );
}

AdminLogin.layout = {
    title: 'Login Admin / Guru',
    description: 'Masuk menggunakan email dan password',
};
