<?php

namespace App\UseCases\MonthlyRecord;

use App\Models\Record;

class FetchMonthlyRecordPaginate
{
    /**
     * 月ごとの総学習時間をページネーション付きで取得する
     *
     * @param int $user_id
     * @param int $paginate_num Optional
     * @return \Illuminate\Pagination\LengthAwarePaginator<int, \App\Models\Record>
     */
    public function __invoke($user_id, $paginate_num = 10)
    {
        $monthly_record = Record::selectRaw('YEAR(created_at) as year, MONTH(created_at) as month, SUM(minute) as total_time')
          ->where('user_id', $user_id)
          ->groupBy('year', 'month')
          ->orderBy('year', 'desc')
          ->orderBy('month', 'desc')
          ->paginate($paginate_num);

        return $monthly_record;
    }
}
