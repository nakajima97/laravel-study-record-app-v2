<?php

namespace App\UseCases\DailyRecord;

use Carbon\Carbon;
use App\Models\Record;

class FetchDailyRecordForLast7Days
{
    /**
     * 直近7日間の日ごとの総学習時間を取得する
     *
     * @param int $user_id
     * @return array<int, Record|array<string, int>>
     */
    public function __invoke($user_id)
    {
        // 直近7日間の日付を生成
        $dates = collect(range(6, 0, -1))->map(function ($days) {
            return now()->subDays($days)->format('Y-m-d');
        });

        // 日付ごとのレコードを取得
        $daily_record = $dates->map(function ($date) use ($user_id) {
            $result = Record::selectRaw('YEAR(created_at) as year, MONTH(created_at) as month, DAY(created_at) as day, SUM(minute) as total_time')
                ->where('user_id', $user_id)
                ->whereDate('created_at', $date)
                ->groupBy('year', 'month', 'day')
                ->first();

            if ($result) {
                return $result;
            }

            return [
                'year' => Carbon::parse($date)->year,
                'month' => Carbon::parse($date)->month,
                'day' => Carbon::parse($date)->day,
                'total_time' => 0,
            ];
        });

        return $daily_record->all();
    }
}
