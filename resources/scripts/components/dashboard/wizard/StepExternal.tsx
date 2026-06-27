import React from 'react';
import tw from 'twin.macro';
import styled from 'styled-components/macro';
import { Button } from '@/components/elements/button';
import { Dialog } from '@/components/elements/dialog';
import { StepProps } from '@/components/dashboard/wizard/types';

const FieldLabel = styled.label`
    ${tw`block text-xs font-medium text-neutral-400 uppercase tracking-wide mb-2`};
`;

const StyledInput = styled.input`
    ${tw`w-full bg-neutral-900 border border-white/10 rounded-md px-3 py-2 text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-white/30 transition-colors`};
`;

export default ({ values, setValue, onNext, onBack }: StepProps) => {
    const canContinue = values.externalName.length >= 3 && values.host.length > 0;

    return (
        <div>
            <div css={tw`mb-5`}>
                <FieldLabel>Server Name</FieldLabel>
                <StyledInput
                    value={values.externalName}
                    onChange={(e) => setValue('externalName', e.target.value)}
                    placeholder={'My Survival Server'}
                    autoFocus
                />
            </div>
            <div css={tw`mb-5`}>
                <FieldLabel>Host / IP Address</FieldLabel>
                <StyledInput
                    value={values.host}
                    onChange={(e) => setValue('host', e.target.value)}
                    placeholder={'203.0.113.5'}
                />
            </div>
            <div css={tw`mb-5`}>
                <FieldLabel>Port</FieldLabel>
                <StyledInput
                    value={values.port}
                    onChange={(e) => setValue('port', e.target.value)}
                    placeholder={'25565'}
                />
            </div>
            <div css={tw`mb-5`}>
                <FieldLabel>Notes <span css={tw`normal-case font-normal text-neutral-600`}>(optional)</span></FieldLabel>
                <StyledInput
                    value={values.notes}
                    onChange={(e) => setValue('notes', e.target.value)}
                    placeholder={'Any notes about this server…'}
                />
            </div>
            <Dialog.Footer>
                <Button.Text onClick={onBack}>Back</Button.Text>
                <Button disabled={!canContinue} onClick={onNext}>Continue</Button>
            </Dialog.Footer>
        </div>
    );
};
