import type { route as routeFn } from "ziggy-js";

declare global {
    // @routes ディレクティブで注入される Ziggy の route()
    var route: typeof routeFn;
}

declare module "@inertiajs/core" {
    export interface InertiaConfig {
        // HandleInertiaRequests::share() で渡しているデータ
        sharedPageProps: {
            auth: {
                user: {
                    name: string;
                    email: string;
                    email_verified_at: string | null;
                } | null;
            };
            status: string | null;
        };
    }
}
