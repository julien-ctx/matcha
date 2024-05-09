export function calculAge(date: string): number {
    
    const diff = Date.now() - new Date(date).getTime();
    const age = new Date(diff);
    return Math.abs(age.getUTCFullYear() - 1970);
}

export function capitalize(str: string): string {
    if (!str?.length) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export const validatePassword = (password: string) => {
    if (password.length < 8) {
      return { result: false, message: "Password must be at least 8 characters long." }
    }
  
    if (!/[A-Z]/.test(password)) {
      return { result: false, message: "Password must contain at least one uppercase letter." }
    }
  
    if (!/[a-z]/.test(password)) {
      return { result: false, message: "Password must contain at least one lowercase letter." }
    }
  
    if (!/[!@#$%^&*(),.?":{}|<>/]/.test(password)) {
      return { result: false, message: "Password must contain at least one special character." }
    }
  
    return { result: true, message: "Password is valid." }
  }
  
