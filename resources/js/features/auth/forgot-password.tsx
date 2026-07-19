// Components
import { Form, Head } from '@inertiajs/react';
import { CheckCircle, KeyRound, LoaderCircle } from 'lucide-react';
import InputError from '@/components/settings/input-error';
import TextLink from '@/components/settings/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login } from '@/routes';
import { email } from '@/routes/password';

export default function ForgotPassword({ status }: { status?: string }) {
    return (
        <>
            <Head title="Forgot password" />

            {/* Page Icon */}
            <div className="auth-page-icon">
                <KeyRound />
            </div>

            {status && (
                <div className="auth-status-success">
                    <CheckCircle style={{ width: 16, height: 16, flexShrink: 0 }} />
                    {status}
                </div>
            )}

            <div className="space-y-6">
                <Form {...email.form()}>
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    autoComplete="off"
                                    autoFocus
                                    placeholder="email@example.com"
                                />

                                <InputError message={errors.email} />
                            </div>

                            <div className="my-6 flex items-center justify-start">
                                <Button
                                    className="w-full"
                                    disabled={processing}
                                    data-test="email-password-reset-link-button"
                                >
                                    {processing && (
                                        <LoaderCircle className="h-4 w-4 animate-spin" />
                                    )}
                                    Send reset link
                                </Button>
                            </div>
                        </>
                    )}
                </Form>

                <div className="space-x-1 text-center text-sm text-muted-foreground">
                    <span>Remembered your password?</span>{' '}
                    <TextLink href={login()}>Log in</TextLink>
                </div>
            </div>
        </>
    );
}

ForgotPassword.layout = {
    title: 'Forgot your password?',
    description: 'Enter your email and we\'ll send you a reset link',
};
