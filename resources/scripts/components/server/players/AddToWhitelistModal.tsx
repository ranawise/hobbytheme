import React, { useState } from 'react';
import tw from 'twin.macro';
import { X, Plus, UserPlus } from 'lucide-react';
import { Dialog } from '@/components/elements/dialog';
import { Button } from '@/components/elements/button';
import { ServerContext } from '@/state/server';
import MinecraftAvatar from './MinecraftAvatar';

interface Props {
    open: boolean;
    onClose: () => void;
    onAdded: (usernames: string[]) => void;
}

export default ({ open, onClose, onAdded }: Props) => {
    const { instance } = ServerContext.useStoreState((state) => state.socket);
    const [input, setInput] = useState('');
    const [pending, setPending] = useState<string[]>([]);
    const [error, setError] = useState('');

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

    const confirm = () => {
        if (!pending.length) return;
        pending.forEach((name) => instance?.send('send command', `whitelist add ${name}`));
        onAdded(pending);
        setPending([]);
        setInput('');
        onClose();
    };

    const handleClose = () => {
        setPending([]);
        setInput('');
        setError('');
        onClose();
    };

    return (
        <Dialog open={open} title={'Add to Whitelist'} onClose={handleClose}>
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
                    />
                    <Button.Text
                        size={Button.Sizes.Small}
                        onClick={addName}
                    >
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
                <Button.Text onClick={handleClose}>Cancel</Button.Text>
                <Button disabled={!pending.length} onClick={confirm}>
                    <UserPlus size={15} css={tw`mr-2`} />
                    Add {pending.length > 0 ? `${pending.length} Player${pending.length > 1 ? 's' : ''}` : 'Players'}
                </Button>
            </Dialog.Footer>
        </Dialog>
    );
};
