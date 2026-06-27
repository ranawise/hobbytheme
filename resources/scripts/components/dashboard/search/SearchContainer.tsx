import React, { useRef, useState } from 'react';
import { Search } from 'lucide-react';
import useEventListener from '@/plugins/useEventListener';
import SearchModal from '@/components/dashboard/search/SearchModal';
import styled from 'styled-components/macro';

const SearchBtn = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 9px;
    color: #71717a;
    background: none;
    border: none;
    cursor: pointer;
    flex-shrink: 0;
    transition: background 0.15s, color 0.15s;

    &:hover {
        background: rgba(255,255,255,0.07);
        color: #e4e4e7;
    }
`;

const isTyping = (e: KeyboardEvent) =>
    ['input', 'textarea', 'select'].includes(
        ((e.target as HTMLElement).tagName || '').toLowerCase()
    );

export default () => {
    const [visible, setVisible] = useState(false);
    // Track whether G was the last key pressed (for G→S chord)
    const gPressed = useRef(false);
    const gTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEventListener('keydown', (e: KeyboardEvent) => {
        if (isTyping(e)) return;

        // Cmd+/ or Ctrl+/  — existing shortcut
        if ((e.metaKey || e.ctrlKey) && e.key === '/') {
            setVisible(true);
            return;
        }

        // G → S chord: press G, then S within 800ms
        if (e.key.toLowerCase() === 'g' && !e.metaKey && !e.ctrlKey && !e.altKey) {
            gPressed.current = true;
            if (gTimer.current) clearTimeout(gTimer.current);
            gTimer.current = setTimeout(() => { gPressed.current = false; }, 800);
            return;
        }

        if (e.key.toLowerCase() === 's' && gPressed.current && !e.metaKey && !e.ctrlKey) {
            gPressed.current = false;
            if (gTimer.current) clearTimeout(gTimer.current);
            e.preventDefault();
            setVisible(true);
        }
    });

    return (
        <>
            {visible && <SearchModal appear visible={visible} onDismissed={() => setVisible(false)} />}
            <SearchBtn onClick={() => setVisible(true)} title={'Search servers (G then S)'}>
                <Search size={18} />
            </SearchBtn>
        </>
    );
};
