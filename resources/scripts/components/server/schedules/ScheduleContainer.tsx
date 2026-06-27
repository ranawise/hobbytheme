import React, { useEffect, useState } from 'react';
import getServerSchedules from '@/api/server/schedules/getServerSchedules';
import { ServerContext } from '@/state/server';
import Spinner from '@/components/elements/Spinner';
import { useHistory, useRouteMatch } from 'react-router-dom';
import FlashMessageRender from '@/components/FlashMessageRender';
import ScheduleRow from '@/components/server/schedules/ScheduleRow';
import { httpErrorToHuman } from '@/api/http';
import EditScheduleModal from '@/components/server/schedules/EditScheduleModal';
import Can from '@/components/elements/Can';
import useFlash from '@/plugins/useFlash';
import tw from 'twin.macro';
import styled from 'styled-components/macro';
import { Button } from '@/components/elements/button/index';
import ServerContentBlock from '@/components/elements/ServerContentBlock';

import BeforeContent from '@blueprint/components/Server/Schedules/List/BeforeContent';
import AfterContent from '@blueprint/components/Server/Schedules/List/AfterContent';

const Row = styled.a`
    ${tw`flex flex-wrap items-center gap-4 rounded-lg border border-white/10 bg-surface px-4 py-3 cursor-pointer no-underline transition-colors duration-150`};

    &:hover {
        ${tw`border-white/20`};
    }
`;

export default () => {
    const match = useRouteMatch();
    const history = useHistory();

    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const { clearFlashes, addError } = useFlash();
    const [loading, setLoading] = useState(true);
    const [visible, setVisible] = useState(false);

    const schedules = ServerContext.useStoreState((state) => state.schedules.data);
    const setSchedules = ServerContext.useStoreActions((actions) => actions.schedules.setSchedules);

    useEffect(() => {
        const prev = document.body.style.backgroundColor;
        document.body.style.backgroundColor = '#101013';
        return () => { document.body.style.backgroundColor = prev; };
    }, []);

    useEffect(() => {
        clearFlashes('schedules');
        getServerSchedules(uuid)
            .then((schedules) => setSchedules(schedules))
            .catch((error) => {
                addError({ message: httpErrorToHuman(error), key: 'schedules' });
                console.error(error);
            })
            .then(() => setLoading(false));
    }, []);

    return (
        <ServerContentBlock title={'Schedules'} compact>
            <div
                css={tw`w-full px-4 sm:px-6 pt-4 pb-8`}
                style={{ background: '#101013', minHeight: 'calc(100vh - var(--server-header-height, 6.25rem))' }}
            >
                <FlashMessageRender byKey={'schedules'} css={tw`mb-4`} />
                {!schedules.length && loading ? (
                    <Spinner size={'large'} centered />
                ) : (
                    <>
                        <BeforeContent />
                        {schedules.length === 0 ? (
                            <p css={tw`text-sm text-center text-neutral-400`}>
                                There are no schedules configured for this server.
                            </p>
                        ) : (
                            <div css={tw`flex flex-col gap-2`}>
                                {schedules.map((schedule) => (
                                    <Row
                                        key={schedule.id}
                                        href={`${match.url}/${schedule.id}`}
                                        onClick={(e: React.MouseEvent) => {
                                            e.preventDefault();
                                            history.push(`${match.url}/${schedule.id}`);
                                        }}
                                    >
                                        <ScheduleRow schedule={schedule} />
                                    </Row>
                                ))}
                            </div>
                        )}
                        <Can action={'schedule.create'}>
                            <div css={tw`mt-6 flex justify-end`}>
                                <EditScheduleModal visible={visible} onModalDismissed={() => setVisible(false)} />
                                <Button type={'button'} onClick={() => setVisible(true)}>
                                    Create schedule
                                </Button>
                            </div>
                        </Can>
                        <AfterContent />
                    </>
                )}
            </div>
        </ServerContentBlock>
    );
};
