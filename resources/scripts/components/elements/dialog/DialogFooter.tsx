import React, { useContext } from 'react';
import { DialogContext } from './';
import { useDeepCompareEffect } from '@/plugins/useDeepCompareEffect';

export default ({ children }: { children: React.ReactNode }) => {
    const { setFooter } = useContext(DialogContext);

    useDeepCompareEffect(() => {
        setFooter(
            <div className={'px-6 py-3 bg-black/40 border-t border-white/10 flex items-center justify-end space-x-3 rounded-b-lg'}>
                {children}
            </div>
        );
    }, [children]);

    return null;
};
