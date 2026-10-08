import React, { forwardRef } from 'react';

const Input = forwardRef(
  (
    {
      label,
      error,
      helperText,
      icon: Icon,
      type = 'text',
      id,
      name,
      placeholder,
      value,
      onChange,
      required = false,
      disabled = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const inputId = id || name || Math.random().toString(36).substring(7);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
          >
            {label}
            {required && <span className="text-rose-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative rounded-lg">
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Icon className="w-4 h-4" />
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            name={name}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            disabled={disabled}
            required={required}
            aria-invalid={!!error}
            className={`w-full rounded-lg border text-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:bg-gray-100 disabled:text-gray-400 dark:disabled:bg-gray-800/40 dark:disabled:text-gray-600 ${
              Icon ? 'pl-9' : 'pl-3'
            } pr-3 py-2 ${
              error
                ? 'border-rose-500 bg-rose-50/20 text-rose-900 focus:ring-rose-500 dark:bg-rose-950/20 dark:text-rose-200'
                : 'border-gray-300 bg-white text-gray-900 hover:border-gray-400 focus:border-brand-500 focus:ring-brand-500/30 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:border-gray-600 dark:focus:ring-brand-500/30 dark:focus:ring-offset-[#0B0F19]'
            } ${className}`}
            {...props}
          />
        </div>

        {error && (
          <p className="mt-1 text-xs text-rose-500 font-medium animate-fade-in">{error}</p>
        )}
        {!error && helperText && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
