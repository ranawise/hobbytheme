import React, { useEffect, useState } from 'react';
import tw from 'twin.macro';
import styled from 'styled-components/macro';
import useSWR from 'swr';
import { ShoppingCart, CheckCircle, AlertCircle, Zap, Star, Crown, Check } from 'lucide-react';
import PageContentBlock from '@/components/elements/PageContentBlock';
import Spinner from '@/components/elements/Spinner';
import { getTebexPackages, createTebexCheckout, TebexPackage } from '@/api/account/tebex';
import { getShop, buyIcon, ServerIcon, ShopResponse } from '@/api/account/icons';
import { useLocation } from 'react-router-dom';

/* ── helpers ── */

const formatPrice = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

const creditsAmount = (name: string): string => {
    const m = name.match(/[—–-]\s*([\d,]+)\s*$/);
    return m ? m[1] : '—';
};

const rankTier = (name: string): string =>
    name.replace(/^HobbyServers\s+/i, '').replace(/^Network Rank\s*[—–-]\s*/i, '').replace(/\s*\(.*?\)/, '').trim();

const extractBullets = (html: string): string[] =>
    (html.match(/<li>([\s\S]*?)<\/li>/g) || [])
        .map((li) => li.replace(/<[^>]+>/g, '').trim())
        .filter(Boolean)
        .slice(0, 3);

/* ── config ── */

const MOST_POPULAR_ID = 7482899;

const CREDIT_TAGLINES: Record<number, string> = {
    7482898: 'Good for trying things out',
    7482899: 'Most picked by members',
    7482900: 'A solid top-up',
    7482901: 'Stock up and save',
    7482902: 'Maximum value',
};

const RANK_ACCENTS: Record<string, string> = {
    Core:    '#94a3b8',
    Hobby:   '#22d3ee',
    Pro:     '#60a5fa',
    Plus:    '#a78bfa',
    Premium: '#fbbf24',
};

const RANK_ICONS: Record<string, React.ReactNode> = {
    Core:    <Zap size={15} />,
    Hobby:   <Star size={15} />,
    Pro:     <Star size={15} />,
    Plus:    <Crown size={15} />,
    Premium: <Crown size={15} />,
};

const RARITY_COLOR: Record<ServerIcon['rarity'], string> = {
    LIMITED:   '#ef4444',
    LEGENDARY: '#f97316',
    EPIC:      '#a855f7',
    RARE:      '#3b82f6',
    UNCOMMON:  '#22c55e',
    COMMON:    '#71717a',
};

const RARITY_LABEL: Record<ServerIcon['rarity'], string> = {
    LIMITED:   'Limited',
    LEGENDARY: 'Legendary',
    EPIC:      'Epic',
    RARE:      'Rare',
    UNCOMMON:  'Uncommon',
    COMMON:    'Common',
};

const RARITY_GLOW: Record<ServerIcon['rarity'], string> = {
    LIMITED:   'rgba(239,68,68,0.35)',
    LEGENDARY: 'rgba(249,115,22,0.35)',
    EPIC:      'rgba(168,85,247,0.3)',
    RARE:      'rgba(59,130,246,0.3)',
    UNCOMMON:  'rgba(34,197,94,0.22)',
    COMMON:    'transparent',
};

/* ── countdown hook ── */

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

/* ── styled ── */

const Card = styled.div<{ $popular?: boolean }>`
    ${tw`relative flex flex-col rounded-xl p-5 transition-all duration-150`};
    background: ${(p) => (p.$popular ? 'rgba(228,89,58,0.05)' : '#101013')};
    border: 1px solid ${(p) => (p.$popular ? 'rgba(228,89,58,0.45)' : 'rgba(255,255,255,0.08)')};
    &:hover {
        border-color: ${(p) => (p.$popular ? 'rgba(228,89,58,0.65)' : 'rgba(255,255,255,0.14)')};
        transform: translateY(-1px);
    }
`;

const PopularBadge = styled.span`
    ${tw`absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-semibold px-3 py-0.5 rounded-full whitespace-nowrap`};
    background: #e4593a;
    color: #fff;
`;

const Divider = styled.div`
    border-top: 1px solid rgba(255,255,255,0.07);
    ${tw`my-4`};
`;

const BuyBtn = styled.button<{ $popular?: boolean }>`
    ${tw`w-full py-2 rounded-lg text-sm font-medium transition-colors duration-150 flex items-center justify-center gap-1.5 mt-auto`};
    ${(p) =>
        p.$popular
            ? `background:#e4593a; color:#fff; &:hover:not(:disabled){background:#cf3d1c;}`
            : `background:rgba(255,255,255,0.05); color:#d4d4d8; border:1px solid rgba(255,255,255,0.08);
               &:hover:not(:disabled){background:rgba(255,255,255,0.08); border-color:rgba(255,255,255,0.14);}`}
    &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const RankBuyBtn = styled.button<{ $accent: string }>`
    ${tw`w-full py-2 rounded-lg text-sm font-medium transition-all duration-150 flex items-center justify-center gap-1.5 mt-auto`};
    background: ${(p) => p.$accent}18;
    color: ${(p) => p.$accent};
    border: 1px solid ${(p) => p.$accent}30;
    &:hover:not(:disabled) { background: ${(p) => p.$accent}28; border-color: ${(p) => p.$accent}55; }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const Grid = styled.div<{ $cols: number }>`
    display: grid;
    gap: 0.875rem;
    grid-template-columns: repeat(${(p) => p.$cols}, minmax(0, 1fr));
    @media (max-width: 860px) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    @media (max-width: 500px) { grid-template-columns: 1fr; }
`;

const IconGrid = styled.div`
    display: grid;
    gap: 0.875rem;
    grid-template-columns: repeat(5, 1fr);
    @media (max-width: 860px) { grid-template-columns: repeat(3, 1fr); }
    @media (max-width: 500px) { grid-template-columns: repeat(2, 1fr); }
`;

const SectionLabel = styled.p`
    ${tw`text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3`};
`;

const Banner = styled.div<{ $ok: boolean }>`
    ${tw`flex items-center gap-2.5 rounded-lg px-4 py-3 mb-6 text-sm`};
    ${(p) =>
        p.$ok
            ? 'background:rgba(52,211,153,.07);border:1px solid rgba(52,211,153,.2);color:#6ee7b7;'
            : 'background:rgba(228,89,58,.07);border:1px solid rgba(228,89,58,.2);color:#fca5a5;'}
`;

/* ── credits card ── */

const CreditsCard = ({ pkg, onBuy, busy }: { pkg: TebexPackage; onBuy(id: number): void; busy: boolean }) => {
    const popular = pkg.id === MOST_POPULAR_ID;
    const amount = creditsAmount(pkg.name);
    const tagline = CREDIT_TAGLINES[pkg.id] ?? '';

    return (
        <Card $popular={popular}>
            {popular && <PopularBadge>Most Popular</PopularBadge>}
            <div css={tw`mt-1 mb-1`}>
                <p css={tw`text-3xl font-bold text-white leading-none`}>{amount}</p>
                <p css={tw`text-xs text-neutral-500 mt-1`}>Platform Credits</p>
            </div>
            <Divider />
            <p css={tw`text-2xl font-semibold text-neutral-100 mb-1`}>{formatPrice(pkg.total_price)}</p>
            {tagline && <p css={tw`text-xs text-neutral-500 mb-4`}>{tagline}</p>}
            <div css={tw`flex flex-col gap-1.5 mb-4`}>
                <div css={tw`flex items-center gap-1.5 text-xs text-neutral-400`}>
                    <Check size={11} css={tw`text-neutral-600`} />
                    Never expire
                </div>
                <div css={tw`flex items-center gap-1.5 text-xs text-neutral-400`}>
                    <Check size={11} css={tw`text-neutral-600`} />
                    Applied instantly
                </div>
            </div>
            <BuyBtn $popular={popular} disabled={busy} onClick={() => onBuy(pkg.id)}>
                {busy ? <Spinner size={'tiny'} /> : <ShoppingCart size={13} />}
                {busy ? 'Loading…' : 'Buy Now'}
            </BuyBtn>
        </Card>
    );
};

/* ── rank card ── */

const RankCard = ({ pkg, onBuy, busy }: { pkg: TebexPackage; onBuy(id: number): void; busy: boolean }) => {
    const tier = rankTier(pkg.name);
    const accent = RANK_ACCENTS[tier] ?? '#94a3b8';
    const icon = RANK_ICONS[tier] ?? <Star size={15} />;
    const isMonthly = /monthly/i.test(pkg.name);
    const bullets = extractBullets(pkg.description);

    return (
        <Card>
            <div css={tw`flex items-center gap-2 mt-1 mb-1`}>
                <span style={{ color: accent }}>{icon}</span>
                <p css={tw`text-base font-semibold text-white`}>{tier}</p>
            </div>
            <p css={tw`text-xs text-neutral-500`}>{isMonthly ? 'Monthly subscription' : 'Permanent rank'}</p>
            <Divider />
            <p css={tw`text-2xl font-semibold text-neutral-100 mb-4`}>
                {formatPrice(pkg.total_price)}
                {isMonthly && <span css={tw`text-sm text-neutral-500 font-normal ml-1`}>/mo</span>}
            </p>
            <div css={tw`flex flex-col gap-1.5 mb-4`}>
                {bullets.map((b, i) => (
                    <div key={i} css={tw`flex items-start gap-1.5`}>
                        <Check size={11} style={{ color: accent, marginTop: 2, flexShrink: 0 }} />
                        <span css={tw`text-xs text-neutral-400 leading-snug`}>{b}</span>
                    </div>
                ))}
            </div>
            <RankBuyBtn $accent={accent} disabled={busy} onClick={() => onBuy(pkg.id)}>
                {busy ? <Spinner size={'tiny'} /> : <ShoppingCart size={13} />}
                {busy ? 'Loading…' : 'Purchase'}
            </RankBuyBtn>
        </Card>
    );
};

/* ── icon card ── */

const IconCard = ({
    icon,
    onBuy,
    isBuying,
}: {
    icon: ServerIcon;
    onBuy: (icon: ServerIcon) => void;
    isBuying: boolean;
}) => {
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
            {/* rarity stripe */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0,
                height: 3, borderRadius: '12px 12px 0 0',
                background: color, opacity: 0.7,
            }} />

            {/* owned badge */}
            {icon.owned && (
                <div style={{
                    position: 'absolute', top: 10, right: 10,
                    background: 'rgba(74,222,128,0.12)',
                    border: '1px solid rgba(74,222,128,0.3)',
                    borderRadius: 4, padding: '1px 7px',
                    fontSize: 10, fontWeight: 700, color: '#4ade80', letterSpacing: '0.05em',
                }}>OWNED</div>
            )}

            {/* image */}
            <div style={{ boxShadow: icon.owned ? `0 0 20px ${glow}` : 'none', borderRadius: 10, transition: 'box-shadow 0.3s' }}>
                <img
                    src={icon.image_url}
                    alt={icon.name}
                    style={{ width: 96, height: 96, objectFit: 'contain', borderRadius: 10, background: '#1a1a1e', padding: 10, display: 'block', imageRendering: 'pixelated' }}
                />
            </div>

            {/* name + rarity */}
            <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#e4e4e7', margin: '0 0 3px 0' }}>{icon.name}</p>
                <p style={{ fontSize: 11, color, fontWeight: 700, margin: 0, letterSpacing: '0.06em' }}>
                    {RARITY_LABEL[icon.rarity]}
                </p>
            </div>

            {/* action */}
            {icon.owned ? (
                <div style={{ fontSize: 13, color: '#4ade80', fontWeight: 600, width: '100%', textAlign: 'center' }}>✓ In your collection</div>
            ) : (
                <BuyBtn onClick={() => onBuy(icon)} disabled={isBuying}>
                    {isBuying ? <Spinner size={'tiny'} /> : <ShoppingCart size={13} />}
                    {isBuying ? 'Loading…' : `${icon.credit_cost.toLocaleString()} credits`}
                </BuyBtn>
            )}
        </div>
    );
};

/* ── username modal ── */

const UsernameModal = ({
    username, error, onChange, onConfirm, onCancel,
}: {
    username: string;
    error: string | null;
    onChange: (v: string) => void;
    onConfirm: () => void;
    onCancel: () => void;
}) => {
    const inputRef = React.useRef<HTMLInputElement>(null);

    useEffect(() => { inputRef.current?.focus(); }, []);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onCancel();
            if (e.key === 'Enter') onConfirm();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onConfirm, onCancel]);

    return (
        <div
            onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
            style={{
                position: 'fixed', inset: 0, zIndex: 1000,
                background: 'rgba(0,0,0,0.65)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 16,
            }}
        >
            <div style={{
                background: '#111114',
                border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: 14,
                padding: '24px 24px 20px',
                width: '100%',
                maxWidth: 360,
            }}>
                <p style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 600, color: '#f4f4f5' }}>
                    Enter your Minecraft username
                </p>
                <p style={{ margin: '0 0 18px', fontSize: 12, color: '#52525b' }}>
                    The rank will be applied to this in-game account once payment is confirmed.
                </p>

                <input
                    ref={inputRef}
                    type={'text'}
                    placeholder={'YourUsername'}
                    value={username}
                    onChange={(e) => onChange(e.target.value)}
                    maxLength={16}
                    style={{
                        display: 'block',
                        width: '100%',
                        padding: '9px 12px',
                        background: 'rgba(255,255,255,0.04)',
                        border: `1px solid ${error ? 'rgba(248,113,113,0.5)' : 'rgba(255,255,255,0.09)'}`,
                        borderRadius: 8,
                        color: '#e4e4e7',
                        fontSize: 14,
                        outline: 'none',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.15s',
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(99,102,241,0.55)')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = error ? 'rgba(248,113,113,0.5)' : 'rgba(255,255,255,0.09)')}
                />
                {error && (
                    <p style={{ margin: '6px 0 0', fontSize: 11, color: '#f87171' }}>{error}</p>
                )}

                <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
                    <button
                        onClick={onCancel}
                        style={{
                            flex: 1, padding: '9px 0', borderRadius: 8, fontSize: 13, fontWeight: 500,
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            color: '#71717a', cursor: 'pointer',
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        style={{
                            flex: 2, padding: '9px 0', borderRadius: 8, fontSize: 13, fontWeight: 600,
                            background: '#e4593a', border: 'none',
                            color: '#fff', cursor: 'pointer',
                        }}
                    >
                        Continue to checkout →
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ── page ── */

export default () => {
    const { search } = useLocation();
    const isSuccess = new URLSearchParams(search).get('success') === '1';

    // Tebex state
    const [packages, setPackages]           = useState<TebexPackage[]>([]);
    const [fetchErr, setFetchErr]           = useState(false);
    const [loading, setLoading]             = useState(true);
    const [buyingId, setBuyingId]           = useState<number | null>(null);
    const [buyErr, setBuyErr]               = useState<string | null>(null);
    // Rank username modal
    const [pendingRankId, setPendingRankId] = useState<number | null>(null);
    const [minecraftUsername, setMcUser]    = useState('');
    const [usernameErr, setUsernameErr]     = useState<string | null>(null);

    // Icon shop state
    const [iconBuying, setIconBuying] = useState<string | null>(null);
    const [iconMsg, setIconMsg]       = useState<{ ok: boolean; text: string } | null>(null);

    useEffect(() => {
        const prev = document.body.style.backgroundColor;
        document.body.style.backgroundColor = '#101013';
        return () => { document.body.style.backgroundColor = prev; };
    }, []);

    useEffect(() => {
        getTebexPackages()
            .then(setPackages)
            .catch(() => setFetchErr(true))
            .finally(() => setLoading(false));
    }, []);

    const { data: shopData, mutate: mutateShop } = useSWR<ShopResponse>(
        'account:icon-shop',
        getShop,
        { revalidateOnMount: true, revalidateOnFocus: false },
    );

    const countdown = useCountdown(shopData?.resets_at);

    const handleBuy = async (id: number) => {
        setBuyingId(id);
        setBuyErr(null);
        try {
            const url = await createTebexCheckout(id);
            window.open(url, '_blank', 'noopener,noreferrer');
        } catch {
            setBuyErr('Checkout failed — please try again.');
        } finally {
            setBuyingId(null);
        }
    };

    // Step 1: clicking Purchase on a rank card opens the username modal
    const handleRankBuy = (id: number) => {
        setPendingRankId(id);
        setMcUser('');
        setUsernameErr(null);
    };

    // Step 2: confirming inside the modal triggers checkout
    const confirmRankBuy = async () => {
        const username = minecraftUsername.trim();
        if (!username) {
            setUsernameErr('Enter your Minecraft username.');
            return;
        }
        if (!/^[A-Za-z0-9_]{1,16}$/.test(username)) {
            setUsernameErr('Letters, numbers, and underscores only — max 16 characters.');
            return;
        }
        setBuyingId(pendingRankId);
        setBuyErr(null);
        setPendingRankId(null);
        try {
            const url = await createTebexCheckout(pendingRankId!, username);
            window.open(url, '_blank', 'noopener,noreferrer');
        } catch {
            setBuyErr('Checkout failed — please try again.');
        } finally {
            setBuyingId(null);
        }
    };

    const handleIconBuy = async (icon: ServerIcon) => {
        if (iconBuying) return;
        setIconMsg(null);
        setIconBuying(icon.id);
        try {
            const res = await buyIcon(icon.id);
            setIconMsg({ ok: true, text: `"${icon.name}" added to your collection. Balance: ${res.credits.toLocaleString()} credits` });
            mutateShop();
        } catch (err: any) {
            const text = err?.response?.data?.error
                || err?.response?.data?.errors?.[0]?.detail
                || 'Purchase failed.';
            setIconMsg({ ok: false, text });
        } finally {
            setIconBuying(null);
        }
    };

    const credits = packages.filter((p) => p.category.name === 'Platform Credits');
    const ranks   = packages.filter((p) => p.category.name === 'Network Ranks');

    return (
        <>
        <PageContentBlock title={'Store'}>
            <div css={tw`flex flex-wrap gap-2 justify-between items-end mb-6`}>
                <div>
                    <h1 css={tw`text-2xl font-bold text-white`}>Store</h1>
                    <p css={tw`text-sm text-neutral-400 mt-1`}>Credits, ranks, and server icons for HobbyServers.</p>
                </div>
            </div>

            {isSuccess && (
                <Banner $ok>
                    <CheckCircle size={15} />
                    Purchase complete — your order will be applied within a few minutes.
                </Banner>
            )}
            {buyErr && (
                <Banner $ok={false}>
                    <AlertCircle size={15} />
                    {buyErr}
                </Banner>
            )}

            {loading ? (
                <Spinner centered size={'large'} />
            ) : fetchErr ? (
                <p css={tw`text-center text-sm text-neutral-500 py-16`}>Failed to load — please refresh.</p>
            ) : (
                <>
                    {credits.length > 0 && (
                        <div css={tw`mb-10`}>
                            <SectionLabel>Platform Credits</SectionLabel>
                            <Grid $cols={Math.min(credits.length, 5)}>
                                {credits.map((pkg) => (
                                    <CreditsCard key={pkg.id} pkg={pkg} onBuy={handleBuy} busy={buyingId !== null} />
                                ))}
                            </Grid>
                        </div>
                    )}

                    {ranks.length > 0 && (
                        <div css={tw`mb-10`}>
                            <SectionLabel>Network Ranks</SectionLabel>
                            <Grid $cols={Math.min(ranks.length, 5)}>
                                {ranks.map((pkg) => (
                                    <RankCard key={pkg.id} pkg={pkg} onBuy={handleRankBuy} busy={buyingId !== null} />
                                ))}
                            </Grid>
                        </div>
                    )}

                    {/* Daily Icon Shop */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                            <SectionLabel css={tw`mb-0`} style={{ flexShrink: 0 }}>Daily Icon Shop</SectionLabel>
                            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
                            {countdown && (
                                <div style={{
                                    background: 'rgba(255,255,255,0.04)',
                                    border: '1px solid rgba(255,255,255,0.07)',
                                    borderRadius: 8,
                                    padding: '5px 12px',
                                    textAlign: 'center',
                                    flexShrink: 0,
                                }}>
                                    <p style={{ fontSize: 9, color: '#52525b', margin: '0 0 1px 0', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Resets in</p>
                                    <p style={{ fontSize: 14, fontWeight: 700, color: '#e4e4e7', margin: 0, fontVariantNumeric: 'tabular-nums' }}>
                                        {countdown}
                                    </p>
                                </div>
                            )}
                        </div>
                        <p css={tw`text-xs text-neutral-600 mb-4`}>
                            5 icons per day — owned icons work across all your servers.
                        </p>

                        {iconMsg && (
                            <Banner $ok={iconMsg.ok}>
                                {iconMsg.ok ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
                                {iconMsg.text}
                            </Banner>
                        )}

                        {!shopData ? (
                            <Spinner centered size={'large'} />
                        ) : shopData.data.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '48px 0', color: '#52525b', fontSize: 14 }}>
                                No icons in the shop today.
                            </div>
                        ) : (
                            <IconGrid>
                                {shopData.data.map((icon) => (
                                    <IconCard
                                        key={icon.id}
                                        icon={icon}
                                        onBuy={handleIconBuy}
                                        isBuying={iconBuying === icon.id}
                                    />
                                ))}
                            </IconGrid>
                        )}
                    </div>

                    <p css={tw`text-xs text-neutral-700 text-center mt-8`}>
                        Payments processed securely by Tebex · Delivery is fully automated
                    </p>
                </>
            )}
        </PageContentBlock>

        {/* Rank username modal */}
        {pendingRankId !== null && (
            <UsernameModal
                username={minecraftUsername}
                error={usernameErr}
                onChange={(v) => { setMcUser(v); setUsernameErr(null); }}
                onConfirm={confirmRankBuy}
                onCancel={() => setPendingRankId(null)}
            />
        )}
        </>
    );
};
