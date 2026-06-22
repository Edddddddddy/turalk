export interface AppConfig {
  apiUrl: string;
  appName: string;
}

export const appConfig: AppConfig = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api',
  appName: 'Turalk',
};
