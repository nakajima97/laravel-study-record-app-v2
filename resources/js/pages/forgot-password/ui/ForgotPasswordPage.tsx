import { useForm, usePage } from "@inertiajs/react";
import type { SubmitEvent } from "react";
import { InputError, InputLabel, PrimaryButton, TextInput } from "@/shared/ui";
import { GuestLayout } from "@/widgets/guest-layout";

export function ForgotPasswordPage() {
    const { status } = usePage().props;
    const { data, setData, post, processing, errors } = useForm({
        email: "",
    });

    const submit = (event: SubmitEvent) => {
        event.preventDefault();
        post(route("password.email"));
    };

    return (
        <GuestLayout>
            <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                Forgot your password? No problem. Just let us know your email address and we will email you a password reset
                link that will allow you to choose a new one.
            </div>

            {/* Session Status */}
            {status && <div className="mb-4 font-medium text-sm text-green-600 dark:text-green-400">{status}</div>}

            <form onSubmit={submit}>
                {/* Email Address */}
                <div>
                    <InputLabel htmlFor="email">Email</InputLabel>
                    <TextInput
                        id="email"
                        className="block mt-1 w-full"
                        type="email"
                        name="email"
                        value={data.email}
                        onChange={(event) => {
                            setData("email", event.target.value);
                        }}
                        required
                        autoFocus
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="flex items-center justify-end mt-4">
                    <PrimaryButton disabled={processing}>Email Password Reset Link</PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
