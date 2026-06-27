import { Software } from '@/api/account/defaultServer';

export interface WizardValues {
    path: 'default' | 'external' | null;

    // Default Server path
    name: string;
    software: Software;
    minecraftVersion: string;
    worldType: 'normal' | 'flat';
    gamemode: 'survival' | 'creative' | 'adventure';
    operators: string;
    planId: number | null;

    // External Server path
    externalName: string;
    host: string;
    port: string;
    notes: string;
}

export const initialWizardValues: WizardValues = {
    path: null,
    name: '',
    software: 'paper',
    minecraftVersion: '',
    worldType: 'normal',
    gamemode: 'survival',
    operators: '',
    planId: null,
    externalName: '',
    host: '',
    port: '25565',
    notes: '',
};

export interface StepProps {
    values: WizardValues;
    setValue: <K extends keyof WizardValues>(key: K, value: WizardValues[K]) => void;
    onNext: () => void;
    onBack: () => void;
}
