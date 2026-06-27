import React, { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { CSSTransition } from 'react-transition-group';
import styled from 'styled-components/macro';
import tw from 'twin.macro';
import Portal from '@/components/elements/Portal';
import copy from 'copy-to-clipboard';
import classNames from 'classnames';

interface CopyOnClickProps {
    text: string | number | null | undefined;
    showInNotification?: boolean;
    children: React.ReactNode;
}

const ToastTransition = styled.div`
    ${tw`fixed z-50 bottom-0 right-0 m-4`};

    .copy-toast-enter,
    .copy-toast-appear {
        ${tw`opacity-0 translate-y-2`};
    }

    .copy-toast-enter-active,
    .copy-toast-appear-active {
        ${tw`opacity-100 translate-y-0 transition-all ease-out`};
        transition-duration: 200ms;
    }

    .copy-toast-exit {
        ${tw`opacity-100 translate-y-0`};
    }

    .copy-toast-exit-active {
        ${tw`opacity-0 translate-y-2 transition-all ease-in`};
        transition-duration: 150ms;
    }
`;

const CopyOnClick = ({ text, showInNotification = true, children }: CopyOnClickProps) => {
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!copied) return;

        const timeout = setTimeout(() => {
            setCopied(false);
        }, 2500);

        return () => {
            clearTimeout(timeout);
        };
    }, [copied]);

    if (!React.isValidElement(children)) {
        throw new Error('Component passed to <CopyOnClick/> must be a valid React element.');
    }

    const child = !text
        ? React.Children.only(children)
        : React.cloneElement(React.Children.only(children), {
              // @ts-expect-error todo: check on this
              className: classNames(children.props.className || '', 'cursor-pointer'),
              onClick: (e: React.MouseEvent<HTMLElement>) => {
                  copy(String(text));
                  setCopied(true);
                  if (typeof children.props.onClick === 'function') {
                      children.props.onClick(e);
                  }
              },
          });

    return (
        <>
            <Portal>
                <ToastTransition>
                    <CSSTransition in={copied} timeout={200} classNames={'copy-toast'} unmountOnExit>
                        <div
                            css={tw`flex items-center gap-2 rounded-lg py-3 px-4 text-sm text-neutral-200 bg-surface border border-white/10 shadow-lg`}
                        >
                            <CheckCircle2 size={16} css={tw`text-green-400 flex-shrink-0`} />
                            <p>
                                {showInNotification
                                    ? `Copied "${String(text)}" to clipboard.`
                                    : 'Copied text to clipboard.'}
                            </p>
                        </div>
                    </CSSTransition>
                </ToastTransition>
            </Portal>
            {child}
        </>
    );
};

export default CopyOnClick;
