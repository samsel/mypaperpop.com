/**
 * Check if a database error is a unique constraint violation (PostgreSQL code 23505).
 */
export function isUniqueViolation(err: unknown): boolean {
    return err instanceof Error && 'code' in err && (err as { code: string }).code === '23505';
}
