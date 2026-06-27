import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Formik, FormikHelpers } from 'formik';
import { object, string, ref as yupRef } from 'yup';
import tw from 'twin.macro';
import styled from 'styled-components/macro';
import Field from '@/components/elements/Field';
import Button from '@/components/elements/Button';
import FlashMessageRender from '@/components/FlashMessageRender';
import useFlash from '@/plugins/useFlash';
import register, { RegisterData } from '@/api/auth/register';
import LoginFormContainer from '@/components/auth/LoginFormContainer';

const AuthBtn = styled(Button)`
    background: #e4e4e7 !important;
    color: #09090b !important;
    border-radius: 8px !important;
    font-weight: 600;
    font-size: 13px;
    transition: background 0.15s !important;

    &:hover:not(:disabled) {
        background: #f4f4f5 !important;
    }

    &:disabled {
        opacity: 0.5 !important;
    }
`;

const OAuthBtn = styled.a`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: 100%;
    padding: 10px 16px;
    border-radius: 8px;
    border: 1px solid rgba(255,255,255,0.09);
    background: rgba(255,255,255,0.04);
    color: #d4d4d8;
    font-size: 13px;
    font-weight: 500;
    text-decoration: none;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s, color 0.15s;

    &:hover {
        background: rgba(255,255,255,0.08);
        border-color: rgba(255,255,255,0.15);
        color: #f4f4f5;
        text-decoration: none;
    }
`;

const Divider = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 20px 0;

    &::before, &::after {
        content: '';
        flex: 1;
        height: 1px;
        background: rgba(255,255,255,0.07);
    }

    span {
        font-size: 11px;
        color: #52525b;
        white-space: nowrap;
    }
`;

const GoogleIcon = () => (
    <svg width='16' height='16' viewBox='0 0 24 24' fill='none'>
        <path d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z' fill='#4285F4'/>
        <path d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z' fill='#34A853'/>
        <path d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z' fill='#FBBC05'/>
        <path d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z' fill='#EA4335'/>
    </svg>
);

const DiscordIcon = () => (
    <svg width='16' height='16' viewBox='0 0 24 24' fill='#5865F2'>
        <path d='M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z'/>
    </svg>
);

const Card = styled.div`
    width: 100%;
    max-width: 380px;
    background: #111114;
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 12px;
    padding: 36px 32px;
`;

const SuccessCard = styled.div`
    text-align: center;
    padding: 8px 0;
`;

export default () => {
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const [done, setDone] = useState(false);

    useEffect(() => { clearFlashes(); }, []);

    const submit = (values: RegisterData, { setSubmitting }: FormikHelpers<RegisterData>) => {
        clearFlashes();
        register(values)
            .then(() => setDone(true))
            .catch((error) => {
                clearAndAddHttpError({ error });
                setSubmitting(false);
            });
    };

    if (done) {
        return (
            <Card>
                <SuccessCard>
                    <p style={{ fontSize: 16, fontWeight: 600, color: '#f4f4f5', marginBottom: 8 }}>Check your inbox</p>
                    <p style={{ fontSize: 13, color: '#71717a', lineHeight: 1.6 }}>
                        We sent a verification link to your email. Click it to activate your account, then sign in.
                    </p>
                    <div css={tw`mt-6`}>
                        <Link
                            to={'/auth/login'}
                            css={tw`text-sm text-neutral-500 no-underline hover:text-neutral-300 transition-colors`}
                        >
                            Back to sign in
                        </Link>
                    </div>
                </SuccessCard>
            </Card>
        );
    }

    return (
        <Formik
            onSubmit={submit}
            initialValues={{
                first_name: '',
                last_name: '',
                email: '',
                username: '',
                password: '',
                password_confirmation: '',
            }}
            validationSchema={object().shape({
                first_name: string().required('First name is required.'),
                last_name: string().required('Last name is required.'),
                email: string().email('Enter a valid email address.').required('Email is required.'),
                username: string().min(3, 'Username must be at least 3 characters.').required('Username is required.'),
                password: string().min(8, 'Password must be at least 8 characters.').required('Password is required.'),
                password_confirmation: string()
                    .oneOf([yupRef('password')], 'Passwords do not match.')
                    .required('Please confirm your password.'),
            })}
        >
            {({ isSubmitting }) => (
                <LoginFormContainer title={'Create an account'}>
                    <FlashMessageRender css={tw`mb-4`} />

                    <div css={tw`flex gap-3`}>
                        <div css={tw`flex-1`}>
                            <Field label={'First Name'} name={'first_name'} type={'text'} disabled={isSubmitting} />
                        </div>
                        <div css={tw`flex-1`}>
                            <Field label={'Last Name'} name={'last_name'} type={'text'} disabled={isSubmitting} />
                        </div>
                    </div>
                    <div css={tw`mt-4`}>
                        <Field label={'Email'} name={'email'} type={'email'} disabled={isSubmitting} />
                    </div>
                    <div css={tw`mt-4`}>
                        <Field label={'Username'} name={'username'} type={'text'} disabled={isSubmitting} />
                    </div>
                    <div css={tw`mt-4`}>
                        <Field label={'Password'} name={'password'} type={'password'} disabled={isSubmitting} />
                    </div>
                    <div css={tw`mt-4`}>
                        <Field label={'Confirm Password'} name={'password_confirmation'} type={'password'} disabled={isSubmitting} />
                    </div>

                    <div css={tw`mt-6`}>
                        <AuthBtn type={'submit'} size={'xlarge'} isLoading={isSubmitting} disabled={isSubmitting}>
                            Create account
                        </AuthBtn>
                    </div>

                    <Divider><span>or sign up with</span></Divider>

                    <div css={tw`flex flex-col gap-2`}>
                        <OAuthBtn href={'/auth/oauth/google'}>
                            <GoogleIcon />
                            Continue with Google
                        </OAuthBtn>
                        <OAuthBtn href={'/auth/oauth/discord'}>
                            <DiscordIcon />
                            Continue with Discord
                        </OAuthBtn>
                    </div>

                    <div css={tw`mt-5 text-center`}>
                        <Link
                            to={'/auth/login'}
                            css={tw`text-xs text-neutral-600 tracking-wide no-underline uppercase hover:text-neutral-400 transition-colors`}
                        >
                            Already have an account? Sign in
                        </Link>
                    </div>
                </LoginFormContainer>
            )}
        </Formik>
    );
};
