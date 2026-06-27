import React from 'react';
import { Plus } from 'lucide-react';
import tw from 'twin.macro';
import styled from 'styled-components/macro';

const NewCard = styled.button`
    ${tw`flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/10 p-5 min-h-[11rem] text-neutral-400 transition-colors duration-150`};

    &:hover {
        ${tw`text-neutral-200`};
        border-color: rgba(228, 89, 58, 0.6);
    }
`;

export default ({ onClick }: { onClick: () => void }) => (
    <NewCard type={'button'} onClick={onClick}>
        <Plus size={22} />
        <span css={tw`mt-2 text-sm`}>New server</span>
    </NewCard>
);
