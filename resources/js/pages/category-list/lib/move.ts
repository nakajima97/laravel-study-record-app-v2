/**
 * ドラッグしたカテゴリーを並び順の中で移動する。
 * 並び順全体の先頭にドロップしたときは前に、それ以外はドロップ先の後ろに入れる
 */
export function move(order: number[], draggedId: number, targetId: number): number[] {
    if (draggedId === targetId || !order.includes(draggedId)) {
        return order;
    }

    const isFirst = order.indexOf(targetId) === 0;
    const rest = order.filter((id) => id !== draggedId);
    const targetIndex = rest.indexOf(targetId);
    if (targetIndex === -1) {
        return order;
    }

    rest.splice(isFirst ? targetIndex : targetIndex + 1, 0, draggedId);
    return rest;
}
