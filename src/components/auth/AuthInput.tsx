import {
  forwardRef,
  useId,
  useState,
  type InputHTMLAttributes,
} from "react";
import { Eye, EyeOff } from "lucide-react";

import { cx } from "@/lib/utils/cx";

export interface AuthInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label: string;
}

const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(function AuthInput(
  { className, id, label, type = "text", ...props },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const isPasswordField = type === "password";
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <label htmlFor={inputId} className="block">
      <span className="mb-2 block text-sm font-medium text-white/88">{label}</span>

      <div className="relative">
        <input
          {...props}
          ref={ref}
          id={inputId}
          type={
            isPasswordField && isPasswordVisible ? "text" : type
          }
          className={cx(
            "af-surface-sm af-surface-hover af-focus-ring h-11 w-full bg-white/[0.03] px-3.5 text-sm text-white placeholder:text-white/34 sm:h-12 sm:px-4",
            isPasswordField && "pr-12",
            className,
          )}
        />

        {isPasswordField ? (
          <button
            type="button"
            aria-label={isPasswordVisible ? "Hide password" : "Show password"}
            className="absolute inset-y-1 right-1 inline-flex w-10 items-center justify-center rounded-[var(--radius-sm)] text-white/46 transition hover:text-[var(--accent-soft-35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring-color)]"
            onClick={() => setIsPasswordVisible((current) => !current)}
          >
            {isPasswordVisible ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        ) : null}
      </div>
    </label>
  );
});

export default AuthInput;
