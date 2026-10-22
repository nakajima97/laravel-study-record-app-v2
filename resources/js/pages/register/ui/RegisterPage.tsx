import { Link, useForm } from "@inertiajs/react";
import type { SubmitEvent } from "react";
import { InputError, InputLabel, PrimaryButton, TextInput } from "@/shared/ui";
import { GuestLayout } from "@/widgets/guest-layout";

export function RegisterPage() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
    });

    const submit = (event: SubmitEvent) => {
        event.preventDefault();
        post(route("register"), {
            onFinish: () => {
                reset("password", "password_confirmation");
            },
        });
    };

    return (
        <GuestLayout>
            <form onSubmit={submit}>
                {/* Name */}
                <div>
                    <InputLabel htmlFor="name">Name</InputLabel>
                    <TextInput
                        id="name"
                        className="block mt-1 w-full"
                        type="text"
                        name="name"
                        value={data.name}
                        onChange={(event) => {
                            setData("name", event.target.value);
                        }}
                        required
                        autoFocus
                        autoComplete="name"
                    />
                    <InputError message={errors.name} className="mt-2" />
                </div>

                {/* Email Address */}
                <div className="mt-4">
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
                    <Link
                        className="underline text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
                        href={route("login")}
                    >
                        Already registered?
                    </Link>

                    <PrimaryButton className="ml-4" disabled={processing}>
                        Register
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
