import React, { useState } from 'react';
import tw from 'twin.macro';
import styled from 'styled-components/macro';
import { Button } from '@/components/elements/button';
import { Dialog } from '@/components/elements/dialog';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import { useFlashKey } from '@/plugins/useFlash';
import FlashMessageRender from '@/components/FlashMessageRender';
import { buyFreeServerSlot, FreeServerData } from '@/api/account/freeServer';
import { StepProps } from '@/components/dashboard/wizard/types';
import { Server, ExternalLink, CreditCard, CheckCircle } from 'lucide-react';

interface Props extends StepProps {
    freeServerData: FreeServerData | undefined;
    onSlotPurchased: (result: { credits: number; freeServerSlots: number }) => void;
}

const Card = styled.div<{ $selected: boolean; $disabled: boolean }>`
    ${tw`flex-1 p-5 rounded-lg border cursor-pointer transition-all duration-150 select-none`};
    ${({ $selected }) => $selected
        ? tw`border-primary-500 bg-primary-500/5`
        : tw`border-white/10 bg-surface hover:border-white/20`};
    ${({ $disabled }) => $disabled && tw`opacity-40 cursor-not-allowed pointer-events-none`};
`;

export default ({ values, setValue, onNext, freeServerData, onSlotPurchased }: Props) => {
    const { clearAndAddHttpError } = useFlashKey('dashboard:wizard');
    const [purchasing, setPurchasing] = useState(false);

    const hasSlotAvailable = !!freeServerData && freeServerData.freeServerCount < freeServerData.freeServerSlots;
    const defaultPathDisabled = !!freeServerData && !freeServerData.enabled;

    const buySlot = () => {
        clearAndAddHttpError();
        setPurchasing(true);
        buyFreeServerSlot()
            .then((result) => onSlotPurchased(result))
            .catch((error) => clearAndAddHttpError(error))
            .then(() => setPurchasing(false));
    };

    return (
        <div css={tw`relative`}>
            <SpinnerOverlay visible={purchasing} />
            <FlashMessageRender byKey={'dashboard:wizard'} css={tw`mb-4`} />
            <p css={tw`text-sm text-neutral-400 mb-4`}>What kind of server do you want to add?</p>
            <div css={tw`flex flex-col sm:flex-row gap-3 mb-5`}>
                <Card
                    $selected={values.path === 'default'}
                    $disabled={defaultPathDisabled}
                    onClick={() => !defaultPathDisabled && setValue('path', 'default')}
                >
                    <div css={tw`flex items-start gap-3`}>
                        <div css={tw`mt-0.5 p-2 rounded-md bg-white/5 flex-shrink-0`}>
                            <Server size={16} css={tw`text-neutral-300`} />
                        </div>
                        <div css={tw`flex-1`}>
                            <p css={tw`font-medium text-neutral-200`}>Hosted Server</p>
                            <p css={tw`text-sm text-neutral-400 mt-1 leading-relaxed`}>
                                {defaultPathDisabled
                                    ? 'Currently disabled by an administrator.'
                                    : 'Managed and hosted on this panel. Your first server is free.'}
                            </p>
                        </div>
                        {values.path === 'default' && (
                            <CheckCircle size={16} css={tw`text-primary-400 flex-shrink-0 mt-0.5`} />
                        )}
                    </div>
                </Card>
                <Card
                    $selected={values.path === 'external'}
                    $disabled={false}
                    onClick={() => setValue('path', 'external')}
                >
                    <div css={tw`flex items-start gap-3`}>
                        <div css={tw`mt-0.5 p-2 rounded-md bg-white/5 flex-shrink-0`}>
                            <ExternalLink size={16} css={tw`text-neutral-300`} />
                        </div>
                        <div css={tw`flex-1`}>
                            <p css={tw`font-medium text-neutral-200`}>External Server</p>
                            <p css={tw`text-sm text-neutral-400 mt-1 leading-relaxed`}>
                                Register an existing server for reference. Not hosted or charged for.
                            </p>
                        </div>
                        {values.path === 'external' && (
                            <CheckCircle size={16} css={tw`text-primary-400 flex-shrink-0 mt-0.5`} />
                        )}
                    </div>
                </Card>
            </div>

            {values.path === 'default' && freeServerData && !hasSlotAvailable && (
                <div css={tw`rounded-lg border border-white/10 bg-surface p-4 mb-5`}>
                    <div css={tw`flex items-center gap-2 mb-2`}>
                        <CreditCard size={15} css={tw`text-neutral-400`} />
                        <p css={tw`text-sm font-medium text-neutral-300`}>No free slots remaining</p>
                    </div>
                    <p css={tw`text-sm text-neutral-400 mb-1`}>
                        Used {freeServerData.freeServerCount} of {freeServerData.freeServerSlots} slots.
                    </p>
                    <p css={tw`text-sm text-neutral-400 mb-4`}>
                        Balance:{' '}
                        <span css={tw`text-neutral-200 font-medium`}>{freeServerData.credits} credits</span>
                        {' · '}
                        Cost:{' '}
                        <span css={tw`text-neutral-200 font-medium`}>{freeServerData.slotCost} credits</span>
                    </p>
                    <Button
                        size={Button.Sizes.Small}
                        disabled={purchasing || freeServerData.credits < freeServerData.slotCost}
                        onClick={buySlot}
                    >
                        Buy a Slot
                    </Button>
                </div>
            )}

            <Dialog.Footer>
                <Button
                    disabled={!values.path || (values.path === 'default' && !hasSlotAvailable)}
                    onClick={onNext}
                >
                    Continue
                </Button>
            </Dialog.Footer>
        </div>
    );
};
