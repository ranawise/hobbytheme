import React, { useEffect, useState } from 'react';
import tw from 'twin.macro';
import styled from 'styled-components/macro';
import { Button } from '@/components/elements/button';
import { Dialog } from '@/components/elements/dialog';
import Spinner from '@/components/elements/Spinner';
import { getPlans, Plan } from '@/api/account/defaultServer';
import { FreeServerData } from '@/api/account/freeServer';
import { StepProps } from '@/components/dashboard/wizard/types';
import { CheckCircle, Cpu, HardDrive, MemoryStick } from 'lucide-react';

interface Props extends StepProps {
    freeServerData: FreeServerData | undefined;
}

const PlanCard = styled.div<{ $selected: boolean; $disabled: boolean }>`
    ${tw`p-4 rounded-lg border cursor-pointer transition-all duration-150`};
    ${({ $selected }) =>
        $selected
            ? tw`border-primary-500 bg-primary-500/5`
            : tw`border-white/10 bg-surface hover:border-white/20`};
    ${({ $disabled }) => $disabled && tw`opacity-40 cursor-not-allowed pointer-events-none`};
`;

const StatBadge = ({ icon, value }: { icon: React.ReactNode; value: string }) => (
    <span css={tw`inline-flex items-center gap-1 text-xs text-neutral-500`}>
        {icon}
        {value}
    </span>
);

const bytesToString = (mb: number): string => {
    if (mb >= 1024) return `${(mb / 1024).toFixed(mb % 1024 === 0 ? 0 : 1)} GB`;
    return `${mb} MB`;
};

export default ({ values, setValue, onNext, onBack, freeServerData }: Props) => {
    const [plans, setPlans] = useState<Plan[] | null>(null);

    useEffect(() => {
        getPlans()
            .then(setPlans)
            .catch(() => setPlans([]));
    }, []);

    const credits = freeServerData?.credits ?? 0;

    if (plans === null) {
        return (
            <div css={tw`py-8`}>
                <Spinner centered />
            </div>
        );
    }

    return (
        <div>
            {/* Credit balance */}
            <div css={tw`flex items-center justify-between mb-4 px-3 py-2.5 rounded-lg bg-surface border border-white/10`}>
                <span css={tw`text-sm text-neutral-400`}>Your credit balance</span>
                <span css={tw`text-sm font-semibold text-neutral-200`}>{credits} credits</span>
            </div>

            <div css={tw`grid grid-cols-1 sm:grid-cols-2 gap-3 mb-1`}>
                {plans.map((plan) => {
                    const affordable = credits >= plan.creditCost;
                    const selected = values.planId === plan.id;

                    return (
                        <PlanCard
                            key={plan.id}
                            $selected={selected}
                            $disabled={!affordable}
                            onClick={() => affordable && setValue('planId', plan.id)}
                        >
                            <div css={tw`flex items-start justify-between mb-2`}>
                                <p css={tw`font-medium text-neutral-200`}>{plan.name}</p>
                                {selected && <CheckCircle size={16} css={tw`text-primary-400 flex-shrink-0`} />}
                            </div>
                            {plan.description && (
                                <p css={tw`text-xs text-neutral-400 mb-3 leading-relaxed`}>{plan.description}</p>
                            )}
                            <div css={tw`flex flex-wrap gap-3 mb-3`}>
                                <StatBadge
                                    icon={<MemoryStick size={11} />}
                                    value={bytesToString(plan.memory)}
                                />
                                <StatBadge
                                    icon={<HardDrive size={11} />}
                                    value={bytesToString(plan.disk)}
                                />
                                <StatBadge
                                    icon={<Cpu size={11} />}
                                    value={`${plan.cpu}% CPU`}
                                />
                            </div>
                            <div css={tw`border-t border-white/10 pt-2.5`}>
                                <span
                                    css={[
                                        tw`text-sm font-semibold`,
                                        plan.creditCost === 0 ? tw`text-green-400` : tw`text-neutral-200`,
                                    ]}
                                >
                                    {plan.creditCost === 0 ? 'Free' : `${plan.creditCost} credits`}
                                </span>
                                {!affordable && plan.creditCost > 0 && (
                                    <span css={tw`text-xs text-red-400 ml-2`}>Insufficient credits</span>
                                )}
                            </div>
                        </PlanCard>
                    );
                })}
            </div>

            <Dialog.Footer>
                <Button.Text onClick={onBack}>Back</Button.Text>
                <Button disabled={!values.planId} onClick={onNext}>Continue</Button>
            </Dialog.Footer>
        </div>
    );
};
