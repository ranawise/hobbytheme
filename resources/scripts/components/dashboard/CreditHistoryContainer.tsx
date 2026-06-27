import React, { useEffect, useState } from 'react';
import PageContentBlock from '@/components/elements/PageContentBlock';
import Spinner from '@/components/elements/Spinner';
import PaginationFooter from '@/components/elements/table/PaginationFooter';
import { useCreditTransactions, CreditTransaction } from '@/api/account/getCreditTransactions';
import { useFlashKey } from '@/plugins/useFlash';
import FlashMessageRender from '@/components/FlashMessageRender';

type Tab = 'purchase' | 'spend';

const typeLabel: Record<CreditTransaction['type'], string> = {
    purchase: 'Purchase',
    spend: 'Spent',
    refund: 'Refund',
};

const typeBadge: Record<CreditTransaction['type'], string> = {
    purchase: 'bg-green-900/50 text-green-400 border border-green-700/40',
    spend: 'bg-red-900/50 text-red-400 border border-red-700/40',
    refund: 'bg-blue-900/50 text-blue-400 border border-blue-700/40',
};

const amountColor: Record<CreditTransaction['type'], string> = {
    purchase: 'text-green-400',
    spend: 'text-red-400',
    refund: 'text-blue-400',
};

const amountPrefix: Record<CreditTransaction['type'], string> = {
    purchase: '+',
    spend: '-',
    refund: '+',
};

function formatDate(iso: string): string {
    return new Date(iso).toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

const TabButton = ({
    active,
    onClick,
    children,
}: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) => (
    <button
        onClick={onClick}
        style={{
            padding: '6px 16px',
            borderRadius: 6,
            border: 'none',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 600,
            transition: 'background 0.15s, color 0.15s',
            background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
            color: active ? '#f4f4f5' : '#71717a',
        }}
    >
        {children}
    </button>
);

const EmptyState = () => (
    <div
        style={{
            textAlign: 'center',
            padding: '48px 0',
            color: '#52525b',
            fontSize: 14,
        }}
    >
        No transactions found.
    </div>
);

export default () => {
    const [tab, setTab] = useState<Tab>('purchase');
    const [page, setPage] = useState(1);
    const { clearAndAddHttpError } = useFlashKey('credit-history');

    useEffect(() => {
        const prev = document.body.style.backgroundColor;
        document.body.style.backgroundColor = '#101013';
        return () => { document.body.style.backgroundColor = prev; };
    }, []);

    const { data, isValidating, error } = useCreditTransactions(page, tab);

    useEffect(() => { clearAndAddHttpError(error); }, [error]);
    useEffect(() => { setPage(1); }, [tab]);

    return (
        <PageContentBlock title={'Credit History'}>
            <FlashMessageRender byKey={'credit-history'} />

            {/* Tab bar */}
            <div
                style={{
                    display: 'flex',
                    gap: 4,
                    marginBottom: 20,
                    padding: '4px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 8,
                    width: 'fit-content',
                }}
            >
                <TabButton active={tab === 'purchase'} onClick={() => setTab('purchase')}>
                    Purchase History
                </TabButton>
                <TabButton active={tab === 'spend'} onClick={() => setTab('spend')}>
                    Spending History
                </TabButton>
            </div>

            {/* Table */}
            <div
                style={{
                    background: '#111114',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 10,
                    overflow: 'hidden',
                }}
            >
                {/* Header row */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 120px 100px 160px',
                        padding: '10px 20px',
                        borderBottom: '1px solid rgba(255,255,255,0.06)',
                        fontSize: 11,
                        fontWeight: 600,
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        color: '#52525b',
                    }}
                >
                    <span>Description</span>
                    <span>Type</span>
                    <span style={{ textAlign: 'right' }}>Amount</span>
                    <span style={{ textAlign: 'right' }}>Date</span>
                </div>

                {!data && isValidating ? (
                    <Spinner centered size={'large'} />
                ) : !data || data.items.length === 0 ? (
                    <EmptyState />
                ) : (
                    data.items.map((tx, i) => (
                        <div
                            key={tx.id}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 120px 100px 160px',
                                padding: '14px 20px',
                                borderBottom:
                                    i < data.items.length - 1
                                        ? '1px solid rgba(255,255,255,0.04)'
                                        : 'none',
                                alignItems: 'center',
                                transition: 'background 0.1s',
                            }}
                            onMouseEnter={(e) =>
                                ((e.currentTarget as HTMLElement).style.background =
                                    'rgba(255,255,255,0.02)')
                            }
                            onMouseLeave={(e) =>
                                ((e.currentTarget as HTMLElement).style.background = 'transparent')
                            }
                        >
                            <span style={{ fontSize: 13, color: '#d4d4d8', paddingRight: 16 }}>
                                {tx.description}
                            </span>
                            <span>
                                <span
                                    style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4 }}
                                    className={typeBadge[tx.type]}
                                >
                                    {typeLabel[tx.type]}
                                </span>
                            </span>
                            <span
                                style={{
                                    fontSize: 13,
                                    fontWeight: 600,
                                    textAlign: 'right',
                                }}
                                className={amountColor[tx.type]}
                            >
                                {amountPrefix[tx.type]}
                                {tx.amount.toLocaleString()}
                            </span>
                            <span
                                style={{
                                    fontSize: 12,
                                    color: '#52525b',
                                    textAlign: 'right',
                                }}
                            >
                                {formatDate(tx.created_at)}
                            </span>
                        </div>
                    ))
                )}
            </div>

            {data && data.pagination.totalPages > 1 && (
                <PaginationFooter
                    pagination={data.pagination}
                    onPageSelect={setPage}
                    className={'mt-4'}
                />
            )}
        </PageContentBlock>
    );
};
