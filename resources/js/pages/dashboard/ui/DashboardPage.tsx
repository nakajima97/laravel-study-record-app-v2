import { Link } from "@inertiajs/react";
import { AppLayout } from "@/widgets/app-layout";

type TodayRecord = {
    id: number;
    category_name: string;
    created_at: string;
    minute: number;
    note: string | null;
};

type Props = {
    today_records: TodayRecord[];
    total_study_time_this_month: number;
    total_study_time_today: number;
};

// 60 分以上のときだけ「◯時間」を付ける
function StudyTime({ label, minutes }: { label: string; minutes: number }) {
    return (
        <h1 className="sm:text-3xl text-2xl font-medium title-font mb-2 dark:text-white">
            {label}
            {minutes >= 60 && ` ${String(Math.floor(minutes / 60))}時間`} {minutes % 60}分
        </h1>
    );
}

export function DashboardPage({ today_records, total_study_time_this_month, total_study_time_today }: Props) {
    return (
        <AppLayout header="Dashboard">
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 pb-0 text-gray-900 dark:text-gray-100">
                            <section className="bg-gray-100 dark:text-gray-400 dark:bg-gray-900 body-font overflow-hidden">
                                <div className="p-4 w-full">
                                    <Link
                                        href={route("records.create")}
                                        className="flex mx-auto text-white bg-indigo-500 border-0 py-2 px-8 focus:outline-none hover:bg-indigo-600 rounded text-lg"
                                    >
                                        学習記録を付ける
                                    </Link>
                                </div>
                            </section>
                        </div>
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <section className="bg-gray-100 dark:text-gray-400 dark:bg-gray-900 body-font overflow-hidden">
                                <div className="container px-5 py-6 mx-auto">
                                    <StudyTime label="今月の総学習時間：" minutes={total_study_time_this_month} />
                                </div>
                            </section>
                            <section className="bg-gray-100 dark:text-gray-400 dark:bg-gray-900 body-font overflow-hidden">
                                <div className="container px-5 py-6 mx-auto">
                                    <StudyTime label="今日の総学習時間：" minutes={total_study_time_today} />
                                </div>
                            </section>
                            <section className="bg-gray-100 dark:text-gray-400 dark:bg-gray-900 body-font overflow-hidden">
                                <div className="container px-5 py-6 mx-auto">
                                    <h1 className="sm:text-3xl text-2xl font-medium title-font mb-2 dark:text-white">今日の学習記録</h1>
                                    {today_records.map((record) => (
                                        <div key={record.id} className="-my-8 divide-y-2 divide-gray-800">
                                            <div className="py-8 flex flex-wrap md:flex-nowrap">
                                                <div className="md:flex-grow">
                                                    <h2 className="text-2xl font-medium dark:text-white title-font mb-2">
                                                        {record.category_name}
                                                    </h2>
                                                    <p className="leading-relaxed">{record.created_at}</p>
                                                    <p className="leading-relaxed">時間：{record.minute}分</p>
                                                    <p className="leading-relaxed">{record.note}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
