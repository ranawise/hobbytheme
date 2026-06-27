import React, { useEffect, useMemo, useState } from 'react';
import tw from 'twin.macro';
import styled from 'styled-components/macro';
import { debounce } from 'debounce';
import { Button } from '@/components/elements/button';
import { Dialog } from '@/components/elements/dialog';
import { checkNameAvailable, getMinecraftVersions, Software, VersionGroup } from '@/api/account/defaultServer';
import { StepProps } from '@/components/dashboard/wizard/types';
import { CheckCircle, XCircle, Loader, Globe } from 'lucide-react';

const SOFTWARE_OPTIONS: { value: Software; label: string }[] = [
    { value: 'paper', label: 'Paper' },
    { value: 'purpur', label: 'Purpur' },
    { value: 'fabric', label: 'Fabric' },
    { value: 'forge', label: 'Forge' },
    { value: 'neoforge', label: 'NeoForge' },
];

const BASE_DOMAINS = ['hobbyservers.com', 'hobbyservers.gg'];

type NameStatus = 'idle' | 'checking' | 'available' | 'unavailable' | 'invalid';

const FieldLabel = styled.label`
    ${tw`block text-xs font-medium text-neutral-400 uppercase tracking-wide mb-2`};
`;

const StyledInput = styled.input`
    ${tw`w-full bg-neutral-900 border border-white/10 rounded-md px-3 py-2 text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-white/30 transition-colors`};
`;

const StyledSelect = styled.select`
    ${tw`w-full bg-neutral-900 border border-white/10 rounded-md px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-white/30 transition-colors appearance-none`};
`;

const SoftwareChip = styled.button<{ $active: boolean }>`
    ${tw`px-3 py-1.5 rounded-md text-sm font-medium border transition-all duration-150`};
    ${({ $active }) =>
        $active
            ? tw`border-primary-500 bg-primary-500/10 text-primary-300`
            : tw`border-white/10 bg-surface text-neutral-400 hover:border-white/20 hover:text-neutral-300`};
`;

export default ({ values, setValue, onNext, onBack }: StepProps) => {
    const [nameStatus, setNameStatus] = useState<NameStatus>('idle');
    const [versionGroups, setVersionGroups] = useState<VersionGroup[]>([]);
    const [loadingVersions, setLoadingVersions] = useState(false);

    const checkName = useMemo(
        () =>
            debounce((name: string) => {
                if (name.length < 3 || name.length > 12 || !/^[a-z0-9_-]+$/.test(name)) {
                    setNameStatus('invalid');
                    return;
                }
                setNameStatus('checking');
                checkNameAvailable(name)
                    .then((available) => setNameStatus(available ? 'available' : 'unavailable'))
                    .catch(() => setNameStatus('idle'));
            }, 350),
        []
    );

    useEffect(() => {
        if (!values.name) {
            setNameStatus('idle');
            return;
        }
        checkName(values.name.toLowerCase());
    }, [values.name]);

    useEffect(() => {
        setLoadingVersions(true);
        setVersionGroups([]);
        getMinecraftVersions(values.software)
            .then((groups) => {
                setVersionGroups(groups);
                const firstStable = groups.flatMap((g) => g.versions).find((v) => !v.experimental);
                setValue('minecraftVersion', firstStable?.version ?? groups[0]?.versions[0]?.version ?? '');
            })
            .catch(() => setVersionGroups([]))
            .then(() => setLoadingVersions(false));
    }, [values.software]);

    const canContinue = nameStatus === 'available' && !!values.minecraftVersion && !loadingVersions;

    return (
        <div>
            {/* Server name */}
            <div css={tw`mb-5`}>
                <FieldLabel>Server Name</FieldLabel>
                <StyledInput
                    value={values.name}
                    onChange={(e) => setValue('name', e.target.value.toLowerCase())}
                    placeholder={'survival'}
                    autoFocus
                />
                {/* Status row */}
                <div css={tw`mt-2 flex items-center gap-1.5`}>
                    {nameStatus === 'checking' && (
                        <>
                            <Loader size={13} css={tw`text-neutral-500 animate-spin`} />
                            <span css={tw`text-xs text-neutral-500`}>Checking availability…</span>
                        </>
                    )}
                    {nameStatus === 'invalid' && (
                        <>
                            <XCircle size={13} css={tw`text-red-400`} />
                            <span css={tw`text-xs text-red-400`}>3–12 characters, letters, numbers, - or _</span>
                        </>
                    )}
                    {nameStatus === 'unavailable' && (
                        <>
                            <XCircle size={13} css={tw`text-red-400`} />
                            <span css={tw`text-xs text-red-400`}>That name is already taken</span>
                        </>
                    )}
                    {nameStatus === 'available' && (
                        <>
                            <CheckCircle size={13} css={tw`text-green-400`} />
                            <span css={tw`text-xs text-green-400`}>Available!</span>
                        </>
                    )}
                    {nameStatus === 'idle' && values.name && (
                        <span css={tw`text-xs text-neutral-600`}>3–12 characters</span>
                    )}
                </div>
                {/* Domain preview */}
                {values.name && nameStatus === 'available' && (
                    <div css={tw`mt-2 flex flex-wrap gap-1`}>
                        {BASE_DOMAINS.map((domain) => (
                            <span
                                key={domain}
                                css={tw`inline-flex items-center gap-1 text-xs bg-neutral-900 border border-white/10 rounded-full px-2.5 py-1 text-neutral-400`}
                            >
                                <Globe size={11} />
                                {values.name}.{domain}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Software */}
            <div css={tw`mb-5`}>
                <FieldLabel>Server Software</FieldLabel>
                <div css={tw`flex flex-wrap gap-2`}>
                    {SOFTWARE_OPTIONS.map((option) => (
                        <SoftwareChip
                            key={option.value}
                            type={'button'}
                            $active={values.software === option.value}
                            onClick={() => setValue('software', option.value)}
                        >
                            {option.label}
                        </SoftwareChip>
                    ))}
                </div>
            </div>

            {/* Version */}
            <div css={tw`mb-5`}>
                <FieldLabel>Minecraft Version</FieldLabel>
                <StyledSelect
                    disabled={loadingVersions}
                    value={values.minecraftVersion}
                    onChange={(e) => setValue('minecraftVersion', e.target.value)}
                >
                    {loadingVersions && <option>Loading versions…</option>}
                    {!loadingVersions && versionGroups.length === 0 && <option>No versions available</option>}
                    {versionGroups.map((group) => (
                        <optgroup key={group.major} label={group.major}>
                            {group.versions.map((v) => (
                                <option key={v.version} value={v.version}>
                                    {v.version}{v.experimental ? ' (experimental)' : ''}
                                </option>
                            ))}
                        </optgroup>
                    ))}
                </StyledSelect>
            </div>

            <Dialog.Footer>
                <Button.Text onClick={onBack}>Back</Button.Text>
                <Button disabled={!canContinue} onClick={onNext}>Continue</Button>
            </Dialog.Footer>
        </div>
    );
};
