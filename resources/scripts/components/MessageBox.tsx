import * as React from 'react';
import tw, { TwStyle } from 'twin.macro';
import styled from 'styled-components/macro';
import { CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react';

export type FlashMessageType = 'success' | 'info' | 'warning' | 'error';

interface Props {
    title?: string;
    children: string;
    type?: FlashMessageType;
}

const styling = (type?: FlashMessageType): TwStyle => {
    switch (type) {
        case 'error':
            return tw`bg-red-500/10 border-red-500/30`;
        case 'info':
            return tw`bg-primary-500/10 border-primary-500/30`;
        case 'success':
            return tw`bg-green-500/10 border-green-500/30`;
        case 'warning':
            return tw`bg-yellow-500/10 border-yellow-500/30`;
        default:
            return tw`bg-surface border-white/10`;
    }
};

const iconColor = (type?: FlashMessageType): TwStyle => {
    switch (type) {
        case 'error':
            return tw`text-red-400`;
        case 'info':
            return tw`text-primary-400`;
        case 'success':
            return tw`text-green-400`;
        case 'warning':
            return tw`text-yellow-400`;
        default:
            return tw`text-neutral-400`;
    }
};

const badgeStyling = (type?: FlashMessageType): TwStyle => {
    switch (type) {
        case 'error':
            return tw`bg-red-500/20 text-red-300`;
        case 'info':
            return tw`bg-primary-500/20 text-primary-300`;
        case 'success':
            return tw`bg-green-500/20 text-green-300`;
        case 'warning':
            return tw`bg-yellow-500/20 text-yellow-300`;
        default:
            return tw`bg-white/10 text-neutral-300`;
    }
};

const MessageIcon = ({ type }: { type?: FlashMessageType }) => {
    const css = [tw`flex-shrink-0 mr-2.5`, iconColor(type)];

    switch (type) {
        case 'error':
            return <XCircle size={16} css={css} />;
        case 'success':
            return <CheckCircle2 size={16} css={css} />;
        case 'warning':
            return <AlertTriangle size={16} css={css} />;
        default:
            return <Info size={16} css={css} />;
    }
};

const Container = styled.div<{ $type?: FlashMessageType }>`
    ${tw`p-3 border items-center leading-normal rounded-lg flex w-full text-sm text-neutral-100`};
    ${(props) => styling(props.$type)};
`;
Container.displayName = 'MessageBox.Container';

const MessageBox = ({ title, children, type }: Props) => (
    <Container css={tw`lg:inline-flex`} $type={type} role={'alert'}>
        <MessageIcon type={type} />
        {title && (
            <span
                className={'title'}
                css={[
                    tw`flex rounded-full uppercase px-2 py-1 text-xs font-bold mr-3 leading-none flex-shrink-0`,
                    badgeStyling(type),
                ]}
            >
                {title}
            </span>
        )}
        <span css={tw`mr-2 text-left flex-auto`}>{children}</span>
    </Container>
);
MessageBox.displayName = 'MessageBox';

export default MessageBox;
