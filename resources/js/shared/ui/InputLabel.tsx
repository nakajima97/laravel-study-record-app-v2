import type { LabelHTMLAttributes } from "react";

export function InputLabel({ className = "", ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
    return <label className={`block font-medium text-sm text-gray-700 dark:text-gray-300 ${className}`} {...props} />;
}
