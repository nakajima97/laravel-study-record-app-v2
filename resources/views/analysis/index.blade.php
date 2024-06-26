<x-app-layout>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            分析
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6 text-gray-900 dark:text-gray-100">
                    <div>
                        <h3 class="font-semibold text-lg text-gray-800 dark:text-gray-200 leading-tight">直近7日間の学習時間</h1>
                    </div>
                    <div>
                        <canvas id="myChart" class="w-full"></canvas>
                        <script>
                            var ctx = document.getElementById("myChart");
                            new Chart(ctx, {
                                type: 'bar',
                                data: {
                                    labels: [{!! $daily_records->map(function ($daily_record) {
                                            return '"' . $daily_record['month'] . '/' . $daily_record['day'] . '"';
                                        })->implode(',') !!}],
                                    datasets: [{
                                        label: '分',
                                        data: [{{ $daily_records->implode('total_time', ',') }}],
                                        borderWidth: 1
                                    }]
                                },
                                options: {
                                    scales: {
                                        y: {
                                            beginAtZero: true
                                        }
                                    }
                                }
                            });
                        </script>
                    </div>
                </div>
            </div>
            <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg mt-10">
                <div class="p-6 text-gray-900 dark:text-gray-100">
                    <div>
                        <h3 class="font-semibold text-lg text-gray-800 dark:text-gray-200 leading-tight">月ごとの総学習時間</h1>
                    </div>
                    <div class="p-6 text-gray-900 dark:text-gray-100">
                        <table>
                            <thead>
                                <tr>
                                    <th class="px-4 py-2">年月</th>
                                    <th class="px-4 py-2">学習時間</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach ($monthly_records as $record)
                                    <tr>
                                        <td class="border px-4 py-2">{{ $record->year }}年{{ $record->month }}月</td>
                                        <td class="border px-4 py-2">
                                            {{ floor($record->total_time / 60) }}時間{{ $record->total_time % 60 }}分</td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                        {{ $monthly_records->links() }}
                    </div>
                </div>
            </div>
            <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg mt-10">
                <div class="p-6 text-gray-900 dark:text-gray-100">
                    <div>
                        <h3 class="font-semibold text-lg text-gray-800 dark:text-gray-200 leading-tight">総学習時間</h1>
                    </div>
                    <div class="p-6 text-gray-900 dark:text-gray-100">
                        <p>{{ floor($total_learning_time / 60) }}時間{{ $total_learning_time % 60 }}分</p>
                    </div>
                </div>
            </div>
            <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg mt-10 h-screen">
                <div class="p-6 text-gray-900 dark:text-gray-100 h-[80vh]">
                    <div>
                        <h3 class="font-semibold text-lg text-gray-800 dark:text-gray-200 leading-tight">カテゴリーごとの学習時間（Top10のみ表示）</h1>
                    </div>
                    <canvas id="total_time_by_category" class="w-full"></canvas>
                    <script>
                        var ctx = document.getElementById("total_time_by_category");
                        new Chart(ctx, {
                            type: 'bar',
                            data: {
                                labels: [{!! $total_learning_time_by_category->map(function ($value) {
                                        return '"' . $value->name . '"';
                                    })->implode(',') !!}],
                                datasets: [{
                                    label: '時間',
                                    data: [{!! $total_learning_time_by_category->map(function ($value) {
                                        return '"' . floor($value->total_learning_time / 60) . '"';
                                    })->implode(',') !!}],
                                    borderWidth: 1
                                }]
                            },
                            options: {
                                indexAxis: 'y',
                                scales: {
                                    y: {
                                        beginAtZero: true
                                    }
                                },
                                maintainAspectRatio: false
                            }
                        });
                    </script>
                </div>
            </div>
        </div>
    </div>
</x-app-layout>
