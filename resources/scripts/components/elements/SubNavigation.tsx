import styled from 'styled-components/macro';
import tw, { theme } from 'twin.macro';

const SubNavigation = styled.div`
    ${tw`w-full bg-black border-b border-white/10 overflow-x-auto`};

    & > div {
        ${tw`flex items-center text-sm mx-auto px-2`};
        max-width: 1200px;

        & > a,
        & > div {
            ${tw`inline-block py-3 px-4 text-neutral-400 no-underline whitespace-nowrap transition-all duration-150`};

            &:not(:first-of-type) {
                ${tw`ml-2`};
            }

            &:hover {
                ${tw`text-neutral-200`};
            }

            &:active,
            &.active {
                ${tw`text-white`};
                box-shadow: inset 0 -2px ${theme`colors.primary.500`.toString()};
            }
        }
    }
`;

export default SubNavigation;
