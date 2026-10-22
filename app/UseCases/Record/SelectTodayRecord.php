<?php

namespace App\UseCases\Record;

use App\Models\Record;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class SelectTodayRecord
{
    /**
     * @param int|string|null $user_id
     * @return mixed
     */
    public function __invoke($user_id)
    {
        $today = Carbon::today();

        return Record::whereDate('created_at', $today)->where('user_id', $user_id)
            ->orderBy('created_at', 'desc')
            ->get();
    }
}
