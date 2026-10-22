import { Link } from "@inertiajs/react";
import type { Category } from "@/entities/category";
import { AppLayout } from "@/widgets/app-layout";

type Props = {
    category: Category;
};

export function CategoryDetailPage({ category }: Props) {
    return (
        <AppLayout header="カテゴリー詳細">
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <section className="bg-gray-100 dark:text-gray-400 dark:bg-gray-900 body-font overflow-hidden p-6">
                                <div className="flex justify-between">
                                    <div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                history.back();
                                            }}
                                            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
                                        >
                                            前のページへ戻る
                                        </button>
                                    </div>
                                    <div>
                                        <Link
                                            href={route("categories.edit", category.id)}
                                            className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                                        >
                                            編集
                                        </Link>
                                    </div>
                                </div>
                                <div className="p-4 w-full">
                                    <p>カテゴリー名：{category.name}</p>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
