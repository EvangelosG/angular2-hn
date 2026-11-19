/** Joins truthy class names: cx('loader', styles.loader, active && 'active'). */
export function cx(...classes: Array<string | false | null | undefined>): string {
    return classes.filter(Boolean).join(' ');
}
