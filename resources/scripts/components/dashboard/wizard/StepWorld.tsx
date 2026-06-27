import React, { useMemo } from 'react';
import tw from 'twin.macro';
import styled from 'styled-components/macro';
import { Button } from '@/components/elements/button';
import { Dialog } from '@/components/elements/dialog';
import { StepProps } from '@/components/dashboard/wizard/types';
import { X } from 'lucide-react';

const FieldLabel = styled.label`
    ${tw`block text-xs font-medium text-neutral-400 uppercase tracking-wide mb-2`};
`;

const StyledSelect = styled.select`
    ${tw`w-full bg-neutral-900 border border-white/10 rounded-md px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-white/30 transition-colors appearance-none`};
`;

const StyledInput = styled.input`
    ${tw`w-full bg-neutral-900 border border-white/10 rounded-md px-3 py-2 text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-white/30 transition-colors`};
`;

const OptionChip = styled.button<{ $active: boolean }>`
    ${tw`px-3 py-1.5 rounded-md text-sm font-medium border transition-all duration-150`};
    ${({ $active }) =>
        $active
            ? tw`border-primary-500 bg-primary-500/10 text-primary-300`
            : tw`border-white/10 bg-surface text-neutral-400 hover:border-white/20 hover:text-neutral-300`};
`;

// A name is "committed" once it's followed by a comma or after typing a valid standalone name
const completedOperatorNames = (raw: string): string[] => {
    const parts = raw.split(',');
    const completed = raw.trimEnd().endsWith(',') ? parts : parts.slice(0, -1);
    return completed.map((n) => n.trim()).filter((n) => /^\w{3,16}$/.test(n));
};

export default ({ values, setValue, onNext, onBack }: StepProps) => {
    const operatorNames = useMemo(() => completedOperatorNames(values.operators), [values.operators]);

    return (
        <div>
            {/* World type */}
            <div css={tw`mb-5`}>
                <FieldLabel>World Type</FieldLabel>
                <div css={tw`flex gap-2`}>
                    {(['normal', 'flat'] as const).map((type) => (
                        <OptionChip
                            key={type}
                            type={'button'}
                            $active={values.worldType === type}
                            onClick={() => setValue('worldType', type)}
                        >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                        </OptionChip>
                    ))}
                </div>
            </div>

            {/* Gamemode */}
            <div css={tw`mb-5`}>
                <FieldLabel>Default Gamemode</FieldLabel>
                <div css={tw`flex flex-wrap gap-2`}>
                    {(['survival', 'creative', 'adventure'] as const).map((mode) => (
                        <OptionChip
                            key={mode}
                            type={'button'}
                            $active={values.gamemode === mode}
                            onClick={() => setValue('gamemode', mode)}
                        >
                            {mode.charAt(0).toUpperCase() + mode.slice(1)}
                        </OptionChip>
                    ))}
                </div>
            </div>

            {/* Operators */}
            <div css={tw`mb-5`}>
                <FieldLabel>Server Operators</FieldLabel>
                <StyledInput
                    value={values.operators}
                    onChange={(e) => setValue('operators', e.target.value)}
                    placeholder={'Steve, Alex,'}
                />
                <p css={tw`text-xs text-neutral-500 mt-1.5`}>
                    Comma-separated Minecraft usernames. Leave blank for none.
                </p>
                {operatorNames.length > 0 && (
                    <div css={tw`flex flex-wrap gap-2 mt-3`}>
                        {operatorNames.map((name) => (
                            <div
                                key={name}
                                css={tw`flex items-center gap-2 bg-surface border border-white/10 rounded-lg px-2.5 py-1.5`}
                            >
                                <img
                                    src={`https://mc-heads.net/avatar/${encodeURIComponent(name)}/24`}
                                    alt={name}
                                    width={20}
                                    height={20}
                                    css={tw`rounded-sm flex-shrink-0`}
                                    style={{ imageRendering: 'pixelated' }}
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                                <span css={tw`text-sm text-neutral-200`}>{name}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Dialog.Footer>
                <Button.Text onClick={onBack}>Back</Button.Text>
                <Button onClick={onNext}>Continue</Button>
            </Dialog.Footer>
        </div>
    );
};
