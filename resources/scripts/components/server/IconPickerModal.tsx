import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { ServerContext } from '@/state/server';
import { getOwnedIcons, OwnedIcon } from '@/api/account/icons';
import { setServerIcon } from '@/api/server/customize';
import Spinner from '@/components/elements/Spinner';

const DEFAULT_ICON = 'https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.21.1/assets/minecraft/textures/item/oak_sign.png';

const RARITY_COLOR: Record<string, string> = {
    LIMITED:   '#ef4444',
    LEGENDARY: '#f97316',
    EPIC:      '#a855f7',
    RARE:      '#3b82f6',
    UNCOMMON:  '#22c55e',
    COMMON:    '#71717a',
};

interface Props {
    currentIconUrl: string | null;
    onClose: () => void;
    onChanged: (newUrl: string | null) => void;
}

export default ({ currentIconUrl, onClose, onChanged }: Props) => {
    const uuid = ServerContext.useStoreState((s) => s.server.data!.id);

    const [icons, setIcons]     = useState<OwnedIcon[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving]   = useState<string | null>(null);
    const [error, setError]     = useState<string | null>(null);

    useEffect(() => {
        getOwnedIcons()
            .then(setIcons)
            .catch(() => setError('Failed to load icons.'))
            .finally(() => setLoading(false));
    }, []);

    const onBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose();
    };

    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    const equip = async (iconId: string | null, imageUrl: string | null) => {
        setSaving(iconId ?? 'clear');
        setError(null);
        try {
            await setServerIcon(uuid, iconId);
            onChanged(imageUrl);
            onClose();
        } catch (err: any) {
            setError(err?.response?.data?.error || 'Failed to update icon.');
        } finally {
            setSaving(null);
        }
    };

    const isCurrent = (url: string | null) => {
        const effective = currentIconUrl ?? DEFAULT_ICON;
        return (url ?? DEFAULT_ICON) === effective;
    };

    return (
        <div
            onClick={onBackdrop}
            style={{
                position: 'fixed', inset: 0, zIndex: 1000,
                background: 'rgba(0,0,0,0.7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 16,
            }}
        >
            <div style={{
                background: '#111114',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 14,
                width: '100%',
                maxWidth: 480,
                maxHeight: '80vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '16px 20px',
                    borderBottom: '1px solid rgba(255,255,255,0.07)',
                }}>
                    <div>
                        <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#f4f4f5' }}>Change Server Icon</p>
                        <p style={{ margin: '2px 0 0', fontSize: 12, color: '#52525b' }}>Select an icon from your collection</p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: '#71717a', padding: 4, borderRadius: 6,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#e4e4e7')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#71717a')}
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div style={{ overflowY: 'auto', padding: 20, flex: 1 }}>
                    {error && (
                        <p style={{ fontSize: 12, color: '#fca5a5', marginBottom: 12, padding: '8px 12px', background: 'rgba(228,89,58,0.08)', borderRadius: 6, border: '1px solid rgba(228,89,58,0.2)' }}>
                            {error}
                        </p>
                    )}

                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
                            <Spinner size={'large'} />
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                            <IconTile
                                imageUrl={DEFAULT_ICON}
                                label={'Default'}
                                active={isCurrent(null)}
                                saving={saving === 'clear'}
                                anyBusy={saving !== null}
                                onClick={() => equip(null, null)}
                            />

                            {icons.length === 0 ? (
                                <div style={{ gridColumn: 'span 3', display: 'flex', alignItems: 'center', padding: '0 12px', color: '#52525b', fontSize: 12 }}>
                                    No icons yet —{' '}
                                    <a href={'/store'} style={{ color: '#818cf8', textDecoration: 'none', marginLeft: 4 }}>visit the store →</a>
                                </div>
                            ) : (
                                icons.map((icon) => (
                                    <IconTile
                                        key={icon.id}
                                        imageUrl={icon.image_url}
                                        label={icon.name}
                                        rarity={icon.rarity}
                                        active={isCurrent(icon.image_url)}
                                        saving={saving === icon.id}
                                        anyBusy={saving !== null}
                                        onClick={() => equip(icon.id, icon.image_url)}
                                    />
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

function IconTile({
    imageUrl, label, rarity, active, saving, anyBusy, onClick,
}: {
    imageUrl: string;
    label: string;
    rarity?: string;
    active: boolean;
    saving: boolean;
    anyBusy: boolean;
    onClick: () => void;
}) {
    const color = rarity ? (RARITY_COLOR[rarity] ?? '#71717a') : '#52525b';

    return (
        <button
            onClick={onClick}
            disabled={anyBusy}
            title={label}
            style={{
                background: active ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.02)',
                border: `2px solid ${active ? 'rgba(99,102,241,0.55)' : 'rgba(255,255,255,0.07)'}`,
                borderRadius: 10,
                padding: 10,
                cursor: anyBusy ? 'not-allowed' : 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                opacity: anyBusy && !saving ? 0.5 : 1,
                transition: 'border-color 0.15s, background 0.15s',
                position: 'relative',
            }}
            onMouseEnter={(e) => {
                if (!active && !anyBusy) {
                    e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)';
                    e.currentTarget.style.background = 'rgba(99,102,241,0.04)';
                }
            }}
            onMouseLeave={(e) => {
                if (!active) {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                }
            }}
        >
            {saving ? (
                <div style={{ width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Spinner size={'small'} />
                </div>
            ) : (
                <img
                    src={imageUrl}
                    alt={label}
                    style={{ width: 48, height: 48, objectFit: 'contain', imageRendering: 'pixelated', display: 'block' }}
                />
            )}
            <p style={{
                margin: 0, fontSize: 10, fontWeight: 500,
                color: active ? '#a5b4fc' : '#71717a',
                textAlign: 'center', lineHeight: 1.2,
                maxWidth: '100%', overflow: 'hidden',
                textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
                {label}
            </p>
            {rarity && (
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0,
                    height: 2, borderRadius: '10px 10px 0 0',
                    background: color, opacity: 0.7,
                }} />
            )}
            {active && (
                <div style={{
                    position: 'absolute', top: 4, right: 4,
                    width: 7, height: 7, borderRadius: '50%',
                    background: '#818cf8',
                }} />
            )}
        </button>
    );
}
