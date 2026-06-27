import React, { useState } from 'react';
import tw from 'twin.macro';
import styled from 'styled-components/macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobe, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { Dialog } from '@/components/elements/dialog';
import { useFlashKey } from '@/plugins/useFlash';
import { deleteExternalServer, ExternalServerData } from '@/api/account/externalServer';

const Row = styled.div`
    ${tw`grid grid-cols-12 gap-4 items-center rounded-xl border border-white/10 bg-surface p-4 transition-colors duration-150`};

    &:hover {
        ${tw`border-primary-600/60`};
    }
`;

interface Props {
    server: ExternalServerData;
    onDeleted: () => void;
    className?: string;
}

export default ({ server, onDeleted, className }: Props) => {
    const { clearAndAddHttpError } = useFlashKey('dashboard:external-servers');
    const [visible, setVisible] = useState(false);

    const onConfirmDelete = () => {
        clearAndAddHttpError();

        deleteExternalServer(server.id)
            .then(() => onDeleted())
            .catch((error) => clearAndAddHttpError(error));
    };

    return (
        <Row className={className}>
            <Dialog.Confirm
                open={visible}
                title={'Remove External Server'}
                confirm={'Remove'}
                onConfirmed={onConfirmDelete}
                onClose={() => setVisible(false)}
            >
                This only removes <strong>{server.name}</strong> from your dashboard — it does not affect the server
                itself, since it isn&apos;t hosted on this panel.
            </Dialog.Confirm>
            <div css={tw`flex items-center col-span-12 sm:col-span-8`}>
                <div css={tw`mr-4 text-neutral-500`}>
                    <FontAwesomeIcon icon={faGlobe} />
                </div>
                <div>
                    <p css={tw`text-lg break-words`}>
                        {server.name} <span css={tw`text-xs uppercase text-neutral-400 ml-2`}>External</span>
                    </p>
                    <p css={tw`text-sm text-neutral-400`}>
                        {server.host}:{server.port}
                        {server.notes ? ` — ${server.notes}` : ''}
                    </p>
                </div>
            </div>
            <div css={tw`col-span-12 sm:col-span-4 flex justify-end`}>
                <button css={tw`p-2 text-sm`} onClick={() => setVisible(true)}>
                    <FontAwesomeIcon
                        icon={faTrashAlt}
                        css={tw`text-neutral-400 hover:text-red-400 transition-colors duration-150`}
                    />
                </button>
            </div>
        </Row>
    );
};
