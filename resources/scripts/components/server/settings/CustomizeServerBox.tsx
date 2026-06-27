import React, { useEffect, useState } from 'react';
import TitledGreyBox from '@/components/elements/TitledGreyBox';
import { ServerContext } from '@/state/server';
import tw from 'twin.macro';
import { useFlashKey } from '@/plugins/useFlash';
import FlashMessageRender from '@/components/FlashMessageRender';
import { getServerTags, setServerTags, setServerIcon, ServerTagOption } from '@/api/server/customize';
import { getOwnedIcons, OwnedIcon } from '@/api/account/icons';
import Spinner from '@/components/elements/Spinner';
import styled from 'styled-components/macro';
import { Button } from '@/components/elements/button/index';

const RARITY_COLOR: Record<string, string> = {
    LIMITED:   '#ef4444',
    LEGENDARY: '#f97316',
    EPIC:      '#a855f7',
    RARE:      '#3b82f6',
    UNCOMMON:  '#22c55e',
    COMMON:    '#71717a',
};

const TagPill = styled.button<{ $selected: boolean }>`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    border-radius: 20px;
    border: 1px solid ${(p) => p.$selected ? 'rgba(99,102,241,0.55)' : 'rgba(255,255,255,0.08)'};
    background: ${(p) => p.$selected ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.03)'};
    color: ${(p) => p.$selected ? '#a5b4fc' : '#71717a'};
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
    &:hover { border-color: rgba(99,102,241,0.4); color: #c7d2fe; background: rgba(99,102,241,0.08); }
`;

export default () => {
    const uuid = ServerContext.useStoreState((s) => s.server.data!.id);
    const { clearFlashes, addFlash, clearAndAddHttpError } = useFlashKey('customize-server');

    const [tags, setTags]             = useState<ServerTagOption[]>([]);
    const [ownedIcons, setOwnedIcons] = useState<OwnedIcon[]>([]);
    const [activeIconId, setActiveIconId] = useState<string | null>(null);
    const [loading, setLoading]       = useState(true);
    const [savingTags, setSavingTags] = useState(false);

    useEffect(() => {
        clearFlashes();
        Promise.all([getServerTags(uuid), getOwnedIcons()])
            .then(([serverTags, icons]) => {
                setTags(serverTags);
                setOwnedIcons(icons);
            })
            .catch((e) => clearAndAddHttpError(e))
            .finally(() => setLoading(false));
    }, [uuid]);

    const toggleTag = (id: string) => {
        setTags((prev) => prev.map((t) => {
            if (t.id !== id) return t;
            if (!t.selected && prev.filter((x) => x.selected).length >= 5) return t;
            return { ...t, selected: !t.selected };
        }));
    };

    const handleSaveTags = () => {
        clearFlashes();
        setSavingTags(true);
        setServerTags(uuid, tags.filter((t) => t.selected).map((t) => t.id))
            .then(() => addFlash({ type: 'success', title: 'Saved', message: 'Server tags updated.' }))
            .catch((e) => clearAndAddHttpError(e))
            .finally(() => setSavingTags(false));
    };

    const handleEquipIcon = (iconId: string | null) => {
        clearFlashes();
        setServerIcon(uuid, iconId)
            .then(() => {
                setActiveIconId(iconId);
                addFlash({ type: 'success', title: 'Saved', message: iconId ? 'Server icon updated.' : 'Server icon cleared.' });
            })
            .catch((e) => clearAndAddHttpError(e));
    };

    if (loading) return <Spinner centered />;

    const selectedCount = tags.filter((t) => t.selected).length;

    return (
        <>
            <FlashMessageRender byKey={'customize-server'} css={tw`mb-4`} />

            {/* Tags */}
            <TitledGreyBox title={'Server Tags'} css={tw`mb-6`}>
                <p css={tw`text-sm text-neutral-500 mb-4`}>
                    Up to 5 tags — helps players discover your server.
                    <span css={tw`ml-2 text-neutral-600`}>{selectedCount}/5</span>
                </p>
                <div css={tw`flex flex-wrap gap-2`}>
                    {tags.map((tag) => (
                        <TagPill key={tag.id} $selected={tag.selected} onClick={() => toggleTag(tag.id)} type={'button'}>
                            <span style={{ fontSize: 14 }}>{tag.emoji}</span>
                            {tag.display_name}
                        </TagPill>
                    ))}
                </div>
                <div css={tw`mt-4 flex justify-end`}>
                    <Button onClick={handleSaveTags} disabled={savingTags} size={'small'}>
                        {savingTags ? 'Saving…' : 'Save Tags'}
                    </Button>
                </div>
            </TitledGreyBox>

            {/* Icon */}
            <TitledGreyBox title={'Server Icon'}>
                {ownedIcons.length === 0 ? (
                    <p css={tw`text-sm text-neutral-500`}>
                        You don&apos;t own any icons yet.{' '}
                        <a href={'/store'} css={tw`text-indigo-400 hover:text-indigo-300 no-underline`}>
                            Visit the Icon Shop →
                        </a>
                    </p>
                ) : (
                    <>
                        <p css={tw`text-sm text-neutral-500 mb-4`}>
                            Pick an icon to equip. It will be set as your server&apos;s{' '}
                            <code css={tw`text-xs bg-neutral-800 px-1 py-0.5 rounded`}>server-icon.png</code>.
                        </p>
                        <div css={tw`flex flex-wrap gap-3`}>
                            {/* Clear button */}
                            <button
                                type={'button'}
                                title={'No icon (clear)'}
                                onClick={() => handleEquipIcon(null)}
                                style={{
                                    width: 64, height: 64, borderRadius: 10,
                                    border: `2px solid ${activeIconId === null ? 'rgba(99,102,241,0.6)' : 'rgba(255,255,255,0.08)'}`,
                                    background: 'rgba(255,255,255,0.03)',
                                    cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 18, color: '#52525b',
                                    transition: 'border-color 0.15s',
                                }}
                            >
                                ✕
                            </button>

                            {ownedIcons.map((icon) => {
                                const active = activeIconId === icon.id;
                                const color  = RARITY_COLOR[icon.rarity] ?? '#71717a';
                                return (
                                    <button
                                        key={icon.id}
                                        type={'button'}
                                        title={`${icon.name} (${icon.rarity})`}
                                        onClick={() => handleEquipIcon(icon.id)}
                                        style={{
                                            width: 64, height: 64, padding: 5, borderRadius: 10,
                                            border: `2px solid ${active ? color : 'rgba(255,255,255,0.08)'}`,
                                            background: 'rgba(255,255,255,0.03)',
                                            cursor: 'pointer',
                                            boxShadow: active ? `0 0 14px ${color}55` : 'none',
                                            transition: 'all 0.15s',
                                        }}
                                    >
                                        <img
                                            src={icon.image_url}
                                            alt={icon.name}
                                            style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 6, display: 'block', imageRendering: 'pixelated' }}
                                        />
                                    </button>
                                );
                            })}
                        </div>
                        <p css={tw`mt-3 text-xs text-neutral-600`}>
                            Equipping pushes a 64×64 PNG to your server immediately.
                        </p>
                    </>
                )}
            </TitledGreyBox>
        </>
    );
};
