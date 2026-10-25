import { NextRequest } from 'next/server';

// The registration link's password. Checked only on the server, so it never
// ships in the page code; change it per season with REGISTRATION_PASSCODE.
export const REGISTRATION_PASSCODE = process.env.REGISTRATION_PASSCODE || 'SCL2027';

export function passcodeMatches(value: unknown): boolean {
  return typeof value === 'string' && value.trim().toUpperCase() === REGISTRATION_PASSCODE.toUpperCase();
}

/**
 * Admin requests carry the edit password typed in the header pill. It is the
 * same NEXT_PUBLIC_ password the client checks, so this keeps registrations
 * out of casual view rather than being real access control.
 */
export function isAdmin(request: NextRequest): boolean {
  const key = request.headers.get('x-admin-key');
  const expected = process.env.NEXT_PUBLIC_LOCAL_PASSWORD;
  return !!expected && key === expected;
}
