import { useEffect, useRef, type ReactNode } from "react";

const maxWidthClasses = {
    sm: "sm:max-w-sm",
    md: "sm:max-w-md",
    lg: "sm:max-w-lg",
    xl: "sm:max-w-xl",
    "2xl": "sm:max-w-2xl",
};

type Props = {
    show: boolean;
    onClose: () => void;
    maxWidth?: keyof typeof maxWidthClasses;
    // 開いたときに最初の入力欄にフォーカスする
    focusable?: boolean;
    children: ReactNode;
};

export function Modal({ show, onClose, maxWidth = "2xl", focusable = false, children }: Props) {
    const panel = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!show) {
            return;
        }

        document.body.classList.add("overflow-y-hidden");
        if (focusable) {
            panel.current?.querySelector<HTMLElement>("input:not([type='hidden']), button, a, textarea, select")?.focus();
        }

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };
        window.addEventListener("keydown", onKeyDown);

        return () => {
            document.body.classList.remove("overflow-y-hidden");
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [show, focusable, onClose]);

    if (!show) {
        return null;
    }

    return (
        <div className="fixed inset-0 overflow-y-auto px-4 py-6 sm:px-0 z-50">
            <div className="fixed inset-0 transform transition-all" onClick={onClose}>
                <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75" />
            </div>

            <div
                ref={panel}
                role="dialog"
                aria-modal="true"
                className={`mb-6 bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-xl transform transition-all sm:w-full ${maxWidthClasses[maxWidth]} sm:mx-auto`}
            >
                {children}
            </div>
        </div>
    );
}
