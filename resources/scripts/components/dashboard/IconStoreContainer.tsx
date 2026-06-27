import React, { useEffect, useRef, useState } from 'react';
import useSWR from 'swr';
import PageContentBlock from '@/components/elements/PageContentBlock';
import Spinner from '@/components/elements/Spinner';
import FlashMessageRender from '@/components/FlashMessageRender';
import { useFlashKey } from '@/plugins/useFlash';
import { getShop, buyIcon, ServerIcon, ShopResponse } from '@/api/account/icons';

// ── rarity styling ─────────────────────────────────────────────────────────

const RARITY_LABEL: Record<ServerIcon['rarity'], string> = {
    LIMITED:   'Limited',
    LEGENDARY: 'Legendary',
    EPIC:      'Epic',
    RARE:      'Rare',
    UNCOMMON:  'Uncommon',
    COMMON:    'Common',
};

const RARITY_COLOR: Record<ServerIcon['rarity'], string> = {
    LIMITED:   '#ef4444',
    LEGENDARY: '#f97316',
    EPIC:      '#a855f7',
    RARE:      '#3b82f6',
    UNCOMMON:  '#22c55e',
    COMMON:    '#71717a',
};

const RARITY_GLOW: Record<ServerIcon['rarity'], string> = {
    LIMITED:   'rgba(239,68,68,0.35)',
    LEGENDARY: 'rgba(249,115,22,0.35)',
    EPIC:      'rgba(168,85,247,0.3)',
    RARE:      'rgba(59,130,246,0.3)',
    UNCOMMON:  'rgba(34,197,94,0.22)',
    COMMON:    'transparent',
};

// ── countdown ──────────────────────────────────────────────────────────────

function useCountdown(resetsAt: string | undefined): string {
    const [display, setDisplay] = useState('');

    useEffect(() => {
        if (!resetsAt) return;

        const tick = () => {
            const diff = new Date(resetsAt).getTime() - Date.now();
            if (diff <= 0) { setDisplay('Refreshing...'); return; }
            const h = Math.floor(diff / 3_600_000);
            const m = Math.floor((diff % 3_600_000) / 60_000);
            const s = Math.floor((diff % 60_000) / 1_000);
            setDisplay(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
        };

        tick();
        const id = setInterval(tick, 1_000);
        return () => clearInterval(id);
    }, [resetsAt]);

    return display;
}

// ── icon card ──────────────────────────────────────────────────────────────

interface CardProps {
    icon: ServerIcon;
    onBuy: (icon: ServerIcon) => void;
    isBuying: boolean;
}

const IconCard = ({ icon, onBuy, isBuying }: CardProps) => {
    const color = RARITY_COLOR[icon.rarity];
    const glow  = RARITY_GLOW[icon.rarity];

    return (
        <div style={{
            background:    '#111114',
            border:        `1px solid ${icon.owned ? 'rgba(74,222,128,0.25)' : 'rgba(255,255,255,0.07)'}`,
            borderRadius:  12,
            padding:       '24px 16px 18px',
            display:       'flex',
            flexDirection: 'column',
            alignItems:    'center',
            gap:           12,
            position:      'relative',
            transition:    'border-color 0.2s',
        }}>
            {/* rarity stripe at the top */}
            <div style={{
                position:     'absolute',
                top:          0,
                left:         0,
                right:        0,
                height:       3,
                borderRadius: '12px 12px 0 0',
                background:   color,
                opacity:      0.7,
            }} />

            {/* owned badge */}
            {icon.owned && (
                <div style={{
                    position:     'absolute',
                    top:          10,
                    right:        10,
                    background:   'rgba(74,222,128,0.12)',
                    border:       '1px solid rgba(74,222,128,0.3)',
                    borderRadius: 4,
                    padding:      '1px 7px',
                    fontSize:     10,
                    fontWeight:   700,
                    color:        '#4ade80',
                    letterSpacing: '0.05em',
                }}>
                    OWNED
                </div>
            )}

            {/* image */}
            <div style={{
                boxShadow:    icon.owned ? `0 0 20px ${glow}` : 'none',
                borderRadius: 10,
                transition:   'box-shadow 0.3s',
            }}>
                <img
                    src={icon.image_url}
                    alt={icon.name}
                    style={{ width: 80, height: 80, objectFit: 'contain', borderRadius: 10, background: '#1a1a1e', padding: 8, display: 'block' }}
                />
            </div>

            {/* name + rarity */}
            <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#e4e4e7', margin: '0 0 3px 0' }}>{icon.name}</p>
                <p style={{ fontSize: 11, color, fontWeight: 700, margin: 0, letterSpacing: '0.06em' }}>
                    {RARITY_LABEL[icon.rarity]}
                </p>
            </div>

            {/* buy / owned */}
            {icon.owned ? (
                <div style={{ fontSize: 13, color: '#4ade80', fontWeight: 600 }}>✓ In your collection</div>
            ) : (
                <button
                    onClick={() => onBuy(icon)}
                    disabled={isBuying}
                    style={{
                        width:        '100%',
                        padding:      '9px 0',
                        borderRadius: 8,
                        border:       'none',
                        cursor:       isBuying ? 'wait' : 'pointer',
                        fontSize:     13,
                        fontWeight:   700,
                        background:   isBuying ? 'rgba(255,255,255,0.06)' : '#e4e4e7',
                        color:        isBuying ? '#52525b' : '#09090b',
                        transition:   'background 0.15s, opacity 0.15s',
                        opacity:      isBuying ? 0.7 : 1,
                    }}
                >
                    {isBuying ? '...' : `${icon.credit_cost.toLocaleString()} credits`}
                </button>
            )}
        </div>
    );
};

// ── main component ─────────────────────────────────────────────────────────

export default () => {
    const { clearFlashes, addFlash, clearAndAddHttpError } = useFlashKey('icon-store');
    const [buying, setBuying] = useState<string | null>(null);

    useEffect(() => {
        const prev = document.body.style.backgroundColor;
        document.body.style.backgroundColor = '#101013';
        return () => { document.body.style.backgroundColor = prev; };
    }, []);

    const { data, error, mutate } = useSWR<ShopResponse>('account:icon-shop', getShop, {
        revalidateOnMount: true,
        revalidateOnFocus: false,
    });

    useEffect(() => { if (error) clearAndAddHttpError(error); }, [error]);

    const countdown = useCountdown(data?.resets_at);

    const handleBuy = async (icon: ServerIcon) => {
        if (buying) return;
        clearFlashes();
        setBuying(icon.id);
        try {
            const res = await buyIcon(icon.id);
            addFlash({ type: 'success', title: 'Purchased!', message: `"${icon.name}" added to your collection. Balance: ${res.credits.toLocaleString()} credits` });
            mutate();
        } catch (err: any) {
            const msg = err?.response?.data?.error
                || err?.response?.data?.errors?.[0]?.detail
                || 'Purchase failed.';
            addFlash({ type: 'error', title: 'Error', message: msg });
        } finally {
            setBuying(null);
        }
    };

    return (
        <PageContentBlock title={'Daily Icon Shop'}>
            <FlashMessageRender byKey={'icon-store'} />

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                    <p style={{ fontSize: 15, fontWeight: 600, color: '#f4f4f5', margin: '0 0 2px 0' }}>Today's Icons</p>
                    <p style={{ fontSize: 12, color: '#52525b', margin: 0 }}>
                        5 icons available each day. Owned icons work on all your servers.
                    </p>
                </div>
                {countdown && (
                    <div style={{
                        background: 'rgba(255,255,255,0.04)',
                        border:     '1px solid rgba(255,255,255,0.07)',
                        borderRadius: 8,
                        padding:    '8px 14px',
                        textAlign:  'center',
                    }}>
                        <p style={{ fontSize: 10, color: '#52525b', margin: '0 0 2px 0', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Resets in</p>
                        <p style={{ fontSize: 16, fontWeight: 700, color: '#e4e4e7', margin: 0, fontVariantNumeric: 'tabular-nums' }}>
                            {countdown}
                        </p>
                    </div>
                )}
            </div>

            {/* Cards */}
            {!data ? (
                <Spinner centered size={'large'} />
            ) : data.data.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#52525b', fontSize: 14 }}>
                    No icons in the shop today. An admin needs to create some.
                </div>
            ) : (
                <div style={{
                    display:               'grid',
                    gridTemplateColumns:   'repeat(auto-fill, minmax(180px, 1fr))',
                    gap:                   14,
                }}>
                    {data.data.map((icon) => (
                        <IconCard
                            key={icon.id}
                            icon={icon}
                            onBuy={handleBuy}
                            isBuying={buying === icon.id}
                        />
                    ))}
                </div>
            )}
        </PageContentBlock>
    );
};
