<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CategoryOrderController;
use App\Http\Controllers\RecordController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\CategoryArchiveController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\AnalysisController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('/dashboard', [DashboardController::class, 'index'])->middleware(['auth', 'verified'])->name('dashboard');

    Route::resource('categories', CategoryController::class);
    Route::post('/categories/archive/{id}', [CategoryArchiveController::class, 'store'])->name('categories.archive.store');
    Route::delete('/categories/archive/{id}', [CategoryArchiveController::class, 'delete'])->name('categories.archive.destroy');
    // カテゴリーの並び替え（画面の JS から送る。ログインユーザーの並び順だけを更新する）
    Route::patch('/category-order', [CategoryOrderController::class, 'update'])->name('category_order.update');

    Route::get('/records/create', [RecordController::class, 'create'])->name('records.create');
    Route::post('/records', [RecordController::class, 'store'])->name('records.store');

    Route::get('/records/analysis', [AnalysisController::class, 'index'])->name('records.analysis');
});

Route::middleware('guest')->group(function () {
    Route::get('/', [AuthenticatedSessionController::class, 'create']);
});

require __DIR__ . '/auth.php';
