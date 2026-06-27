import React, { memo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import tw from 'twin.macro';
import isEqual from 'react-fast-compare';

interface Props {
    icon?: IconProp;
    title: string | React.ReactNode;
    className?: string;
    children: React.ReactNode;
}

const TitledGreyBox = ({ icon, title, children, className }: Props) => (
    <div css={tw`rounded-xl border border-white/10 bg-surface`} className={className}>
        <div css={tw`bg-white/5 rounded-t-xl px-4 py-3 border-b border-white/10`}>
            {typeof title === 'string' ? (
                <p css={tw`text-xs uppercase tracking-wider font-medium text-neutral-400`}>
                    {icon && <FontAwesomeIcon icon={icon} css={tw`mr-2 text-neutral-500`} />}
                    {title}
                </p>
            ) : (
                title
            )}
        </div>
        <div css={tw`p-4 text-neutral-300`}>{children}</div>
    </div>
);

export default memo(TitledGreyBox, isEqual);
