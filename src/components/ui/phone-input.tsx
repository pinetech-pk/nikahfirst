"use client";

import * as React from "react";
import { CheckIcon, ChevronsUpDown, AlertCircle } from "lucide-react";
import * as RPNInput from "react-phone-number-input";
import flags from "react-phone-number-input/flags";
import { isValidPhoneNumber, parsePhoneNumber } from "libphonenumber-js";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

// Default preferred countries for NikahFirst (can be overridden via props)
const DEFAULT_PREFERRED_COUNTRIES: RPNInput.Country[] = [
  "PK", // Pakistan
  "SA", // Saudi Arabia
  "AE", // UAE
  "GB", // United Kingdom
  "US", // United States
  "CA", // Canada
  "AU", // Australia
  "IN", // India
  "BD", // Bangladesh
  "MY", // Malaysia
];

type PhoneInputProps = Omit<
  React.ComponentProps<"input">,
  "onChange" | "value" | "ref"
> &
  Omit<RPNInput.Props<typeof RPNInput.default>, "onChange"> & {
    onChange?: (value: RPNInput.Value) => void;
    /** Countries to show at the top of the dropdown */
    preferredCountries?: RPNInput.Country[];
    /** Show validation error message */
    showValidation?: boolean;
    /** Custom error message */
    errorMessage?: string;
    /** Callback when validation state changes */
    onValidationChange?: (isValid: boolean) => void;
  };

const PhoneInput: React.ForwardRefExoticComponent<PhoneInputProps> =
  React.forwardRef<React.ElementRef<typeof RPNInput.default>, PhoneInputProps>(
    (
      {
        className,
        onChange,
        preferredCountries = DEFAULT_PREFERRED_COUNTRIES,
        showValidation = true,
        errorMessage,
        onValidationChange,
        value,
        ...props
      },
      ref
    ) => {
      const [isValid, setIsValid] = React.useState<boolean | null>(null);
      const [isTouched, setIsTouched] = React.useState(false);

      // Validate phone number
      const validatePhone = React.useCallback(
        (phoneValue: string | undefined) => {
          if (!phoneValue || phoneValue === "") {
            setIsValid(null);
            onValidationChange?.(true); // Empty is valid (optional field)
            return;
          }

          const valid = isValidPhoneNumber(phoneValue);
          setIsValid(valid);
          onValidationChange?.(valid);
        },
        [onValidationChange]
      );

      // Handle blur - validate on blur
      const handleBlur = React.useCallback(() => {
        setIsTouched(true);
        validatePhone(value as string);
      }, [value, validatePhone]);

      // Get validation message
      const getValidationMessage = () => {
        if (!showValidation || !isTouched || isValid === null || isValid) {
          return null;
        }

        if (errorMessage) return errorMessage;

        // Try to get specific error
        if (value) {
          try {
            const parsed = parsePhoneNumber(value as string);
            if (parsed) {
              const country = parsed.country;
              return `Invalid phone number for ${country || "selected country"}. Please check the number length and format.`;
            }
          } catch {
            // Fall through to default message
          }
        }

        return "Please enter a valid phone number";
      };

      const validationMessage = getValidationMessage();
      const hasError = isTouched && isValid === false;

      return (
        <div className="space-y-1">
          <RPNInput.default
            ref={ref}
            className={cn("flex", className)}
            flagComponent={FlagComponent}
            countrySelectComponent={(countrySelectProps) => (
              <CountrySelect
                {...countrySelectProps}
                preferredCountries={preferredCountries}
              />
            )}
            inputComponent={(inputProps) => (
              <InputComponent
                {...inputProps}
                hasError={hasError}
                onBlur={(e) => {
                  inputProps.onBlur?.(e);
                  handleBlur();
                }}
              />
            )}
            smartCaret={false}
            value={value}
            onChange={(newValue) => {
              onChange?.(newValue || ("" as RPNInput.Value));
              // Re-validate if already touched
              if (isTouched) {
                validatePhone(newValue as string);
              }
            }}
            {...props}
          />
          {validationMessage && (
            <div className="flex items-center gap-1.5 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{validationMessage}</span>
            </div>
          )}
        </div>
      );
    }
  );
PhoneInput.displayName = "PhoneInput";

interface InputComponentProps extends React.ComponentProps<"input"> {
  hasError?: boolean;
}

const InputComponent = React.forwardRef<HTMLInputElement, InputComponentProps>(
  ({ className, hasError, ...props }, ref) => (
    <Input
      className={cn(
        "rounded-e-lg rounded-s-none",
        hasError && "border-red-500 focus-visible:ring-red-500",
        className
      )}
      {...props}
      ref={ref}
    />
  )
);
InputComponent.displayName = "InputComponent";

type CountryEntry = { label: string; value: RPNInput.Country | undefined };

type CountrySelectProps = {
  disabled?: boolean;
  value: RPNInput.Country;
  onChange: (value: RPNInput.Country) => void;
  options: CountryEntry[];
  preferredCountries?: RPNInput.Country[];
};

const CountrySelect = ({
  disabled,
  value: selectedCountry,
  onChange,
  options,
  preferredCountries = DEFAULT_PREFERRED_COUNTRIES,
}: CountrySelectProps) => {
  const [open, setOpen] = React.useState(false);

  // Filter and sort options
  const validOptions = options.filter(
    (x): x is CountryEntry & { value: RPNInput.Country } => x.value !== undefined
  );

  // Split into preferred and other countries
  const preferredOptions = preferredCountries
    .map((code) => validOptions.find((opt) => opt.value === code))
    .filter((opt): opt is CountryEntry & { value: RPNInput.Country } => !!opt);

  const otherOptions = validOptions.filter(
    (opt) => !preferredCountries.includes(opt.value)
  );

  const renderCountryItem = (option: CountryEntry & { value: RPNInput.Country }) => (
    <CommandItem
      className="gap-2"
      key={option.value}
      onSelect={() => {
        onChange(option.value);
        setOpen(false);
      }}
    >
      <FlagComponent country={option.value} countryName={option.label} />
      <span className="flex-1 text-sm">{option.label}</span>
      <span className="text-sm text-muted-foreground">
        {`+${RPNInput.getCountryCallingCode(option.value)}`}
      </span>
      <CheckIcon
        className={cn(
          "ml-auto size-4",
          option.value === selectedCountry ? "opacity-100" : "opacity-0"
        )}
      />
    </CommandItem>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="flex gap-1 rounded-e-none rounded-s-lg border-r-0 px-3 focus:z-10"
          disabled={disabled}
        >
          <FlagComponent
            country={selectedCountry}
            countryName={selectedCountry}
          />
          <ChevronsUpDown
            className={cn(
              "-mr-2 size-4 opacity-50",
              disabled ? "hidden" : "opacity-100"
            )}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search country..." />
          <CommandList>
            <CommandEmpty>No country found.</CommandEmpty>
            <ScrollArea className="h-72">
              {/* Preferred Countries */}
              {preferredOptions.length > 0 && (
                <CommandGroup heading="Popular">
                  {preferredOptions.map(renderCountryItem)}
                </CommandGroup>
              )}

              {/* Separator */}
              {preferredOptions.length > 0 && otherOptions.length > 0 && (
                <CommandSeparator />
              )}

              {/* All Other Countries */}
              <CommandGroup heading="All Countries">
                {otherOptions.map(renderCountryItem)}
              </CommandGroup>
            </ScrollArea>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

const FlagComponent = ({ country, countryName }: RPNInput.FlagProps) => {
  const Flag = flags[country];

  return (
    <span className="flex h-4 w-6 overflow-hidden rounded-sm bg-foreground/20 [&_svg]:size-full">
      {Flag && <Flag title={countryName} />}
    </span>
  );
};

// Utility function to get country from E.164 number
export const getCountryFromPhone = (e164Number: string): string | undefined => {
  try {
    const parsed = parsePhoneNumber(e164Number);
    return parsed?.country;
  } catch {
    return undefined;
  }
};

// Utility function to format phone number for display
export const formatPhoneForDisplay = (
  e164Number: string,
  format: "INTERNATIONAL" | "NATIONAL" | "E.164" = "INTERNATIONAL"
): string => {
  try {
    const parsed = parsePhoneNumber(e164Number);
    if (!parsed) return e164Number;

    switch (format) {
      case "INTERNATIONAL":
        return parsed.formatInternational();
      case "NATIONAL":
        return parsed.formatNational();
      case "E.164":
      default:
        return parsed.format("E.164");
    }
  } catch {
    return e164Number;
  }
};

export { PhoneInput };
