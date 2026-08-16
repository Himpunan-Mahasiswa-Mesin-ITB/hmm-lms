import bcrypt from "bcryptjs";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { TIMEZONE } from "~/constants/constants";
import { env } from '~/env';

const SALT_ROUNDS = 10; // The cost factor. Higher is more secure but slower. 10-12 is generally good.

export { cn } from "cnfast";

export async function hashPassword(password: string): Promise<string> {
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  return hashedPassword;
}

export async function verifyPassword(
  password: string,
  hashedPasswordFromDb: string,
): Promise<boolean> {
  const isValid = await bcrypt.compare(password, hashedPasswordFromDb);
  return isValid;
}

// NEW: Add this function to format bytes into a readable string
export function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export const getCdnUrl = (key: string) => {
  const cdnEndpoint = env.NEXT_PUBLIC_DO_SPACES_CDN_ENDPOINT;
  if (!cdnEndpoint) {
    console.error("CDN endpoint is not configured. Falling back to API route.");
    return ""; // Or a fallback URL
  }
  return `${cdnEndpoint}/${key}`;
};


// helper: format Date to 'YYYY-MM-DDTHH:mm' for datetime-local
export function toDateTimeLocalValue(d?: Date | null) {
  if (!d) return '';
  // Convert UTC date to target timezone
  const zonedDate = toZonedTime(d, TIMEZONE);

  const year = zonedDate.getFullYear();
  const month = String(zonedDate.getMonth() + 1).padStart(2, '0');
  const day = String(zonedDate.getDate()).padStart(2, '0');
  const hours = String(zonedDate.getHours()).padStart(2, '0');
  const minutes = String(zonedDate.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// helper: parse input value from datetime-local back to Date
export function fromDateTimeLocalValue(v: string): Date {
  if (!v) return new Date();
  // v is "YYYY-MM-DDTHH:mm"
  // Interpret this string as being in the target timezone, then convert to UTC
  return fromZonedTime(v, TIMEZONE);
}
