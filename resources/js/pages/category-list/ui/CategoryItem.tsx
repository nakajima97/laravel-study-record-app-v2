import { router } from "@inertiajs/react";
import type { DragEvent } from "react";
import type { Category } from "@/entities/category";

type Props = {
    category: Category;
    onDropOn: (draggedId: number, targetId: number) => void;
};

export function CategoryItem({ category, onDropOn }: Props) {
    return (
        <li
            className="border-b border-gray-700"
            draggable
            onDragStart={(event: DragEvent) => {
                event.dataTransfer.setData("text/plain", category.id.toString());
                event.dataTransfer.dropEffect = "move";
            }}
            // drop を受け付けるために既定の動作を止める
            onDragEnter={(event) => {
                event.preventDefault();
            }}
            onDragOver={(event) => {
                event.preventDefault();
            }}
            onDrop={(event) => {
                event.preventDefault();
                onDropOn(Number(event.dataTransfer.getData("text/plain")), category.id);
            }}
        >
            <div
                className="px-1 py-1 sm:px-6 cursor-pointer"
                onClick={() => {
                    router.visit(route("categories.show", category.id));
                }}
            >
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">{category.name}</h3>
            </div>
        </li>
    );
}
