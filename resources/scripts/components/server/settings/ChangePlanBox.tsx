import React, { useEffect, useState } from 'react';
import tw from 'twin.macro';
import { ServerContext } from '@/state/server';
import { Actions, useStoreActions } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import { httpErrorToHuman } from '@/api/http';
import TitledGreyBox from '@/components/elements/TitledGreyBox';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import { Button } from '@/components/elements/button/index';
import { AvailablePlan, changeServerPlan, getAvailablePlans } from '@/api/server/changePlan';

export default () => {
    const server = ServerContext.useStoreState((state) => state.server.data!);
    const setServer = ServerContext.useStoreActions((actions) => actions.server.setServer);
    const { addError, addFlash, clearFlashes } = useStoreActions((actions: Actions<ApplicationStore>) => actions.flashes);

    const [plans, setPlans] = useState<AvailablePlan[] | null>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        getAvailablePlans(server.uuid)
            .then(setPlans)
            .catch((error) => {
                console.error(error);
                setPlans([]);
            });
    }, [server.uuid]);

    if (!server.plan) {
        // This server wasn't created with a Plan (a legacy free server, or an
        // External Server registration), so there's nothing to switch between.
        return null;
    }

    const submit = (plan: AvailablePlan) => {
        clearFlashes('settings');
        setSubmitting(true);

        changeServerPlan(server.uuid, plan.id)
            .then((netCredits) => {
                setServer({
                    ...server,
                    limits: { ...server.limits, memory: plan.memory, disk: plan.disk, cpu: plan.cpu },
                    plan: { ...server.plan!, id: plan.id, name: plan.name, creditCost: plan.creditCost },
                });

                if (netCredits > 0) {
                    addFlash({ key: 'settings', type: 'success', message: `Switched to ${plan.name} — ${netCredits} credits charged.` });
                } else if (netCredits < 0) {
                    addFlash({ key: 'settings', type: 'success', message: `Switched to ${plan.name} — ${Math.abs(netCredits)} credits refunded.` });
                } else {
                    addFlash({ key: 'settings', type: 'success', message: `Switched to ${plan.name}.` });
                }
            })
            .catch((error) => {
                console.error(error);
                addError({ key: 'settings', message: httpErrorToHuman(error) });
            })
            .then(() => setSubmitting(false));
    };

    return (
        <TitledGreyBox title={'Server Plan'} css={tw`relative`}>
            <SpinnerOverlay visible={submitting || plans === null} />
            <p css={tw`text-sm text-neutral-300`}>
                Current plan: <strong css={tw`text-white`}>{server.plan.name}</strong> ({server.plan.creditCost}{' '}
                credits / month)
                {server.plan.renewsAt && (
                    <>
                        {' '}
                        — renews{' '}
                        <strong css={tw`text-white`}>{new Date(server.plan.renewsAt).toLocaleDateString()}</strong>
                    </>
                )}
            </p>
            {plans && plans.length > 0 && (
                <div css={tw`grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4`}>
                    {plans
                        .filter((plan) => plan.id !== server.plan!.id)
                        .map((plan) => (
                            <div key={plan.id} css={tw`p-4 rounded-lg border border-white/10 bg-black/30`}>
                                <p css={tw`font-medium text-white`}>{plan.name}</p>
                                <p css={tw`text-sm text-neutral-400 mt-1`}>
                                    {plan.memory} MB memory, {plan.disk} MB disk, {plan.cpu}% CPU
                                </p>
                                <p css={tw`text-sm text-neutral-300 mt-1`}>{plan.creditCost} Credits / month</p>
                                <Button
                                    size={Button.Sizes.Small}
                                    css={tw`mt-3`}
                                    onClick={() => submit(plan)}
                                    disabled={submitting}
                                >
                                    Switch to this Plan
                                </Button>
                            </div>
                        ))}
                </div>
            )}
            <p css={tw`text-xs text-neutral-500 mt-4`}>
                Switching takes effect immediately. You&apos;ll be charged or refunded credits prorated for the time
                remaining in your current billing cycle.
            </p>
        </TitledGreyBox>
    );
};
