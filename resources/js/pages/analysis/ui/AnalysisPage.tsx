import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Tooltip } from "chart.js";
import { Bar } from "react-chartjs-2";
import { Pagination, type Paginated } from "@/shared/ui";
import { AppLayout } from "@/widgets/app-layout";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

type Props = {
    daily_records: { year: number; month: number; day: number; total_time: number }[];
    monthly_records: Paginated<{ year: number; month: number; total_time: number }>;
    total_learning_time: number;
    total_learning_time_by_category: { name: string; total_learning_time: number }[];
};

const formatTime = (minutes: number) => `${String(Math.floor(minutes / 60))}時間${String(minutes % 60)}分`;

const headingClassName = "font-semibold text-lg text-gray-800 dark:text-gray-200 leading-tight";

export function AnalysisPage({ daily_records, monthly_records, total_learning_time, total_learning_time_by_category }: Props) {
    return (
        <AppLayout header="分析">
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <div>
                                <h3 className={headingClassName}>直近7日間の学習時間</h3>
                            </div>
                            <div>
                                <Bar
                                    className="w-full"
                                    data={{
                                        labels: daily_records.map((record) => `${String(record.month)}/${String(record.day)}`),
                                        datasets: [
                                            {
                                                label: "分",
                                                data: daily_records.map((record) => record.total_time),
                                                borderWidth: 1,
                                            },
                                        ],
                                    }}
                                    options={{
                                        scales: {
                                            y: {
                                                beginAtZero: true,
                                            },
                                        },
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg mt-10">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <div>
                                <h3 className={headingClassName}>月ごとの総学習時間</h3>
                            </div>
                            <div className="p-6 text-gray-900 dark:text-gray-100">
                                <table>
                                    <thead>
                                        <tr>
                                            <th className="px-4 py-2">年月</th>
                                            <th className="px-4 py-2">学習時間</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {monthly_records.data.map((record) => (
                                            <tr key={`${String(record.year)}-${String(record.month)}`}>
                                                <td className="border px-4 py-2">
                                                    {record.year}年{record.month}月
                                                </td>
                                                <td className="border px-4 py-2">{formatTime(record.total_time)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <Pagination paginator={monthly_records} />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg mt-10">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <div>
                                <h3 className={headingClassName}>総学習時間</h3>
                            </div>
                            <div className="p-6 text-gray-900 dark:text-gray-100">
                                <p>{formatTime(total_learning_time)}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg mt-10 h-screen">
                        <div className="p-6 text-gray-900 dark:text-gray-100 h-[80vh]">
                            <div>
                                <h3 className={headingClassName}>カテゴリーごとの学習時間（Top10のみ表示）</h3>
                            </div>
                            <Bar
                                className="w-full"
                                data={{
                                    labels: total_learning_time_by_category.map((record) => record.name),
                                    datasets: [
                                        {
                                            label: "時間",
                                            data: total_learning_time_by_category.map((record) =>
                                                Math.floor(record.total_learning_time / 60),
                                            ),
                                            borderWidth: 1,
                                        },
                                    ],
                                }}
                                options={{
                                    indexAxis: "y",
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                        },
                                    },
                                    maintainAspectRatio: false,
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
