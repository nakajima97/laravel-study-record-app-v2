import { useForm } from "@inertiajs/react";
import type { SubmitEvent } from "react";
import { InputError, InputLabel, PrimaryButton, TextInput } from "@/shared/ui";
import { GuestLayout } from "@/widgets/guest-layout";

type Props = {
    token: string;
    email: string;
};

export function ResetPasswordPage({ token, email }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token,
        email,
        password: "",
        password_confirmation: "",
    });

    const submit = (event: SubmitEvent) => {
        event.preventDefault();
        post(route("password.store"), {
            onFinish: () => {
                reset("password", "password_confirmation");
            },
        });
    };

    return (
        <GuestLayout>
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
                        autoComplete="username"
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                {/* Password */}
                <div className="mt-4">
                    <InputLabel htmlFor="password">Password</InputLabel>
                    <TextInput
                        id="password"
                        className="block mt-1 w-full"
                        type="password"
                        name="password"
                        value={data.password}
                        onChange={(event) => {
                            setData("password", event.target.value);
                        }}
                        required
                        autoComplete="new-password"
                    />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                {/* Confirm Password */}
                <div className="mt-4">
                    <InputLabel htmlFor="password_confirmation">Confirm Password</InputLabel>
                    <TextInput
                        id="password_confirmation"
                        className="block mt-1 w-full"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        onChange={(event) => {
                            setData("password_confirmation", event.target.value);
                        }}
                        required
                        autoComplete="new-password"
                    />
                    <InputError message={errors.password_confirmation} className="mt-2" />
                </div>

                <div className="flex items-center justify-end mt-4">
                    <PrimaryButton disabled={processing}>Reset Password</PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
