export function calculAge(date: string): number {
    
    const diff = Date.now() - new Date(date).getTime();
    const age = new Date(diff);
    return Math.abs(age.getUTCFullYear() - 1970);
}

export function capitalize(str: string): string {
    if (!str?.length) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
}
