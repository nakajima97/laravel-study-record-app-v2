import { Link, useForm, usePage } from "@inertiajs/react";
import type { SubmitEvent } from "react";
import { PrimaryButton } from "@/shared/ui";
import { GuestLayout } from "@/widgets/guest-layout";

export function VerifyEmailPage() {
    const { status } = usePage().props;
    const { post, processing } = useForm({});

    const submit = (event: SubmitEvent) => {
        event.preventDefault();
        post(route("verification.send"));
    };

    return (
        <GuestLayout>
            <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                Thanks for signing up! Before getting started, could you verify your email address by clicking on the link we
                just emailed to you? If you didn&apos;t receive the email, we will gladly send you another.
            </div>

            {status === "verification-link-sent" && (
                <div className="mb-4 font-medium text-sm text-green-600 dark:text-green-400">
                    A new verification link has been sent to the email address you provided during registration.
                </div>
            )}

            <div className="mt-4 flex items-center justify-between">
                <form onSubmit={submit}>
                    <div>
                        <PrimaryButton disabled={processing}>Resend Verification Email</PrimaryButton>
                    </div>
                </form>

                <Link
                    href={route("logout")}
                    method="post"
                    as="button"
                    className="underline text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
                >
                    Log Out
                </Link>
            </div>
        </GuestLayout>
    );
}
