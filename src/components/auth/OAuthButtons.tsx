type OAuthProvider = "github" | "gitlab" | "bitbucket" | "google";

interface OAuthButtonsProps {
  onProviderClick?: (provider: OAuthProvider) => void;
}

interface ProviderDefinition {
  id: OAuthProvider;
  label: string;
  icon: React.ReactNode;
}

const iconClassName = "h-4 w-4 shrink-0 text-white/82";

const providers: ProviderDefinition[] = [
  {
    id: "github",
    label: "GitHub",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className={iconClassName} aria-hidden="true">
        <path d="M12 2C6.48 2 2 6.58 2 12.23c0 4.52 2.87 8.35 6.84 9.71.5.09.68-.22.68-.5 0-.24-.01-1.03-.01-1.87-2.78.62-3.37-1.21-3.37-1.21-.46-1.19-1.11-1.51-1.11-1.51-.91-.64.07-.63.07-.63 1 .08 1.53 1.05 1.53 1.05.89 1.56 2.33 1.11 2.9.85.09-.66.35-1.11.63-1.36-2.22-.26-4.55-1.14-4.55-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.31.1-2.73 0 0 .84-.28 2.75 1.05A9.36 9.36 0 0 1 12 6.84c.85 0 1.71.12 2.51.35 1.91-1.33 2.75-1.05 2.75-1.05.55 1.42.2 2.47.1 2.73.64.72 1.03 1.63 1.03 2.75 0 3.94-2.33 4.8-4.56 5.06.36.31.67.92.67 1.85 0 1.34-.01 2.42-.01 2.75 0 .27.18.59.69.49A10.27 10.27 0 0 0 22 12.23C22 6.58 17.52 2 12 2Z" />
      </svg>
    ),
  },
  {
    id: "google",
    label: "Google",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className={iconClassName} aria-hidden="true">
        <path d="M21.8 12.23c0-.76-.06-1.31-.19-1.88H12v3.54h5.64c-.11.88-.73 2.21-2.1 3.1l-.02.12 3.01 2.38.21.02c1.92-1.81 3.06-4.47 3.06-7.28ZM12 22c2.76 0 5.08-.93 6.77-2.52l-3.22-2.52c-.86.61-2.02 1.03-3.55 1.03-2.7 0-4.99-1.81-5.81-4.32l-.11.01-3.13 2.47-.04.11A10.23 10.23 0 0 0 12 22Zm-5.81-8.33A6.21 6.21 0 0 1 5.86 12c0-.58.1-1.14.31-1.67l-.01-.11-3.17-2.51-.1.05A10.49 10.49 0 0 0 2 12c0 1.53.36 2.98 1 4.24l3.19-2.57ZM12 6.01c1.93 0 3.24.85 3.98 1.56l2.91-2.89C17.07 2.96 14.76 2 12 2a10.23 10.23 0 0 0-9.09 5.52l3.28 2.57C7.01 7.82 9.3 6.01 12 6.01Z" />
      </svg>
    ),
  },
];

export default function OAuthButtons({ onProviderClick }: OAuthButtonsProps) {
  return (
    <div className="flex gap-4">
      {providers.map((provider) => (
        <button
          key={provider.id}
          type="button"
          onClick={() => onProviderClick?.(provider.id)}
          className="af-surface-sm af-surface-hover af-focus-ring inline-flex h-10 w-full items-center justify-center gap-2 bg-white/[0.03] px-2.5 text-[13px] font-medium text-white/82 transition hover:bg-white/[0.06] hover:text-white sm:h-11 sm:px-3 sm:text-sm"
        >
          {provider.icon}
          <span>{provider.label}</span>
        </button>
      ))}
    </div>
  );
}

export type { OAuthProvider };
