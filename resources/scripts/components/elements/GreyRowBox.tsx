import styled from 'styled-components/macro';
import tw from 'twin.macro';

export default styled.div<{ $hoverable?: boolean }>`
    ${tw`flex rounded-xl no-underline text-neutral-200 items-center p-4 transition-colors duration-150 overflow-hidden`};
    background: #101013;
    border: 1px solid rgba(255,255,255,0.07);

    ${(props) => props.$hoverable !== false && `&:hover { border-color: rgba(255,255,255,0.14); }`};

    & .icon {
        ${tw`rounded-full w-16 flex items-center justify-center p-3`};
        background: rgba(255,255,255,0.06);
    }
`;
