import { useForm } from "@inertiajs/react";
import type { SubmitEvent } from "react";
import { InputError, InputLabel, PrimaryButton, TextInput } from "@/shared/ui";
import { GuestLayout } from "@/widgets/guest-layout";

export function ConfirmPasswordPage() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: "",
    });

    const submit = (event: SubmitEvent) => {
        event.preventDefault();
        post(route("password.confirm"), {
            onFinish: () => {
                reset("password");
            },
        });
    };

    return (
        <GuestLayout>
            <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                This is a secure area of the application. Please confirm your password before continuing.
            </div>

            <form onSubmit={submit}>
                {/* Password */}
                <div>
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
                        autoComplete="current-password"
                    />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="flex justify-end mt-4">
                    <PrimaryButton disabled={processing}>Confirm</PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
