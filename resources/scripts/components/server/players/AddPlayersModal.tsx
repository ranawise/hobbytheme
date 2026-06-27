import React, { useState } from 'react';
import tw from 'twin.macro';
import { X, Plus, UserPlus } from 'lucide-react';
import { Dialog } from '@/components/elements/dialog';
import { Button } from '@/components/elements/button';
import { ServerContext } from '@/state/server';
import MinecraftAvatar from './MinecraftAvatar';
import getFileContents from '@/api/server/files/getFileContents';
import saveFileContents from '@/api/server/files/saveFileContents';

interface Props {
    open: boolean;
    title: string;
    file: string;
    isOps?: boolean;
    confirmLabel?: string;
    onClose: () => void;
    onAdded: () => void;
}

const formatUuid = (id: string) =>
    `${id.slice(0, 8)}-${id.slice(8, 12)}-${id.slice(12, 16)}-${id.slice(16, 20)}-${id.slice(20)}`;

const fetchMojangUuid = async (name: string): Promise<string> => {
    try {
        const res = await fetch(`https://api.mojang.com/users/profiles/minecraft/${name}`);
        if (res.ok) {
            const data = await res.json();
            return formatUuid(data.id as string);
        }
    } catch {}
    return '00000000-0000-0000-0000-000000000000';
};

export default ({ open, title, file, isOps = false, confirmLabel = 'Add Players', onClose, onAdded }: Props) => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const [input, setInput] = useState('');
    const [pending, setPending] = useState<string[]>([]);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const addName = () => {
        const name = input.trim();
        if (!name) return;
        if (!/^[a-zA-Z0-9_]{2,16}$/.test(name)) {
            setError('Invalid username — must be 2–16 characters, letters, numbers, or underscores.');
            return;
        }
        if (pending.includes(name)) {
            setError('Already in the list.');
            return;
        }
        setPending((prev) => [...prev, name]);
        setInput('');
        setError('');
    };

    const remove = (name: string) => setPending((prev) => prev.filter((n) => n !== name));

    const confirm = async () => {
        if (!pending.length) return;
        setSaving(true);
        try {
            const raw = await getFileContents(uuid, file);
            const existing: Array<Record<string, unknown>> = JSON.parse(raw);
            const newEntries = await Promise.all(
                pending.map(async (name) => {
                    const playerUuid = await fetchMojangUuid(name);
                    return isOps
                        ? { uuid: playerUuid, name, level: 4, bypassesPlayerLimit: false }
                        : { uuid: playerUuid, name };
                })
            );
            const existingNames = new Set(existing.map((p) => String(p.name).toLowerCase()));
            const toAdd = newEntries.filter((e) => !existingNames.has(String(e.name).toLowerCase()));
            await saveFileContents(uuid, file, JSON.stringify([...existing, ...toAdd], null, 2));
            onAdded();
            setPending([]);
            setInput('');
            onClose();
        } catch {
            setError('Failed to update file. Make sure the server files are accessible.');
        } finally {
            setSaving(false);
        }
    };

    const handleClose = () => {
        setPending([]);
        setInput('');
        setError('');
        onClose();
    };

    return (
        <Dialog open={open} title={title} onClose={handleClose}>
            <div css={tw`mt-4 space-y-4`}>
                <div css={tw`flex gap-2`}>
                    <input
                        css={tw`flex-1 bg-neutral-900 border border-white/10 rounded-md px-3 py-2 text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-white/30 transition-colors`}
                        type={'text'}
                        placeholder={'Minecraft username'}
                        value={input}
                        maxLength={16}
                        onChange={(e) => { setInput(e.target.value); setError(''); }}
                        onKeyDown={(e) => e.key === 'Enter' && addName()}
                        autoFocus
                    />
                    <Button.Text size={Button.Sizes.Small} onClick={addName}>
                        <Plus size={16} />
                    </Button.Text>
                </div>
                {error && <p css={tw`text-xs text-red-400`}>{error}</p>}
                {pending.length > 0 && (
                    <div css={tw`space-y-2 max-h-64 overflow-y-auto`}>
                        {pending.map((name) => (
                            <div
                                key={name}
                                css={tw`flex items-center gap-3 rounded-lg bg-neutral-900 border border-white/10 px-3 py-2`}
                            >
                                <MinecraftAvatar username={name} size={28} />
                                <span css={tw`flex-1 text-sm text-neutral-200`}>{name}</span>
                                <button
                                    type={'button'}
                                    css={tw`text-neutral-500 hover:text-red-400 transition-colors`}
                                    onClick={() => remove(name)}
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <Dialog.Footer>
                <Button.Text onClick={handleClose} disabled={saving}>Cancel</Button.Text>
                <Button disabled={!pending.length || saving} onClick={confirm}>
                    <UserPlus size={15} css={tw`mr-2`} />
                    {saving
                        ? 'Saving…'
                        : pending.length > 0
                        ? `${confirmLabel.split(' ')[0]} ${pending.length} Player${pending.length > 1 ? 's' : ''}`
                        : confirmLabel}
                </Button>
            </Dialog.Footer>
        </Dialog>
    );
};
