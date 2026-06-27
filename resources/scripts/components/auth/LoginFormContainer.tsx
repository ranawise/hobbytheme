import React, { forwardRef } from 'react';
import { Form } from 'formik';
import styled from 'styled-components/macro';
import tw from 'twin.macro';
import FlashMessageRender from '@/components/FlashMessageRender';

import BeforeContent from '@blueprint/components/Authentication/Container/BeforeContent';
import AfterContent from '@blueprint/components/Authentication/Container/AfterContent';

type Props = React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement> & {
    title?: string;
};

const Card = styled.div`
    width: 100%;
    max-width: 380px;
    background: #111114;
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 12px;
    padding: 36px 32px;
`;

export default forwardRef<HTMLFormElement, Props>(({ title, children, ...rest }, ref) => {
    const { css: _css, className: _cls, ...formProps } = rest as any;
    return (
        <Card>
            <div style={{ marginBottom: '28px', textAlign: 'center' }}>
                <p style={{ fontSize: '20px', fontWeight: 700, color: '#f4f4f5', margin: '0 0 4px 0' }}>
                    HobbyServers
                </p>
                {title && (
                    <p style={{ fontSize: '13px', color: '#52525b', margin: 0 }}>{title}</p>
                )}
            </div>

            <FlashMessageRender css={tw`mb-5`} />
            <BeforeContent />

            <Form ref={ref} {...formProps}>
                {children}
            </Form>

            <AfterContent />

        </Card>
    );
});
