import React, { useEffect } from 'react';
import ContentContainer from '@/components/elements/ContentContainer';
import { CSSTransition } from 'react-transition-group';
import tw from 'twin.macro';
import FlashMessageRender from '@/components/FlashMessageRender';

export interface PageContentBlockProps {
    title?: string;
    className?: string;
    showFlashKey?: string;
    // Used by pages (like the server console) that want to fill the entire
    // viewport below the navigation bar — renders full-bleed (no max-width,
    // no margins) and skips the copyright footer.
    compact?: boolean;
}

import BeforeSection from '@blueprint/components/Dashboard/Global/BeforeSection';
import AfterSection from '@blueprint/components/Dashboard/Global/AfterSection';

const PageContentBlock: React.FC<PageContentBlockProps> = ({ title, showFlashKey, className, compact, children }) => {
    useEffect(() => {
        document.title = title ? `HobbyServers - ${title}` : 'HobbyServers';
    }, [title]);

    return (
        <CSSTransition timeout={150} classNames={'fade'} appear in>
            <>
                <BeforeSection/>
                {compact ? (
                    <div css={tw`w-full`} className={className}>
                        {showFlashKey && <FlashMessageRender byKey={showFlashKey} css={tw`mb-4`} />}
                        {children}
                    </div>
                ) : (
                    <ContentContainer css={tw`my-4 sm:my-10`} className={className}>
                        {showFlashKey && <FlashMessageRender byKey={showFlashKey} css={tw`mb-4`} />}
                        {children}
                    </ContentContainer>
                )}
                <AfterSection/>
            </>
        </CSSTransition>
    );
};

export default PageContentBlock;
