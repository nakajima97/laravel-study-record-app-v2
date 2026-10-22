<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRecordRequest;
use App\Models\Category;
use App\UseCases\Category\GetCategoryList;
use App\UseCases\Record\StoreRecord;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class RecordController extends Controller
{
    public function create(): Response
    {
        $user_id = Auth::id();

        $get_category_list = new GetCategoryList();
        $categories = $get_category_list($user_id);

        return Inertia::render('record-create', [
            'categories' => $categories->map(fn (Category $category) => [
                'id' => $category->id,
                'name' => $category->name,
            ]),
        ]);
    }

    /**
     * @return \Illuminate\Routing\Redirector|\Illuminate\Http\RedirectResponse
     */
    public function store(StoreRecordRequest $request)
    {
        $record = $request->makeRecord();

        $store_record = new StoreRecord();
        $store_record($record);

        return redirect()->route('dashboard');
    }
}
