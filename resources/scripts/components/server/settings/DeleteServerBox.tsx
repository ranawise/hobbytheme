import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { ServerContext } from '@/state/server';
import TitledGreyBox from '@/components/elements/TitledGreyBox';
import deleteServer from '@/api/server/deleteServer';
import { httpErrorToHuman } from '@/api/http';
import tw from 'twin.macro';
import { Button } from '@/components/elements/button/index';
import { Dialog } from '@/components/elements/dialog';
import { useFlashKey } from '@/plugins/useFlash';

export default () => {
    const history = useHistory();
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const [modalVisible, setModalVisible] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const { addError, clearFlashes } = useFlashKey('settings');

    const onDelete = () => {
        setIsDeleting(true);
        clearFlashes();
        deleteServer(uuid)
            .then(() => history.push('/'))
            .catch((error) => {
                console.error(error);

                addError(httpErrorToHuman(error));
                setIsDeleting(false);
                setModalVisible(false);
            });
    };

    return (
        <TitledGreyBox title={'Delete Server'} css={tw`relative`}>
            <Dialog.Confirm
                open={modalVisible}
                title={'Delete this free server?'}
                confirm={'Yes, delete server'}
                onClose={() => setModalVisible(false)}
                onConfirmed={onDelete}
            >
                This will permanently delete this server and all of its data. This cannot be undone. You will be
                able to create a new free server afterwards.
            </Dialog.Confirm>
            <p css={tw`text-sm`}>
                This is a free server. You may delete it at any time, which will free up your account&apos;s free
                server slot so you can create a new one.&nbsp;
                <strong css={tw`font-medium`}>This will permanently delete all files and data.</strong>
            </p>
            <div css={tw`mt-6 text-right`}>
                <Button.Danger
                    variant={Button.Variants.Secondary}
                    disabled={isDeleting}
                    onClick={() => setModalVisible(true)}
                >
                    Delete Server
                </Button.Danger>
            </div>
        </TitledGreyBox>
    );
};
