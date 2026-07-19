// Components
import { Form, Head } from '@inertiajs/react';
import { CheckCircle, MailCheck } from 'lucide-react';
import TextLink from '@/components/settings/text-link';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { logout } from '@/routes';
import { send } from '@/routes/verification';

export default function VerifyEmail({ status }: { status?: string }) {
    return (
        <>
            <Head title="Email verification" />

            {/* Page Icon */}
            <div className="auth-page-icon">
                <MailCheck />
            </div>

            {status === 'verification-link-sent' && (
                <div className="auth-status-success">
                    <CheckCircle style={{ width: 16, height: 16, flexShrink: 0 }} />
                    A new verification link has been sent to your email address.
                </div>
            )}

            <Form {...send.form()} className="space-y-6 text-center">
                {({ processing }) => (
                    <>
                        <Button disabled={processing} variant="secondary" className="w-full">
                            {processing && <Spinner />}
                            Resend verification email
                        </Button>

                        <TextLink
                            href={logout()}
                            className="mx-auto block text-sm"
                        >
                            Log out
                        </TextLink>
                    </>
                )}
            </Form>
        </>
    );
}

VerifyEmail.layout = {
    title: 'Check your inbox',
    description:
        'Please verify your email address by clicking on the link we emailed you.',
};
