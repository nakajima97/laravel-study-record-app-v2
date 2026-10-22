<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Models\Category;
use App\UseCases\Category\GetArchivedCategoryList;
use App\UseCases\Category\GetCategoryList;
use App\UseCases\Category\StoreCategory;
use App\UseCases\Category\FindCategory;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function index(): Response
    {
        $user_id = Auth::id();

        $get_category = new GetCategoryList();
        $categories = $get_category($user_id);

        $get_archived_category = new GetArchivedCategoryList();
        $archive_categories = $get_archived_category($user_id);

        return Inertia::render('category-list', [
            'categories' => $categories->map(fn (Category $category) => $this->toProps($category)),
            'archive_categories' => $archive_categories->map(fn (Category $category) => $this->toProps($category)),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('category-create');
    }

    /**
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(StoreCategoryRequest $request)
    {
        $category = $request->makeCategory();
        $user_id = (int) Auth::id();

        $category['user_id'] = $user_id;

        $store_category = new StoreCategory();
        $store_category($category, $user_id);

        return redirect()->route('categories.index');
    }

    /**
     * @param integer $id
     */
    public function show($id): Response
    {
        $find_category = new FindCategory();
        $category = $find_category($id);

        if ($category === null) {
            abort(404);
        }

        return Inertia::render('category-detail', ['category' => $this->toProps($category)]);
    }

    /**
     * @param integer $id
     */
    public function edit($id): Response
    {
        $find_category = new FindCategory();
        $category = $find_category($id);

        if ($category === null) {
            abort(404);
        }

        return Inertia::render('category-edit', [
            'category' => [
                ...$this->toProps($category),
                'is_archive' => (bool) $category->is_archive,
            ],
        ]);
    }

    /**
     * @param integer $id
     * @return \Illuminate\Routing\Redirector|\Illuminate\Http\RedirectResponse
     */
    public function update(UpdateCategoryRequest $request, $id)
    {
        $find_category = new FindCategory();
        $category = $find_category($id);

        if ($category === null) {
            abort(404);
        }

        $request_category = $request->makeCategory();
        $category->fill($request_category->toArray());
        $category->save();

        return redirect()->route('categories.index');
    }

    /**
     * 画面に渡すカテゴリーの項目
     *
     * @return array{id: int, name: string}
     */
    private function toProps(Category $category): array
    {
        return [
            'id' => $category->id,
            'name' => $category->name,
        ];
    }
}
