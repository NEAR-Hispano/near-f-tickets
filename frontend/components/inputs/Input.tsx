/* eslint-disable react/jsx-pascal-case */
/* eslint-disable react/display-name */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React from 'react';

export interface InputProps
  extends React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {
  label: string;
  setValue;
}

function _Input({
  label,
  className = '',
  name,
  setValue,
  ...rest
}: InputProps) {
  return (
    <label className="block w-full" htmlFor={name}>
      <span className="text-figma-400">{label}</span>
      <input
        className={`mt-1 block w-full text-neutral-800 border-0 border-b ${className}`}
        name={name}
        onChange={(e) => {
          e.preventDefault();
          setValue(e.target.value);
        }}
        {...rest}
      />
    </label>
  );
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (props, ref) => <_Input ref={ref} {...props} />
);
