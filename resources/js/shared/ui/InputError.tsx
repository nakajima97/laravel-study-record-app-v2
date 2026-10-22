type Props = {
    message?: string;
    className?: string;
};

export function InputError({ message, className = "" }: Props) {
    if (!message) {
        return null;
    }

    return (
        <ul className={`text-sm text-red-600 dark:text-red-400 space-y-1 ${className}`}>
            <li>{message}</li>
        </ul>
    );
}
