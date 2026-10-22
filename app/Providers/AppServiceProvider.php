<?php

namespace App\Providers;

use Illuminate\Filesystem\Filesystem;
use Illuminate\Support\ServiceProvider;
use Illuminate\View\FileViewFinder;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Inertia のページ名（例: dashboard）を FSD の pages スライスの公開 API
        // （resources/js/pages/dashboard/index.ts）として探す。assertInertia でページの存在確認に使われる
        $this->app->bind('inertia.view-finder', function ($app) {
            /** @var array<int, string> $paths */
            $paths = config('inertia.pages.paths');

            return new class ($app->make(Filesystem::class), $paths) extends FileViewFinder {
                /**
                 * @param string $name
                 * @return array<int, string>
                 */
                protected function getPossibleViewFiles($name)
                {
                    return [$name . '/index.ts'];
                }
            };
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
