import type { ReactNode } from "react";
import { Navigation } from "./Navigation";

type Props = {
    // ページ見出し（h2）
    header: string;
    children: ReactNode;
};

export function AppLayout({ header, children }: Props) {
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <Navigation />

            {/* Page Heading */}
            <header className="bg-white dark:bg-gray-800 shadow">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">{header}</h2>
                </div>
            </header>

            {/* Page Content */}
            <main>{children}</main>
        </div>
    );
}
