import { Link, useForm, usePage } from "@inertiajs/react";
import type { SubmitEvent } from "react";
import { InputError, InputLabel, PrimaryButton, TextInput } from "@/shared/ui";
import { GuestLayout } from "@/widgets/guest-layout";

export function LoginPage() {
    const { status } = usePage().props;
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    const submit = (event: SubmitEvent) => {
        event.preventDefault();
        post(route("login"), {
            onFinish: () => {
                reset("password");
            },
        });
    };

    return (
        <GuestLayout>
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
                        autoComplete="current-password"
                    />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                {/* Remember Me */}
                <div className="block mt-4">
                    <label htmlFor="remember_me" className="inline-flex items-center">
                        <input
                            id="remember_me"
                            type="checkbox"
                            className="rounded dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-indigo-600 shadow-sm focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:focus:ring-offset-gray-800"
                            name="remember"
                            checked={data.remember}
                            onChange={(event) => {
                                setData("remember", event.target.checked);
                            }}
                        />
                        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Remember me</span>
                    </label>
                </div>

                <div className="flex items-center justify-end mt-4">
                    <Link
                        className="underline text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
                        href={route("password.request")}
                    >
                        Forgot your password?
                    </Link>

                    <PrimaryButton className="ml-3" disabled={processing}>
                        Log in
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
