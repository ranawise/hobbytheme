import styled, { css } from 'styled-components/macro';
import tw from 'twin.macro';

interface Props {
    hideDropdownArrow?: boolean;
}

const Select = styled.select<Props>`
    ${tw`shadow-none block p-3 pr-8 rounded border w-full text-sm transition-colors duration-150 ease-linear`};

    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;

    &::-ms-expand {
        display: none;
    }

    &,
    &:hover:not(:disabled),
    &:focus {
        outline: none;
    }

    ${(props) =>
        !props.hideDropdownArrow &&
        css`
            background-color: #101013;
            background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3e%3cpath fill='%2371717a' d='M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z'/%3e%3c/svg%3e");
            background-size: 1rem;
            background-repeat: no-repeat;
            background-position-x: calc(100% - 0.75rem);
            background-position-y: center;
            border-color: rgba(255, 255, 255, 0.13);
            color: #fff;

            option {
                background: #101013;
            }

            &:hover:not(:disabled) {
                border-color: rgba(255, 255, 255, 0.22);
            }

            &:focus {
                border-color: rgba(255, 255, 255, 0.35);
                box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.05);
            }
        `};
`;

export default Select;
