import { useForm } from "@inertiajs/react";
import type { SubmitEvent } from "react";
import { InputError, InputLabel, PrimaryButton, TextInput } from "@/shared/ui";

export function UpdatePasswordForm() {
    const { data, setData, put, errors, reset, processing, recentlySuccessful } = useForm({
        current_password: "",
        password: "",
        password_confirmation: "",
    });

    const submit = (event: SubmitEvent) => {
        event.preventDefault();
        put(route("password.update"), {
            errorBag: "updatePassword",
            preserveScroll: true,
            onSuccess: () => {
                reset();
            },
        });
    };

    return (
        <section>
            <header>
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Update Password</h2>

                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Ensure your account is using a long, random password to stay secure.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <div>
                    <InputLabel htmlFor="current_password">Current Password</InputLabel>
                    <TextInput
                        id="current_password"
                        name="current_password"
                        type="password"
                        className="mt-1 block w-full"
                        value={data.current_password}
                        onChange={(event) => {
                            setData("current_password", event.target.value);
                        }}
                        autoComplete="current-password"
                    />
                    <InputError message={errors.current_password} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="password">New Password</InputLabel>
                    <TextInput
                        id="password"
                        name="password"
                        type="password"
                        className="mt-1 block w-full"
                        value={data.password}
                        onChange={(event) => {
                            setData("password", event.target.value);
                        }}
                        autoComplete="new-password"
                    />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="password_confirmation">Confirm Password</InputLabel>
                    <TextInput
                        id="password_confirmation"
                        name="password_confirmation"
                        type="password"
                        className="mt-1 block w-full"
                        value={data.password_confirmation}
                        onChange={(event) => {
                            setData("password_confirmation", event.target.value);
                        }}
                        autoComplete="new-password"
                    />
                    <InputError message={errors.password_confirmation} className="mt-2" />
                </div>

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>Save</PrimaryButton>

                    {recentlySuccessful && <p className="text-sm text-gray-600 dark:text-gray-400">Saved.</p>}
                </div>
            </form>
        </section>
    );
}
