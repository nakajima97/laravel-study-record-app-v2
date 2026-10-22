import { Link, router } from "@inertiajs/react";
import { useState } from "react";
import type { Category } from "@/entities/category";
import { AppLayout } from "@/widgets/app-layout";
import { move } from "../lib/move";
import { CategoryItem } from "./CategoryItem";

type Props = {
    categories: Category[];
    archive_categories: Category[];
};

const tabClassName =
    "inline-block p-4 rounded-t-lg hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300";
const activeTabClassName = "text-blue-600 bg-gray-100 dark:bg-gray-800 dark:text-blue-500";

export function CategoryListPage({ categories, archive_categories }: Props) {
    const [tab, setTab] = useState<"list" | "archived">("list");

    // 並び順はアーカイブ済みも含めた全体（一覧 → アーカイブ済みの順）で保存する
    const reorder = (draggedId: number, targetId: number) => {
        const all = [...categories, ...archive_categories];
        const order = move(
            all.map((category) => category.id),
            draggedId,
            targetId,
        );
        const byOrder = (list: Category[]) => [...list].sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));

        router.patch(
            route("category_order.update"),
            { category_order: order },
            {
                preserveScroll: true,
                optimistic: () => ({
                    categories: byOrder(categories),
                    archive_categories: byOrder(archive_categories),
                }),
            },
        );
    };

    return (
        <AppLayout header="カテゴリー一覧">
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <section className="bg-gray-100 dark:text-gray-400 dark:bg-gray-900 body-font overflow-hidden p-6">
                                <div className="p-4 w-full">
                                    <Link
                                        href={route("categories.create")}
                                        className="flex mx-auto text-white bg-indigo-500 border-0 py-2 px-8 focus:outline-none hover:bg-indigo-600 rounded text-lg"
                                    >
                                        カテゴリー追加
                                    </Link>
                                </div>
                            </section>
                            <section className="bg-gray-100 dark:text-gray-400 dark:bg-gray-900 body-font overflow-hidden p-6">
                                <ul className="flex flex-wrap text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:border-gray-700 dark:text-gray-400">
                                    <li className="me-2">
                                        <button
                                            type="button"
                                            aria-pressed={tab === "list"}
                                            onClick={() => {
                                                setTab("list");
                                            }}
                                            className={`${tabClassName} ${tab === "list" ? activeTabClassName : ""}`}
                                        >
                                            一覧
                                        </button>
                                    </li>
                                    <li className="me-2">
                                        <button
                                            type="button"
                                            aria-pressed={tab === "archived"}
                                            onClick={() => {
                                                setTab("archived");
                                            }}
                                            className={`${tabClassName} ${tab === "archived" ? activeTabClassName : ""}`}
                                        >
                                            アーカイブ済み
                                        </button>
                                    </li>
                                </ul>
                            </section>
                            <section className="bg-gray-100 dark:text-gray-400 dark:bg-gray-900 body-font overflow-hidden p-6">
                                <ul>
                                    {(tab === "list" ? categories : archive_categories).map((category) => (
                                        <CategoryItem key={category.id} category={category} onDropOn={reorder} />
                                    ))}
                                </ul>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
