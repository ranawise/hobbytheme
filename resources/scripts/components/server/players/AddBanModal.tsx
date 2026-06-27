import React, { useState } from 'react';
import tw from 'twin.macro';
import { X, Plus, ShieldBan } from 'lucide-react';
import { Dialog } from '@/components/elements/dialog';
import { Button } from '@/components/elements/button';
import { ServerContext } from '@/state/server';
import MinecraftAvatar from './MinecraftAvatar';
import getFileContents from '@/api/server/files/getFileContents';
import saveFileContents from '@/api/server/files/saveFileContents';

interface Props {
    open: boolean;
    onClose: () => void;
    onAdded: () => void;
}

const formatBanDate = () => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())} +0000`;
};

const fetchMojangUuid = async (name: string): Promise<string> => {
    try {
        const res = await fetch(`https://api.mojang.com/users/profiles/minecraft/${name}`);
        if (res.ok) {
            const data = await res.json();
            const id = data.id as string;
            return `${id.slice(0, 8)}-${id.slice(8, 12)}-${id.slice(12, 16)}-${id.slice(16, 20)}-${id.slice(20)}`;
        }
    } catch {}
    return '00000000-0000-0000-0000-000000000000';
};

export default ({ open, onClose, onAdded }: Props) => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const [input, setInput] = useState('');
    const [reason, setReason] = useState('');
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

    const confirm = async () => {
        if (!pending.length) return;
        setSaving(true);
        try {
            const raw = await getFileContents(uuid, '/banned-players.json');
            const existing: Array<Record<string, unknown>> = JSON.parse(raw);
            const existingNames = new Set(existing.map((p) => String(p.name).toLowerCase()));
            const newEntries = await Promise.all(
                pending
                    .filter((name) => !existingNames.has(name.toLowerCase()))
                    .map(async (name) => ({
                        uuid: await fetchMojangUuid(name),
                        name,
                        created: formatBanDate(),
                        source: 'Panel',
                        expires: 'forever',
                        reason: reason.trim() || 'Banned by operator',
                    }))
            );
            await saveFileContents(uuid, '/banned-players.json', JSON.stringify([...existing, ...newEntries], null, 2));
            onAdded();
            setPending([]);
            setInput('');
            setReason('');
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
        setReason('');
        setError('');
        onClose();
    };

    return (
        <Dialog open={open} title={'Ban Player'} onClose={handleClose}>
            <div css={tw`mt-4 space-y-3`}>
                <input
                    css={tw`w-full bg-neutral-900 border border-white/10 rounded-md px-3 py-2 text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-white/30 transition-colors`}
                    type={'text'}
                    placeholder={'Reason (optional)'}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                />
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
                    <div css={tw`space-y-2 max-h-48 overflow-y-auto`}>
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
                                    onClick={() => setPending((prev) => prev.filter((n) => n !== name))}
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
                    <ShieldBan size={15} css={tw`mr-2`} />
                    {saving
                        ? 'Banning…'
                        : pending.length > 0
                        ? `Ban ${pending.length} Player${pending.length > 1 ? 's' : ''}`
                        : 'Ban Player'}
                </Button>
            </Dialog.Footer>
        </Dialog>
    );
};
