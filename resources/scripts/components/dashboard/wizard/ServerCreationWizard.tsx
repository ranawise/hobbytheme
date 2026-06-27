import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import useSWR from 'swr';
import { Dialog } from '@/components/elements/dialog';
import { getFreeServerData } from '@/api/account/freeServer';
import { getPlans, Plan } from '@/api/account/defaultServer';
import { initialWizardValues, WizardValues } from '@/components/dashboard/wizard/types';
import StepPath from '@/components/dashboard/wizard/StepPath';
import StepNaming from '@/components/dashboard/wizard/StepNaming';
import StepWorld from '@/components/dashboard/wizard/StepWorld';
import StepPlan from '@/components/dashboard/wizard/StepPlan';
import StepExternal from '@/components/dashboard/wizard/StepExternal';
import StepReview from '@/components/dashboard/wizard/StepReview';
import tw from 'twin.macro';

interface Props {
    open: boolean;
    onClose: () => void;
    onExternalServerCreated: () => void;
}

const DEFAULT_STEPS = ['path', 'naming', 'world', 'plan', 'review'] as const;
const EXTERNAL_STEPS = ['path', 'external', 'review'] as const;

const STEP_LABELS: Record<string, string> = {
    path: 'Type',
    naming: 'Name & Software',
    world: 'World',
    plan: 'Plan',
    external: 'Details',
    review: 'Review',
};

export default ({ open, onClose, onExternalServerCreated }: Props) => {
    const history = useHistory();
    const [values, setValues] = useState<WizardValues>(initialWizardValues);
    const [stepIndex, setStepIndex] = useState(0);
    const [plans, setPlans] = useState<Plan[] | null>(null);

    const { data: freeServerData, mutate: mutateFreeServerData } = useSWR(
        open ? '/api/client/account/free-server' : null,
        getFreeServerData
    );

    useEffect(() => {
        if (!open) return;
        setValues(initialWizardValues);
        setStepIndex(0);
        getPlans()
            .then(setPlans)
            .catch(() => setPlans([]));
    }, [open]);

    const steps = values.path === 'external' ? EXTERNAL_STEPS : DEFAULT_STEPS;
    const step = steps[stepIndex] ?? steps[0];

    const setValue = <K extends keyof WizardValues>(key: K, value: WizardValues[K]) => {
        setValues((prev) => ({ ...prev, [key]: value }));
    };

    const onNext = () => setStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
    const onBack = () => setStepIndex((prev) => Math.max(prev - 1, 0));

    const stepProps = { values, setValue, onNext, onBack };

    const titles: Record<string, string> = {
        path: 'Create a Server',
        naming: 'Name & Software',
        world: 'World Settings',
        plan: 'Choose a Plan',
        external: 'Server Details',
        review: 'Review & Create',
    };

    return (
        <Dialog open={open} onClose={onClose} title={titles[step]}>
            {/* Step progress */}
            <div css={tw`flex items-center gap-1 mb-6 mt-2`}>
                {steps.map((s, i) => (
                    <React.Fragment key={s}>
                        <div css={tw`flex items-center gap-1.5`}>
                            <div
                                css={[
                                    tw`flex items-center justify-center w-5 h-5 rounded-full text-xs font-medium transition-colors duration-150`,
                                    i < stepIndex
                                        ? tw`bg-primary-500 text-white`
                                        : i === stepIndex
                                        ? tw`bg-primary-500/20 border border-primary-500 text-primary-400`
                                        : tw`bg-neutral-800 border border-white/10 text-neutral-600`,
                                ]}
                            >
                                {i < stepIndex ? '✓' : i + 1}
                            </div>
                            <span
                                css={[
                                    tw`text-xs transition-colors duration-150 hidden sm:inline`,
                                    i === stepIndex ? tw`text-neutral-200` : i < stepIndex ? tw`text-neutral-400` : tw`text-neutral-600`,
                                ]}
                            >
                                {STEP_LABELS[s]}
                            </span>
                        </div>
                        {i < steps.length - 1 && (
                            <div css={[tw`flex-1 h-px mx-1`, i < stepIndex ? tw`bg-primary-500/50` : tw`bg-white/10`]} />
                        )}
                    </React.Fragment>
                ))}
            </div>

            {step === 'path' && (
                <StepPath
                    {...stepProps}
                    freeServerData={freeServerData}
                    onSlotPurchased={({ credits, freeServerSlots }) =>
                        mutateFreeServerData((prev) => (prev ? { ...prev, credits, freeServerSlots } : prev), false)
                    }
                />
            )}
            {step === 'naming' && <StepNaming {...stepProps} />}
            {step === 'world' && <StepWorld {...stepProps} />}
            {step === 'plan' && <StepPlan {...stepProps} freeServerData={freeServerData} />}
            {step === 'external' && <StepExternal {...stepProps} />}
            {step === 'review' && (
                <StepReview
                    {...stepProps}
                    plans={plans}
                    onDefaultServerCreated={(identifier) => {
                        onClose();
                        history.push(`/server/${identifier}`);
                    }}
                    onExternalServerCreated={() => {
                        onClose();
                        onExternalServerCreated();
                    }}
                />
            )}
        </Dialog>
    );
};
