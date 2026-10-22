import { Link } from "@inertiajs/react";

export type Paginated<T> = {
    data: T[];
    from: number | null;
    to: number | null;
    total: number;
    last_page: number;
    links: { url: string | null; label: string; active: boolean }[];
};

// Laravel のページネーターのラベル（&laquo; Previous など）の文字参照を戻す
const decodeLabel = (label: string) => label.replace("&laquo;", "«").replace("&raquo;", "»");

export function Pagination({ paginator }: { paginator: Paginated<unknown> }) {
    if (paginator.last_page <= 1) {
        return null;
    }

    return (
        <nav role="navigation" aria-label="Pagination Navigation" className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-700 dark:text-gray-400 leading-5">
                Showing <span className="font-medium">{paginator.from}</span> to{" "}
                <span className="font-medium">{paginator.to}</span> of{" "}
                <span className="font-medium">{paginator.total}</span> results
            </p>

            <span className="relative z-0 inline-flex rtl:flex-row-reverse shadow-sm rounded-md">
                {paginator.links.map((link, index) => {
                    const className = "relative inline-flex items-center px-4 py-2 -ml-px text-sm font-medium border border-gray-300 dark:border-gray-600 leading-5";
                    const label = decodeLabel(link.label);

                    if (link.url === null || link.active) {
                        return (
                            <span
                                key={index}
                                aria-current={link.active ? "page" : undefined}
                                className={`${className} cursor-default ${link.active ? "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200" : "bg-white dark:bg-gray-800 text-gray-400"}`}
                            >
                                {label}
                            </span>
                        );
                    }

                    return (
                        <Link
                            key={index}
                            href={link.url}
                            preserveScroll
                            className={`${className} bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-gray-500`}
                        >
                            {label}
                        </Link>
                    );
                })}
            </span>
        </nav>
    );
}
