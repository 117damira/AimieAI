/** Kazakhstan mobile numbers only — normalized to 11 digits ("7XXXXXXXXXX"),
 * accepting a leading 8 (the common local dialing prefix) as an alias for
 * the +7 country code. */
const KZ_DIGIT_COUNT = 11;

export function normalizeKzPhoneDigits(input: string): string {
  let digits = input.replace(/\D/g, "");
  if (digits.startsWith("8")) digits = "7" + digits.slice(1);
  if (!digits.startsWith("7") && digits.length > 0) digits = "7" + digits;
  return digits.slice(0, KZ_DIGIT_COUNT);
}

export function formatKzPhone(digits: string): string {
  if (!digits) return "";
  const rest = digits.slice(1);
  const parts = [rest.slice(0, 3), rest.slice(3, 6), rest.slice(6, 8), rest.slice(8, 10)].filter(
    Boolean
  );
  return parts.length ? `+7 ${parts.join(" ")}` : "+7";
}

export function isValidKzPhoneDigits(digits: string): boolean {
  return digits.length === KZ_DIGIT_COUNT;
}

/** Canonical storage/lookup form, e.g. "+77071234567". Accepts either raw
 * digits or an already-formatted string. */
export function toStoredPhone(digits: string): string {
  return `+${normalizeKzPhoneDigits(digits)}`;
}
