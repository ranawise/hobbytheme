import React, { useState } from 'react';
import { Subuser } from '@/state/server/subusers';
import { Pencil, ShieldCheck, ShieldOff } from 'lucide-react';
import RemoveSubuserButton from '@/components/server/users/RemoveSubuserButton';
import EditSubuserModal from '@/components/server/users/EditSubuserModal';
import Can from '@/components/elements/Can';
import { useStoreState } from 'easy-peasy';
import tw from 'twin.macro';
import styled from 'styled-components/macro';

interface Props {
    subuser: Subuser;
}

const Row = styled.div`
    ${tw`flex items-center gap-4 rounded-lg border border-white/10 bg-surface px-4 py-3 transition-colors duration-150`};

    &:hover {
        ${tw`border-white/20`};
    }
`;

const IconButton = styled.button`
    ${tw`flex items-center justify-center w-8 h-8 rounded-md text-neutral-400 transition-colors duration-150`};

    &:hover {
        ${tw`bg-white/5 text-neutral-200`};
    }

    &.danger:hover {
        ${tw`bg-red-500/10 text-red-400`};
    }
`;

export default ({ subuser }: Props) => {
    const uuid = useStoreState((state) => state.user!.data!.uuid);
    const [visible, setVisible] = useState(false);

    return (
        <Row>
            <EditSubuserModal subuser={subuser} visible={visible} onModalDismissed={() => setVisible(false)} />
            <div css={tw`w-10 h-10 rounded-full bg-white border-2 border-white/10 overflow-hidden hidden md:block flex-shrink-0`}>
                <img css={tw`w-full h-full`} src={`${subuser.image}?s=400`} />
            </div>
            <div css={tw`flex-1 overflow-hidden`}>
                <p css={tw`text-sm text-neutral-200 truncate`}>{subuser.email}</p>
            </div>
            <div css={tw`ml-4 flex-shrink-0`}>
                <p css={tw`flex justify-center`}>
                    {subuser.twoFactorEnabled ? (
                        <ShieldCheck size={16} css={tw`text-green-400`} />
                    ) : (
                        <ShieldOff size={16} css={tw`text-red-400`} />
                    )}
                </p>
                <p css={tw`text-2xs text-neutral-500 uppercase hidden md:block mt-1`}>2FA Enabled</p>
            </div>
            <div css={tw`ml-8 hidden md:block flex-shrink-0`}>
                <p css={tw`font-medium text-center text-neutral-200`}>
                    {subuser.permissions.filter((permission) => permission !== 'websocket.connect').length}
                </p>
                <p css={tw`text-2xs text-neutral-500 uppercase`}>Permissions</p>
            </div>
            {subuser.uuid !== uuid && (
                <div css={tw`ml-4 flex items-center gap-1 flex-shrink-0`}>
                    <Can action={'user.update'}>
                        <IconButton type={'button'} aria-label={'Edit subuser'} onClick={() => setVisible(true)}>
                            <Pencil size={15} />
                        </IconButton>
                    </Can>
                    <Can action={'user.delete'}>
                        <RemoveSubuserButton subuser={subuser} />
                    </Can>
                </div>
            )}
        </Row>
    );
};
