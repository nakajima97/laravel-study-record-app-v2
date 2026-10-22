import { router, useForm } from "@inertiajs/react";
import type { SubmitEvent } from "react";
import type { Category } from "@/entities/category";
import { InputError } from "@/shared/ui";
import { AppLayout } from "@/widgets/app-layout";

type Props = {
    category: Category & { is_archive: boolean };
};

export function CategoryEditPage({ category }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: category.name,
    });

    const submit = (event: SubmitEvent) => {
        event.preventDefault();
        put(route("categories.update", category.id));
    };

    return (
        <AppLayout header="カテゴリー編集">
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
                                        {category.is_archive ? (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    router.delete(route("categories.archive.destroy", { id: category.id }));
                                                }}
                                                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                                            >
                                                アーカイブ解除する
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    router.post(route("categories.archive.store", { id: category.id }));
                                                }}
                                                className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded"
                                            >
                                                アーカイブする
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="p-4 w-full">
                                    <form onSubmit={submit} className="flex flex-col gap-2">
                                        <div>
                                            <label htmlFor="name">カテゴリー名</label>
                                            <input
                                                type="text"
                                                name="name"
                                                id="name"
                                                value={data.name}
                                                onChange={(event) => {
                                                    setData("name", event.target.value);
                                                }}
                                                className="w-full dark:bg-gray-800 bg-opacity-40 rounded border dark:border-gray-700 dark:focus:border-indigo-500 dark:focus:bg-gray-900 dark:focus:ring-2 focus:ring-indigo-900 text-base outline-none dark:text-gray-100 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                                            />
                                            <InputError message={errors.name} className="mt-2" />
                                        </div>
                                        <div className="flex justify-end">
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                                            >
                                                更新
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
