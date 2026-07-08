"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import { Input, Textarea, Select, Label } from "@/components/atoms/Field";

interface BaseProps {
  label: string;
  name: string;
  icon?: LucideIcon;
}

type InputFieldProps = BaseProps &
  React.InputHTMLAttributes<HTMLInputElement> & {
    as?: "input";
  };

type TextareaFieldProps = BaseProps &
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    as: "textarea";
  };

type SelectFieldProps = BaseProps &
  React.SelectHTMLAttributes<HTMLSelectElement> & {
    as: "select";
    children: React.ReactNode;
  };

type FormFieldProps = InputFieldProps | TextareaFieldProps | SelectFieldProps;

/**
 * A labelled form control with an optional leading icon.
 * Renders an <input>, <textarea>, or <select> depending on `as`.
 */
export function FormField(props: FormFieldProps) {
  const { label, name, icon: Icon } = props;

  const control = renderControl(props);

  return (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <div className="relative">
        {Icon && (
          <div className="absolute top-3.5 left-0 pl-3.5 flex items-start pointer-events-none text-zinc-500">
            <Icon className="h-5 w-5" />
          </div>
        )}
        {control}
      </div>
    </div>
  );
}

function renderControl(props: FormFieldProps) {
  const hasIcon = Boolean(props.icon);

  if (props.as === "textarea") {
    const { label, icon, as, ...rest } = props;
    return <Textarea id={props.name} hasIcon={hasIcon} {...rest} />;
  }

  if (props.as === "select") {
    const { label, icon, as, children, ...rest } = props;
    return (
      <Select id={props.name} hasIcon={hasIcon} {...rest}>
        {children}
      </Select>
    );
  }

  const { label, icon, as, ...rest } = props;
  return <Input id={props.name} hasIcon={hasIcon} {...rest} />;
}
