import { useForm } from "@inertiajs/react";
import { useState, type SubmitEvent } from "react";
import type { Category } from "@/entities/category";
import { InputError } from "@/shared/ui";
import { AppLayout } from "@/widgets/app-layout";
import { StopwatchModal } from "./StopwatchModal";

type Props = {
    categories: Category[];
};

export function RecordCreatePage({ categories }: Props) {
    const [showStopwatch, setShowStopwatch] = useState(false);
    const { data, setData, post, processing, errors } = useForm({
        category_id: categories[0]?.id.toString() ?? "",
        minute: "",
        note: "",
    });

    const submit = (event: SubmitEvent) => {
        event.preventDefault();
        post(route("records.store"));
    };

    return (
        <AppLayout header="学習記録追加">
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <section className="text-gray-600  dark:text-gray-400 dark:bg-gray-900 body-font relative">
                                <form onSubmit={submit}>
                                    <div className="container px-5 py-24 mx-auto">
                                        <div className="lg:w-1/2 md:w-2/3 mx-auto">
                                            <div className="flex flex-wrap -m-2">
                                                <div className="p-2 w-full">
                                                    <div className="relative">
                                                        <label htmlFor="category_id" className="leading-7 text-sm text-gray-400">
                                                            カテゴリー
                                                        </label>
                                                        <select
                                                            id="category_id"
                                                            name="category_id"
                                                            value={data.category_id}
                                                            onChange={(event) => {
                                                                setData("category_id", event.target.value);
                                                            }}
                                                            className="w-full dark:bg-gray-800 bg-opacity-40 rounded border dark:border-gray-700 focus:border-indigo-500 dark:focus:bg-gray-900 focus:ring-2 focus:ring-indigo-900 text-base outline-none dark:text-gray-100 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                                                        >
                                                            {categories.map((category) => (
                                                                <option key={category.id} value={category.id}>
                                                                    {category.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <InputError message={errors.category_id} className="mt-2" />
                                                    </div>
                                                </div>
                                                <div className="p-2 w-full">
                                                    <div className="relative">
                                                        <label htmlFor="minute" className="leading-7 text-sm text-gray-400">
                                                            時間
                                                        </label>
                                                        <div className="w-full flex items-center gap-2">
                                                            <input
                                                                type="number"
                                                                id="minute"
                                                                name="minute"
                                                                value={data.minute}
                                                                onChange={(event) => {
                                                                    setData("minute", event.target.value);
                                                                }}
                                                                className="w-full dark:bg-gray-800 bg-opacity-40 rounded border dark:border-gray-700 dark:focus:border-indigo-500 dark:focus:bg-gray-900 dark:focus:ring-2 focus:ring-indigo-900 text-base outline-none dark:text-gray-100 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                                                            />
                                                            <p>分</p>
                                                        </div>
                                                        <InputError message={errors.minute} className="mt-2" />
                                                    </div>
                                                </div>
                                                <div className="p-2 w-full">
                                                    <div className="relative">
                                                        <label htmlFor="note" className="leading-7 text-sm text-gray-400">
                                                            メモ
                                                        </label>
                                                        <textarea
                                                            id="note"
                                                            name="note"
                                                            value={data.note}
                                                            onChange={(event) => {
                                                                setData("note", event.target.value);
                                                            }}
                                                            className="w-full dark:bg-gray-800 bg-opacity-40 rounded border dark:border-gray-700 dark:focus:border-indigo-500 dark:focus:bg-gray-900 focus:ring-2 dark:focus:ring-indigo-900 h-32 text-base outline-none dark:text-gray-100 py-1 px-3 resize-none leading-6 transition-colors duration-200 ease-in-out"
                                                        />
                                                        <InputError message={errors.note} className="mt-2" />
                                                    </div>
                                                </div>
                                                <div className="p-2 w-full">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setShowStopwatch(true);
                                                        }}
                                                        className="flex mx-auto text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                                                    >
                                                        ストップウォッチを表示する
                                                    </button>
                                                </div>
                                                <div className="p-2 w-full">
                                                    <button
                                                        type="submit"
                                                        className="flex mx-auto text-white bg-indigo-500 border-0 py-2 px-8 focus:outline-none hover:bg-indigo-600 rounded text-lg"
                                                        disabled={processing}
                                                    >
                                                        記録追加
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
                <StopwatchModal
                    show={showStopwatch}
                    onClose={() => {
                        setShowStopwatch(false);
                    }}
                    onFinish={(minutes) => {
                        setData("minute", minutes.toString());
                    }}
                />
            </div>
        </AppLayout>
    );
}
