<?php

namespace App\UseCases\Record;

use App\Models\Record;

class CalculateTotalLearningTime
{
    /**
     * @param int|string|null $user_id
     * @return int 学習時間（分）
     */
    public function __invoke($user_id)
    {
        $record = Record::where('user_id', $user_id)->get();
        $time = $record->sum('minute');

        return is_numeric($time) ? (int) $time : 0;
    }
}
