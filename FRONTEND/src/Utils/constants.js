export const APP_NAME = 'ResearchMind AI';

export const CITATION_FORMATS = ['APA', 'BibTeX', 'IEEE', 'MLA'];

export const ROLES = {
  STUDENT: 'student',
  ADMIN: 'admin',
};

export const API_ROUTES = {
  AUTH: {
    REGISTER: '/auth/register',
    VERIFY_OTP: '/auth/verify-otp',
    RESEND_OTP: '/auth/resend-otp',
    LOGIN: '/auth/login',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    ME: '/auth/me',
    LOGOUT: '/auth/logout',
  },
};
