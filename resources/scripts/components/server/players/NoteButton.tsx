import React, { useState } from 'react';
import tw from 'twin.macro';
import styled from 'styled-components/macro';
import { StickyNote } from 'lucide-react';
import { Dialog } from '@/components/elements/dialog';
import { Button } from '@/components/elements/button';

interface Props {
    username: string;
    note: string;
    onChange: (note: string) => void;
}

const Btn = styled.button<{ $active: boolean }>`
    ${tw`flex items-center justify-center w-8 h-8 rounded-md transition-colors duration-150`};
    color: ${({ $active }) => ($active ? 'rgb(228, 89, 58)' : 'rgb(115, 115, 115)')};
    &:hover { ${tw`bg-white/5 text-neutral-200`}; }
`;

export default ({ username, note, onChange }: Props) => {
    const [open, setOpen] = useState(false);
    const [draft, setDraft] = useState('');

    const handleOpen = () => {
        setDraft(note);
        setOpen(true);
    };

    return (
        <>
            <Dialog open={open} title={`Note — ${username}`} onClose={() => setOpen(false)}>
                <div css={tw`mt-4`}>
                    <textarea
                        css={tw`w-full bg-neutral-900 border border-white/10 rounded-md px-3 py-2 text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-white/30 resize-none`}
                        rows={4}
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        placeholder={'Add a private note about this player…'}
                        autoFocus
                    />
                </div>
                <Dialog.Footer>
                    <Button.Text onClick={() => { onChange(''); setOpen(false); }}>Clear</Button.Text>
                    <Button onClick={() => { onChange(draft.trim()); setOpen(false); }}>Save</Button>
                </Dialog.Footer>
            </Dialog>
            <Btn
                type={'button'}
                $active={!!note}
                title={note ? `Note: ${note}` : 'Add note'}
                onClick={handleOpen}
            >
                <StickyNote size={15} />
            </Btn>
        </>
    );
};
