import React, { useState } from 'react';
import tw from 'twin.macro';
import { Button } from '@/components/elements/button';
import { Dialog } from '@/components/elements/dialog';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import { useFlashKey } from '@/plugins/useFlash';
import FlashMessageRender from '@/components/FlashMessageRender';
import { createDefaultServer, Plan } from '@/api/account/defaultServer';
import { createExternalServer } from '@/api/account/externalServer';
import { StepProps } from '@/components/dashboard/wizard/types';
import { Rocket } from 'lucide-react';

interface Props extends StepProps {
    plans: Plan[] | null;
    onDefaultServerCreated: (identifier: string) => void;
    onExternalServerCreated: () => void;
}

interface Row {
    label: string;
    value: string;
}

export default ({ values, onBack, plans, onDefaultServerCreated, onExternalServerCreated }: Props) => {
    const { clearAndAddHttpError } = useFlashKey('dashboard:wizard');
    const [submitting, setSubmitting] = useState(false);

    const plan = plans?.find((p) => p.id === values.planId);

    const rows: Row[] =
        values.path === 'default'
            ? [
                  { label: 'Domains', value: `${values.name}.hobbyservers.com, ${values.name}.hobbyservers.gg` },
                  { label: 'Software', value: values.software },
                  { label: 'Version', value: values.minecraftVersion },
                  { label: 'World', value: values.worldType },
                  { label: 'Gamemode', value: values.gamemode },
                  { label: 'Operators', value: values.operators || 'None' },
                  { label: 'Plan', value: plan ? `${plan.name} (${plan.creditCost === 0 ? 'Free' : `${plan.creditCost} credits`})` : '-' },
              ]
            : [
                  { label: 'Name', value: values.externalName },
                  { label: 'Host', value: values.host },
                  { label: 'Port', value: values.port },
                  { label: 'Notes', value: values.notes || 'None' },
              ];

    const submit = () => {
        clearAndAddHttpError();
        setSubmitting(true);

        const request =
            values.path === 'default'
                ? createDefaultServer({
                      name: values.name,
                      planId: values.planId!,
                      software: values.software,
                      minecraftVersion: values.minecraftVersion,
                      worldType: values.worldType,
                      gamemode: values.gamemode,
                      operators: values.operators,
                  }).then(onDefaultServerCreated)
                : createExternalServer({
                      name: values.externalName,
                      host: values.host,
                      port: Number(values.port) || undefined,
                      notes: values.notes || undefined,
                  }).then(() => onExternalServerCreated());

        request.catch((error) => clearAndAddHttpError(error)).then(() => setSubmitting(false));
    };

    return (
        <div css={tw`relative`}>
            <SpinnerOverlay visible={submitting} />
            <FlashMessageRender byKey={'dashboard:wizard'} css={tw`mb-4`} />
            <p css={tw`text-sm text-neutral-400 mb-4`}>Double-check everything before creating your server.</p>
            <div css={tw`rounded-lg border border-white/10 bg-surface overflow-hidden mb-2`}>
                {rows.map((row, i) => (
                    <div
                        key={row.label}
                        css={[
                            tw`flex justify-between gap-4 px-4 py-3 text-sm`,
                            i < rows.length - 1 && tw`border-b border-white/10`,
                        ]}
                    >
                        <span css={tw`text-neutral-500 flex-shrink-0`}>{row.label}</span>
                        <span css={tw`text-neutral-200 text-right break-all`}>{row.value}</span>
                    </div>
                ))}
            </div>

            <Dialog.Footer>
                <Button.Text onClick={onBack} disabled={submitting}>Back</Button.Text>
                <Button onClick={submit} disabled={submitting}>
                    <Rocket size={15} css={tw`mr-2`} />
                    {values.path === 'default' ? 'Create Server' : 'Add Server'}
                </Button>
            </Dialog.Footer>
        </div>
    );
};
