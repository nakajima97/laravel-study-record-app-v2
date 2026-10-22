import { Link, useForm, usePage } from "@inertiajs/react";
import type { SubmitEvent } from "react";
import { InputError, InputLabel, PrimaryButton, TextInput } from "@/shared/ui";

export function UpdateProfileInformationForm({ mustVerifyEmail }: { mustVerifyEmail: boolean }) {
    const { auth, status } = usePage().props;
    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        name: auth.user?.name ?? "",
        email: auth.user?.email ?? "",
    });

    const submit = (event: SubmitEvent) => {
        event.preventDefault();
        patch(route("profile.update"), { preserveScroll: true });
    };

    return (
        <section>
            <header>
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Profile Information</h2>

                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Update your account&apos;s profile information and email address.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <div>
                    <InputLabel htmlFor="name">Name</InputLabel>
                    <TextInput
                        id="name"
                        name="name"
                        type="text"
                        className="mt-1 block w-full"
                        value={data.name}
                        onChange={(event) => {
                            setData("name", event.target.value);
                        }}
                        required
                        autoFocus
                        autoComplete="name"
                    />
                    <InputError className="mt-2" message={errors.name} />
                </div>

                <div>
                    <InputLabel htmlFor="email">Email</InputLabel>
                    <TextInput
                        id="email"
                        name="email"
                        type="email"
                        className="mt-1 block w-full"
                        value={data.email}
                        onChange={(event) => {
                            setData("email", event.target.value);
                        }}
                        required
                        autoComplete="username"
                    />
                    <InputError className="mt-2" message={errors.email} />

                    {mustVerifyEmail && auth.user?.email_verified_at === null && (
                        <div>
                            <p className="text-sm mt-2 text-gray-800 dark:text-gray-200">
                                Your email address is unverified.{" "}
                                <Link
                                    href={route("verification.send")}
                                    method="post"
                                    as="button"
                                    className="underline text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
                                >
                                    Click here to re-send the verification email.
                                </Link>
                            </p>

                            {status === "verification-link-sent" && (
                                <p className="mt-2 font-medium text-sm text-green-600 dark:text-green-400">
                                    A new verification link has been sent to your email address.
                                </p>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>Save</PrimaryButton>

                    {recentlySuccessful && <p className="text-sm text-gray-600 dark:text-gray-400">Saved.</p>}
                </div>
            </form>
        </section>
    );
}
