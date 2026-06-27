import styled from 'styled-components/macro';
import tw from 'twin.macro';

const Label = styled.label<{ isLight?: boolean }>`
    ${tw`block text-xs font-medium mb-1.5`};
    color: rgba(255,255,255,0.5);
    letter-spacing: 0.05em;
    text-transform: uppercase;
    ${(props) => props.isLight && tw`text-neutral-700`};
`;

export default Label;
