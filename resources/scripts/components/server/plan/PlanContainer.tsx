import React from 'react';
import tw from 'twin.macro';
import FlashMessageRender from '@/components/FlashMessageRender';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import ChangePlanBox from '@/components/server/settings/ChangePlanBox';

export default () => (
    <ServerContentBlock title={'Plan'} compact>
        <div
            css={tw`w-full bg-black px-4 sm:px-6 pt-4 pb-8`}
            style={{ minHeight: 'calc(100vh - var(--server-header-height, 6.25rem))' }}
        >
            <FlashMessageRender byKey={'settings'} css={tw`mb-4`} />
            <ChangePlanBox />
        </div>
    </ServerContentBlock>
);
