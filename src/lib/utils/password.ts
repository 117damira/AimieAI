/** 6–16 characters, at least one letter and one number — shared by
 * registration and the forgot-password reset step so both show the exact
 * same real-time validation. */
export const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).{6,16}$/;

export function isValidPassword(password: string): boolean {
  return PASSWORD_PATTERN.test(password);
}
