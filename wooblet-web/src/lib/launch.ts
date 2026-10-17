export const LAUNCH_DATE = '2026-11-30T00:00:00+08:00';
export const LAUNCH_AT = new Date(LAUNCH_DATE).getTime();

// Keep existing pet tags and account administration usable before the shop opens.
export function showLaunchPreview(path: string[], now = Date.now()) {
  const operational = ['admin', 'login', 'dashboard', 'forgot-password', 'reset-password', 'verify-email', 't'];
  return now < LAUNCH_AT && !operational.includes(path[0]);
}
