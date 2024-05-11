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
  

export function getTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) {
      return 'just now';
  } else if (diffInSeconds < 3600) {
      const mins = Math.floor(diffInSeconds / 60);
      return `${mins} minute${mins > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
  }
}