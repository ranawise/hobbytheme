import React, { useEffect, useState } from 'react';
import { useActivityLogs } from '@/api/server/activity';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import { useFlashKey } from '@/plugins/useFlash';
import FlashMessageRender from '@/components/FlashMessageRender';
import Spinner from '@/components/elements/Spinner';
import ActivityLogEntry from '@/components/elements/activity/ActivityLogEntry';
import PaginationFooter from '@/components/elements/table/PaginationFooter';
import { ActivityLogFilters } from '@/api/account/activity';
import { Link } from 'react-router-dom';
import tw from 'twin.macro';
import { XCircle } from 'lucide-react';
import useLocationHash from '@/plugins/useLocationHash';

import BeforeContent from '@blueprint/components/Server/Activity/BeforeContent';
import AfterContent from '@blueprint/components/Server/Activity/AfterContent';

export default () => {
    const { hash } = useLocationHash();
    const { clearAndAddHttpError } = useFlashKey('server:activity');
    const [filters, setFilters] = useState<ActivityLogFilters>({ page: 1, sorts: { timestamp: -1 } });

    const { data, isValidating, error } = useActivityLogs(filters, {
        revalidateOnMount: true,
        revalidateOnFocus: false,
    });

    useEffect(() => {
        setFilters((value) => ({ ...value, filters: { ip: hash.ip, event: hash.event } }));
    }, [hash]);

    useEffect(() => {
        clearAndAddHttpError(error);
    }, [error]);

    return (
        <ServerContentBlock title={'Activity Log'} compact>
            <div
                css={tw`w-full bg-black px-4 sm:px-6 pt-4 pb-8`}
                style={{ minHeight: 'calc(100vh - var(--server-header-height, 6.25rem))' }}
            >
                <FlashMessageRender byKey={'server:activity'} css={tw`mb-4`} />
                <BeforeContent />
                {(filters.filters?.event || filters.filters?.ip) && (
                    <div css={tw`flex justify-end mb-4`}>
                        <Link
                            to={'#'}
                            css={tw`flex items-center px-4 py-2 rounded-md text-sm text-neutral-400 transition-colors duration-150 hover:text-neutral-200 hover:bg-white/5`}
                            onClick={() => setFilters((value) => ({ ...value, filters: {} }))}
                        >
                            Clear Filters <XCircle size={16} css={tw`ml-2`} />
                        </Link>
                    </div>
                )}
                {!data && isValidating ? (
                    <Spinner centered />
                ) : !data?.items.length ? (
                    <p css={tw`text-sm text-center text-neutral-400`}>No activity logs available for this server.</p>
                ) : (
                    <div css={tw`flex flex-col gap-2`}>
                        {data?.items.map((activity) => (
                            <ActivityLogEntry key={activity.id} activity={activity}>
                                <span />
                            </ActivityLogEntry>
                        ))}
                    </div>
                )}
                {data && (
                    <div css={tw`mt-6`}>
                        <PaginationFooter
                            pagination={data.pagination}
                            onPageSelect={(page) => setFilters((value) => ({ ...value, page }))}
                        />
                    </div>
                )}
                <AfterContent />
            </div>
        </ServerContentBlock>
    );
};
