<?php

namespace App\UseCases\Record;

use Illuminate\Support\Facades\DB;
use App\Models\Record;

class CalculateTotalLearningTimeByCategory
{
    /**
     * @param int $user_id
     * @return \Illuminate\Database\Eloquent\Collection<int, \App\Models\Record>
     */
    public function __invoke(int $user_id)
    {
        $records = Record::join('categories', 'records.category_id', '=', 'categories.id')
            ->where('records.user_id', $user_id)
            ->select('categories.name', DB::raw('SUM(records.minute) as total_learning_time'))
            ->groupBy('categories.id')
            ->orderBy('total_learning_time', 'desc')
            ->limit(10)
            ->get();

        return $records;
    }
}
