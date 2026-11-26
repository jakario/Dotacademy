import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * Returns the current session if the request includes a valid session.
 * If there is no session (e.g., guest access) it returns null instead of throwing.
 */
export async function getOptionalSession() {
  try {
    const session = await getServerSession(authOptions);
    return session;
  } catch {
    return null;
  }
}
