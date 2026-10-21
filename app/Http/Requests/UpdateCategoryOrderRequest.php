<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCategoryOrderRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'category_order' => 'required|array',
            'category_order.*' => 'integer',
        ];
    }

    /**
     * 並び順（カテゴリー ID の配列）
     *
     * @return int[]
     */
    public function categoryOrder(): array
    {
        /** @var array<int, int|string> $order */
        $order = $this->validated('category_order');

        return array_map('intval', $order);
    }
}
