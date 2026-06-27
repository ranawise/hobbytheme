import useSWR, { ConfigInterface } from 'swr';
import { AxiosError } from 'axios';
import http, { PaginatedResult } from '@/api/http';
import { useUserSWRKey } from '@/plugins/useSWRKey';

export interface CreditTransaction {
    id: number;
    type: 'purchase' | 'spend' | 'refund';
    amount: number;
    description: string;
    created_at: string;
}

function parsePaginated(data: any): PaginatedResult<CreditTransaction> {
    return {
        items: data.data as CreditTransaction[],
        pagination: {
            total: data.meta.pagination.total,
            count: data.meta.pagination.count,
            perPage: data.meta.pagination.per_page,
            currentPage: data.meta.pagination.current_page,
            totalPages: data.meta.pagination.total_pages,
        },
    };
}

export const useCreditTransactions = (
    page: number,
    type?: 'purchase' | 'spend',
    config?: ConfigInterface<PaginatedResult<CreditTransaction>, AxiosError>
) => {
    const key = useUserSWRKey(['account', 'credit-transactions', String(page), type ?? 'all']);

    return useSWR<PaginatedResult<CreditTransaction>, AxiosError>(
        key,
        async () => {
            const { data } = await http.get('/api/client/account/credit-transactions', {
                params: { page, ...(type ? { type } : {}) },
            });
            return parsePaginated(data);
        },
        { revalidateOnMount: true, revalidateOnFocus: false, ...(config || {}) }
    );
};
