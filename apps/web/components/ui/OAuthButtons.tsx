const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M47.5 24.5C47.5 22.6 47.3 20.8 47 19H24V29.5H37.3C36.7 32.5 35 35 32.4 36.7V43H40.2C44.7 38.9 47.5 32.2 47.5 24.5Z" fill="#4285F4"/>
      <path d="M24 48C30.6 48 36.2 45.8 40.2 43L32.4 36.7C30.3 38.1 27.4 39 24 39C17.6 39 12.2 34.8 10.3 29.1H2.3V35.6C6.3 43.5 14.5 48 24 48Z" fill="#34A853"/>
      <path d="M10.3 29C9.8 27.6 9.5 26.1 9.5 24.5C9.5 22.9 9.8 21.4 10.3 20V13.5H2.3C0.8 16.5 0 19.9 0 23.5C0 27.1 0.8 30.5 2.3 33.5L10.3 29Z" fill="#FBBC05"/>
      <path d="M24 10C27.7 10 31 11.3 33.6 13.8L40.4 7C36.2 3.1 30.6 0.5 24 0.5C14.5 0.5 6.3 5 2.3 13L10.3 19.5C12.2 13.7 17.6 10 24 10Z" fill="#EA4335"/>
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.38.6.1.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.54-1.38-1.33-1.74-1.33-1.74-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.48 1 .1-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.14-.3-.54-1.52.1-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 3-.4c1.02.005 2.04.14 3 .4 2.28-1.55 3.29-1.23 3.29-1.23.65 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.49 5.92.43.37.82 1.1.82 2.22v3.29c0 .32.22.7.83.58C20.57 21.8 24 17.3 24 12 24 5.37 18.63 0 12 0Z"/>
    </svg>
  );
}

export function OAuthButtons() {
  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-3 bg-white text-gray-400">o continua con</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <a
          href={`${API_URL}/auth/google`}
          className="flex items-center justify-center gap-2.5 border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all duration-150"
        >
          <GoogleIcon />
          Google
        </a>

        <a
          href={`${API_URL}/auth/github`}
          className="flex items-center justify-center gap-2.5 border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all duration-150"
        >
          <GitHubIcon />
          GitHub
        </a>
      </div>
    </div>
  );
}
