export function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAIL || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
}

export function isAdminEmail(email?: string | null): boolean {
  const normalizedEmail = email?.trim().toLowerCase()
  return Boolean(normalizedEmail && getAdminEmails().includes(normalizedEmail))
}
