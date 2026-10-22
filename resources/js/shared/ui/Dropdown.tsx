import { useEffect, useRef, useState, type ReactNode } from "react";

type Props = {
    trigger: ReactNode;
    children: ReactNode;
};

// 右寄せ・幅 w-48 のドロップダウン（ナビゲーションのユーザーメニュー用）
export function Dropdown({ trigger, children }: Props) {
    const [open, setOpen] = useState(false);
    const root = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) {
            return;
        }

        const onClickOutside = (event: MouseEvent) => {
            if (!root.current?.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("click", onClickOutside);

        return () => {
            document.removeEventListener("click", onClickOutside);
        };
    }, [open]);

    return (
        <div className="relative" ref={root}>
            <div
                onClick={() => {
                    setOpen((value) => !value);
                }}
            >
                {trigger}
            </div>

            {open && (
                <div
                    className="absolute z-50 mt-2 w-48 rounded-md shadow-lg origin-top-right right-0"
                    onClick={() => {
                        setOpen(false);
                    }}
                >
                    <div className="rounded-md ring-1 ring-black ring-opacity-5 py-1 bg-white dark:bg-gray-700">{children}</div>
                </div>
            )}
        </div>
    );
}

export const dropdownLinkClassName =
    "block w-full px-4 py-2 text-left text-sm leading-5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-800 transition duration-150 ease-in-out";
