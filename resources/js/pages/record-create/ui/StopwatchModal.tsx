import { useEffect, useState } from "react";

type Props = {
    show: boolean;
    onClose: () => void;
    // Finish を押したときに経過時間（分）を渡す
    onFinish: (minutes: number) => void;
};

// 閉じても計測を続けられるように、表示していないときも描画したままにする
export function StopwatchModal({ show, onClose, onFinish }: Props) {
    const [start, setStart] = useState<number | null>(null);
    const [current, setCurrent] = useState(0);
    const [running, setRunning] = useState(false);

    useEffect(() => {
        if (!running) {
            return;
        }

        const interval = setInterval(() => {
            setCurrent(Date.now());
        }, 1000);

        return () => {
            clearInterval(interval);
        };
    }, [running]);

    const elapsedSeconds = start === null ? 0 : (current - start) / 1000;
    const minutes = Math.trunc(elapsedSeconds / 60);
    const seconds = Math.trunc(elapsedSeconds % 60);

    return (
        <div className={show ? "" : "hidden"}>
            <div className="modal-overlay fixed inset-0 bg-black opacity-50" onClick={onClose} />
            <div
                role="dialog"
                aria-labelledby="stopwatch-title"
                className="fixed top-0 left-0 right-0 z-50 w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full flex items-center justify-center pointer-events-none"
            >
                <div className="relative w-full max-w-2xl max-h-full pointer-events-auto">
                    {/* Modal content */}
                    <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                        {/* Modal header */}
                        <div className="flex items-start justify-between p-4 border-b rounded-t dark:border-gray-600">
                            <h3 id="stopwatch-title" className="text-xl font-semibold text-gray-900 dark:text-white">
                                ストップウォッチ
                            </h3>
                            <button
                                type="button"
                                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                                onClick={onClose}
                            >
                                <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                    <path
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                                    />
                                </svg>
                                <span className="sr-only">Close modal</span>
                            </button>
                        </div>
                        {/* Modal body */}
                        <div className="p-6 space-y-6">
                            <div className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                                {minutes}分{seconds}秒
                            </div>
                        </div>
                        {/* Modal footer */}
                        <div className="flex items-center p-6 space-x-2 border-t border-gray-200 rounded-b dark:border-gray-600">
                            {start === null ? (
                                <button
                                    type="button"
                                    className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                                    onClick={() => {
                                        const now = Date.now();
                                        setStart(now);
                                        setCurrent(now);
                                        setRunning(true);
                                    }}
                                >
                                    Start
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center mr-2"
                                    onClick={() => {
                                        setRunning(false);
                                        onFinish(minutes);
                                        onClose();
                                    }}
                                >
                                    Finish
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
