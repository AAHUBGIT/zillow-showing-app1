"use client";

import { TextareaHTMLAttributes, useEffect, useRef } from "react";

export function AutoResizeTextarea({
  onInput,
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function resize() {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }

  useEffect(() => {
    resize();
  }, [props.defaultValue, props.value]);

  return (
    <textarea
      {...props}
      ref={textareaRef}
      onInput={(event) => {
        resize();
        onInput?.(event);
      }}
      className={className}
      style={{ overflow: "hidden", ...props.style }}
    />
  );
}
