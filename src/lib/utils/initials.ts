/** Computed on demand everywhere an avatar needs a text fallback, so it's
 * never stale after a name edit (unlike a persisted field would be). */
export function getInitials(firstName: string, lastName: string): string {
  const first = firstName.trim().charAt(0);
  const last = lastName.trim().charAt(0);
  const initials = `${first}${last}`.toUpperCase();
  return initials || "?";
}
