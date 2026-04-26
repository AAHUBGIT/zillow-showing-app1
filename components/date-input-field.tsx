"use client";

import { useId, useRef } from "react";

type DateInputFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  name?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  ariaLabel?: string;
  dataField?: string;
  labelClassName?: string;
};

export function DateInputField({
  label,
  value,
  onChange,
  name,
  required = false,
  error,
  helperText = "Format: YYYY-MM-DD. Type directly or use the calendar.",
  ariaLabel,
  dataField,
  labelClassName = "text-sm font-medium text-slate-700"
}: DateInputFieldProps) {
  const inputId = useId();
  const helpId = `${inputId}-help`;
  const errorId = `${inputId}-error`;
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const openedPickerRef = useRef(false);

  function openPicker() {
    const input = inputRef.current;

    if (!input) {
      return;
    }

    input.focus({ preventScroll: true });

    const pickerInput = input as HTMLInputElement & { showPicker?: () => void };
    if (typeof pickerInput.showPicker === "function") {
      openedPickerRef.current = true;
      pickerInput.showPicker();
    }
  }

  function handleChange(nextValue: string) {
    onChange(nextValue);
    if (openedPickerRef.current) {
      openedPickerRef.current = false;
      inputRef.current?.blur();
      buttonRef.current?.focus({ preventScroll: true });
    }
  }

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <label htmlFor={inputId} className={labelClassName}>
        {label}
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          id={inputId}
          type="date"
          name={name}
          required={required}
          value={value}
          data-field={dataField || name}
          aria-label={ariaLabel || label}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${helpId} ${errorId}` : helpId}
          onChange={(event) => handleChange(event.target.value)}
          onBlur={() => {
            openedPickerRef.current = false;
          }}
          className={`app-input app-date-input pr-14 ${
            error ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100" : ""
          }`}
        />
        <button
          ref={buttonRef}
          type="button"
          onClick={openPicker}
          className="absolute right-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-line/80 bg-slate-50 text-slate-500 transition hover:border-accent hover:text-accent focus:border-accent focus:text-accent focus:ring-4 focus:ring-accent/15"
          aria-label={`Open ${ariaLabel || label} calendar`}
        >
          <CalendarIcon />
        </button>
      </div>
      <p id={helpId} className="text-xs text-slate-500">
        {helperText}
      </p>
      <p id={errorId} className="min-h-[1.25rem] text-xs font-medium text-rose-600" aria-live="polite">
        {error || ""}
      </p>
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <path d="M7 2v3M17 2v3M3.5 9.5h17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <rect x="3.5" y="4.5" width="17" height="16" rx="3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}
