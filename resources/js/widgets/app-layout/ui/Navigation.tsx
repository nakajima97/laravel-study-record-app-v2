import { Link, usePage } from "@inertiajs/react";
import { useState } from "react";
import { ApplicationLogo, Dropdown, dropdownLinkClassName, NavLink, ResponsiveNavLink } from "@/shared/ui";

const links = [
    { name: "dashboard", label: "Dashboard" },
    { name: "records.create", label: "学習記録を付ける" },
    { name: "categories.index", label: "カテゴリー一覧" },
    { name: "records.analysis", label: "分析" },
] as const;

export function Navigation() {
    const user = usePage().props.auth.user;
    const [open, setOpen] = useState(false);

    return (
        <nav className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
            {/* Primary Navigation Menu */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        {/* Logo */}
                        <div className="shrink-0 flex items-center">
                            <Link href={route("dashboard")}>
                                <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800 dark:text-gray-200" />
                            </Link>
                        </div>

                        {/* Navigation Links */}
                        <div className="hidden space-x-8 sm:-my-px sm:ml-10 sm:flex">
                            {links.map((link) => (
                                <NavLink key={link.name} href={route(link.name)} active={route().current(link.name)}>
                                    {link.label}
                                </NavLink>
                            ))}
                        </div>
                    </div>

                    {/* Settings Dropdown */}
                    <div className="hidden sm:flex sm:items-center sm:ml-6">
                        <Dropdown
                            trigger={
                                <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none transition ease-in-out duration-150">
                                    <div>{user?.name}</div>

                                    <div className="ml-1">
                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                            <path
                                                fillRule="evenodd"
                                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </div>
                                </button>
                            }
                        >
                            <Link href={route("profile.edit")} className={dropdownLinkClassName}>
                                Profile
                            </Link>
                            <Link href={route("logout")} method="post" as="button" className={dropdownLinkClassName}>
                                Log Out
                            </Link>
                        </Dropdown>
                    </div>

                    {/* Hamburger */}
                    <div className="-mr-2 flex items-center sm:hidden">
                        <button
                            onClick={() => {
                                setOpen((value) => !value);
                            }}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-900 focus:text-gray-500 dark:focus:text-gray-400 transition duration-150 ease-in-out"
                        >
                            <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                <path
                                    className={open ? "hidden" : "inline-flex"}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                                <path
                                    className={open ? "inline-flex" : "hidden"}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Responsive Navigation Menu */}
            {open && (
                <div className="sm:hidden">
                    <div className="pt-2 pb-3 space-y-1">
                        <ResponsiveNavLink href={route("dashboard")} active={route().current("dashboard")}>
                            Dashboard
                        </ResponsiveNavLink>
                    </div>

                    {/* Responsive Settings Options */}
                    <div className="pt-4 pb-1 border-t border-gray-200 dark:border-gray-600">
                        <div className="px-4">
                            <div className="font-medium text-base text-gray-800 dark:text-gray-200">{user?.name}</div>
                            <div className="font-medium text-sm text-gray-500">{user?.email}</div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route("profile.edit")}>Profile</ResponsiveNavLink>
                            {links.map((link) => (
                                <ResponsiveNavLink key={link.name} href={route(link.name)} active={route().current(link.name)}>
                                    {link.label}
                                </ResponsiveNavLink>
                            ))}
                            <Link
                                href={route("logout")}
                                method="post"
                                as="button"
                                className="block w-full pl-3 pr-4 py-2 border-l-4 border-transparent text-left text-base font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 focus:outline-none transition duration-150 ease-in-out"
                            >
                                Log Out
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
