import React from "react";
import { Input } from "reactstrap";
import { getCurrentDateYYYYMMDD } from "../../helpers/dateUtils";

/**
 * Date input that auto-selects current year when empty and user focuses to pick date.
 * When day and month are selected (via picker), year defaults to current year.
 * On focus of empty field, sets value to today so picker opens with current year.
 */
interface DateInputProps extends Omit<React.ComponentProps<typeof Input>, "type"> {
  type?: "date";
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

const DateInput: React.FC<DateInputProps> = ({
  value = "",
  onChange,
  onFocus,
  disabled,
  ...rest
}) => {
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (!disabled && !value && onChange) {
      const today = getCurrentDateYYYYMMDD();
      onChange({
        ...e,
        target: { ...e.target, value: today },
      } as React.ChangeEvent<HTMLInputElement>);
    }
    onFocus?.(e);
  };

  return (
    <Input
      type="date"
      value={value}
      onChange={onChange}
      onFocus={handleFocus}
      disabled={disabled}
      {...rest}
    />
  );
};

export default DateInput;
