<?php

namespace App\Http\Controllers;

use App\Models\Record;
use App\UseCases\Record\CalculateTotalStudyTimeThisMonth;
use App\UseCases\Record\CalculateTotalStudyTimeToday;
use App\UseCases\Record\SelectTodayRecord;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $user_id = Auth::id();

        $select_today_record = new SelectTodayRecord();
        $today_records = $select_today_record($user_id);

        $calculate_total_study_time_this_month = new CalculateTotalStudyTimeThisMonth();
        $total_study_time_this_month = $calculate_total_study_time_this_month($user_id);

        $calculate_total_study_time_today = new CalculateTotalStudyTimeToday();
        $total_study_time_today = $calculate_total_study_time_today($user_id);

        return Inertia::render('dashboard', [
            'today_records' => $today_records->map(fn (Record $record) => [
                'id' => $record->id,
                'category_name' => $record->category?->name,
                'created_at' => $record->created_at?->format('Y-m-d H:i:s'),
                'minute' => $record->minute,
                'note' => $record->note,
            ]),
            'total_study_time_this_month' => $total_study_time_this_month,
            'total_study_time_today' => $total_study_time_today
        ]);
    }
}
