import React from 'react';
import { Link } from 'react-router-dom';
import Tooltip from '@/components/elements/tooltip/Tooltip';
import Translate from '@/components/elements/Translate';
import { format, formatDistanceToNowStrict } from 'date-fns';
import { ActivityLog } from '@definitions/user';
import ActivityLogMetaButton from '@/components/elements/activity/ActivityLogMetaButton';
import { FolderOpen, Terminal } from 'lucide-react';
import Avatar from '@/components/Avatar';
import useLocationHash from '@/plugins/useLocationHash';
import { getObjectKeys, isObject } from '@/lib/objects';
import tw from 'twin.macro';
import styled from 'styled-components/macro';

interface Props {
    activity: ActivityLog;
    children?: React.ReactNode;
}

const Row = styled.div`
    ${tw`flex items-center gap-4 rounded-lg border border-white/10 bg-surface px-4 py-3 transition-colors duration-150`};

    &:hover {
        ${tw`border-white/20`};
    }
`;

function wrapProperties(value: unknown): any {
    if (value === null || typeof value === 'string' || typeof value === 'number') {
        return `<strong>${String(value)}</strong>`;
    }

    if (isObject(value)) {
        return getObjectKeys(value).reduce((obj, key) => {
            if (key === 'count' || (typeof key === 'string' && key.endsWith('_count'))) {
                return { ...obj, [key]: value[key] };
            }
            return { ...obj, [key]: wrapProperties(value[key]) };
        }, {} as Record<string, unknown>);
    }

    if (Array.isArray(value)) {
        return value.map(wrapProperties);
    }

    return value;
}

export default ({ activity, children }: Props) => {
    const { pathTo } = useLocationHash();
    const actor = activity.relationships.actor;
    const properties = wrapProperties(activity.properties);

    return (
        <Row>
            <div css={tw`w-10 h-10 rounded-full bg-neutral-800 overflow-hidden hidden sm:flex items-center flex-shrink-0`}>
                <Avatar name={actor?.uuid || 'system'} />
            </div>
            <div css={tw`flex-1 min-w-0`}>
                <div css={tw`flex items-center gap-2 flex-wrap`}>
                    <Tooltip placement={'top'} content={actor?.email || 'System User'}>
                        <span css={tw`text-sm font-medium text-neutral-200`}>{actor?.username || 'System'}</span>
                    </Tooltip>
                    <span css={tw`text-neutral-600`}>&mdash;</span>
                    <Link
                        to={`#${pathTo({ event: activity.event })}`}
                        css={tw`text-sm text-neutral-400 transition-colors duration-75 hover:text-cyan-400`}
                    >
                        {activity.event}
                    </Link>
                    <div css={tw`flex items-center gap-1 text-neutral-500`}>
                        {activity.isApi && (
                            <Tooltip placement={'top'} content={'Using API Key'}>
                                <Terminal size={14} css={tw`cursor-pointer hover:text-neutral-200 transition-colors`} />
                            </Tooltip>
                        )}
                        {activity.event.startsWith('server:sftp.') && (
                            <Tooltip placement={'top'} content={'Using SFTP'}>
                                <FolderOpen size={14} css={tw`cursor-pointer hover:text-neutral-200 transition-colors`} />
                            </Tooltip>
                        )}
                        {children}
                    </div>
                </div>
                <p css={tw`mt-0.5 text-sm text-neutral-400 line-clamp-2 break-words [&_strong]:text-neutral-200 [&_strong]:font-semibold`}>
                    <Translate ns={'activity'} values={properties} i18nKey={activity.event.replace(':', '.')} />
                </p>
                <div css={tw`mt-1 flex items-center gap-2 text-xs text-neutral-500`}>
                    {activity.ip && (
                        <>
                            <span>{activity.ip}</span>
                            <span css={tw`text-neutral-700`}>|</span>
                        </>
                    )}
                    <Tooltip placement={'right'} content={format(activity.timestamp, 'MMM do, yyyy H:mm:ss')}>
                        <span>{formatDistanceToNowStrict(activity.timestamp, { addSuffix: true })}</span>
                    </Tooltip>
                </div>
            </div>
            {activity.hasAdditionalMetadata && (
                <div css={tw`flex-shrink-0`}>
                    <ActivityLogMetaButton meta={activity.properties} />
                </div>
            )}
        </Row>
    );
};
