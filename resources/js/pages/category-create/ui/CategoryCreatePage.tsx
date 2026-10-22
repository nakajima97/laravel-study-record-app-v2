import { useForm } from "@inertiajs/react";
import type { SubmitEvent } from "react";
import { InputError } from "@/shared/ui";
import { AppLayout } from "@/widgets/app-layout";

export function CategoryCreatePage() {
    const { data, setData, post, processing, errors } = useForm({
        name: "",
    });

    const submit = (event: SubmitEvent) => {
        event.preventDefault();
        post(route("categories.store"));
    };

    return (
        <AppLayout header="カテゴリー記録追加">
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <section className="dark:text-gray-400 dark:bg-gray-900 body-font relative">
                                <form onSubmit={submit}>
                                    <div className="container px-5 py-24 mx-auto">
                                        <div className="lg:w-1/2 md:w-2/3 mx-auto">
                                            <div className="flex flex-wrap -m-2">
                                                <div className="p-2 w-full">
                                                    <div className="relative">
                                                        <label htmlFor="name" className="leading-7 text-sm text-gray-400">
                                                            カテゴリー名
                                                        </label>
                                                        <input
                                                            type="text"
                                                            id="name"
                                                            name="name"
                                                            value={data.name}
                                                            onChange={(event) => {
                                                                setData("name", event.target.value);
                                                            }}
                                                            className="w-full dark:bg-gray-800 bg-opacity-40 rounded border dark:border-gray-700 dark:focus:border-indigo-500 dark:focus:bg-gray-900 focus:ring-2 dark:focus:ring-indigo-900 text-base outline-none dark:text-gray-100 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                                                        />
                                                        <InputError message={errors.name} className="mt-2" />
                                                    </div>
                                                </div>
                                                <div className="p-2 w-full">
                                                    <button
                                                        type="submit"
                                                        className="flex mx-auto text-white bg-indigo-500 border-0 py-2 px-8 focus:outline-none hover:bg-indigo-600 rounded text-lg"
                                                        disabled={processing}
                                                    >
                                                        追加
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
