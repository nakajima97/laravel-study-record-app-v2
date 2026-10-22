<?php

namespace App\Http\Controllers;

use App\UseCases\DailyRecord\FetchDailyRecordForLast7Days;
use App\UseCases\MonthlyRecord\FetchMonthlyRecordPaginate;
use App\UseCases\Record\CalculateTotalLearningTime;
use App\UseCases\Record\CalculateTotalLearningTimeByCategory;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class AnalysisController extends Controller
{
    public function index(): Response|RedirectResponse
    {
        $auth_id = auth()->id();

        if ($auth_id === null) {
            return redirect()->route('login');
        }

        $user_id = (int) $auth_id;

        $fetch_daily_record = new FetchDailyRecordForLast7Days();
        $daily_records = $fetch_daily_record($user_id);

        // 月ごとの総学習時間を取得する
        $fetch_record_monthly_paginate = new FetchMonthlyRecordPaginate();
        $monthly_records = $fetch_record_monthly_paginate($user_id);

        $calculate_total_learning_time = new CalculateTotalLearningTime();
        $total_learning_time = $calculate_total_learning_time($user_id);

        // カテゴリーごとの総学習時間を取得する
        $calculate_total_learning_time_by_category = new CalculateTotalLearningTimeByCategory();
        $total_learning_time_by_category = $calculate_total_learning_time_by_category($user_id);

        return Inertia::render('analysis', [
            'daily_records' => array_map(fn ($record) => [
                'year' => $this->toInt($record['year']),
                'month' => $this->toInt($record['month']),
                'day' => $this->toInt($record['day']),
                'total_time' => $this->toInt($record['total_time']),
            ], $daily_records),
            'monthly_records' => $monthly_records->through(fn ($record) => [
                'year' => $this->toInt($record->getAttribute('year')),
                'month' => $this->toInt($record->getAttribute('month')),
                'total_time' => $this->toInt($record->getAttribute('total_time')),
            ]),
            'total_learning_time' => $total_learning_time,
            'total_learning_time_by_category' => $total_learning_time_by_category->map(fn ($record) => [
                'name' => $record->getAttribute('name'),
                'total_learning_time' => $this->toInt($record->getAttribute('total_learning_time')),
            ]),
        ]);
    }

    /**
     * 集計値（MySQL からは文字列で返る）を数値にする
     */
    private function toInt(mixed $value): int
    {
        return is_numeric($value) ? (int) $value : 0;
    }
}
