"use client";

import * as React from "react";
import { cn } from "cn";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CONTROL_CLASS, SELECT_CLASS, SELECT_STYLE } from "./styles";

export { CONTROL_CLASS };

export function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  className,
  children,
  labelAdornment,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
  labelAdornment?: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <Label htmlFor={htmlFor} className="text-cream/75">
          {label}
          {required ? <span className="text-gold">*</span> : null}
        </Label>
        {labelAdornment}
      </div>
      {children}
      {error ? (
        <p role="alert" className="text-xs text-[#e78a82]">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-cream/40">{hint}</p>
      ) : null}
    </div>
  );
}

type FieldShellProps = {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  labelAdornment?: React.ReactNode;
};

export function TextField({
  label,
  hint,
  error,
  required,
  className,
  labelAdornment,
  ...props
}: FieldShellProps & React.ComponentProps<typeof Input>) {
  const id = props.id ?? props.name;
  return (
    <Field
      label={label}
      htmlFor={id}
      hint={hint}
      error={error}
      required={required}
      className={className}
      labelAdornment={labelAdornment}
    >
      <Input
        {...props}
        id={id}
        aria-invalid={error ? true : undefined}
        className={cn(CONTROL_CLASS, "h-9")}
      />
    </Field>
  );
}

export function NumberField({
  label,
  hint,
  error,
  required,
  className,
  labelAdornment,
  ...props
}: FieldShellProps & React.ComponentProps<typeof Input>) {
  return (
    <TextField
      label={label}
      hint={hint}
      error={error}
      required={required}
      className={className}
      labelAdornment={labelAdornment}
      type="number"
      inputMode="numeric"
      {...props}
    />
  );
}

export function TextAreaField({
  label,
  hint,
  error,
  required,
  className,
  labelAdornment,
  ...props
}: FieldShellProps & React.ComponentProps<typeof Textarea>) {
  const id = props.id ?? props.name;
  return (
    <Field
      label={label}
      htmlFor={id}
      hint={hint}
      error={error}
      required={required}
      className={className}
      labelAdornment={labelAdornment}
    >
      <Textarea
        {...props}
        id={id}
        aria-invalid={error ? true : undefined}
        className={cn(
          CONTROL_CLASS,
          "min-h-24 rounded-none px-3 py-2 text-sm leading-relaxed",
        )}
      />
    </Field>
  );
}

export function SelectField({
  label,
  hint,
  error,
  required,
  className,
  options,
  placeholder,
  labelAdornment,
  ...props
}: FieldShellProps &
  React.ComponentProps<"select"> & {
    options: { value: string; label: string }[];
    placeholder?: string;
  }) {
  const id = props.id ?? props.name;
  return (
    <Field
      label={label}
      htmlFor={id}
      hint={hint}
      error={error}
      required={required}
      className={className}
      labelAdornment={labelAdornment}
    >
      <select
        {...props}
        id={id}
        aria-invalid={error ? true : undefined}
        className={cn(SELECT_CLASS, "h-9")}
        style={{ ...SELECT_STYLE, ...props.style }}
      >
        {placeholder ? (
          <option value="" className="bg-[#131317] text-cream">
            {placeholder}
          </option>
        ) : null}
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-[#131317] text-cream">
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function CheckField({
  label,
  hint,
  checked,
  onCheckedChange,
  disabled,
  className,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 border border-white/10 bg-white/[0.02] px-3.5 py-3 transition-colors hover:border-gold/35 has-data-[disabled=true]:opacity-60",
        className,
      )}
    >
      <Checkbox
        checked={checked}
        disabled={disabled}
        onCheckedChange={(v) => onCheckedChange(v === true)}
        className="mt-0.5"
      />
      <span className="min-w-0">
        <span className="block text-sm text-cream/85">{label}</span>
        {hint ? <span className="mt-0.5 block text-xs text-cream/40">{hint}</span> : null}
      </span>
    </label>
  );
}
