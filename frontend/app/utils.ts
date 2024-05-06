export function calculAge(date: string): number {
    
    const diff = Date.now() - new Date(date).getTime();
    const age = new Date(diff);
    return Math.abs(age.getUTCFullYear() - 1970);
}