interface LoadingScreenProps {
  isVisible: boolean;
}

export default function LoadingScreen({ isVisible }: LoadingScreenProps) {
  return (
    <div
      aria-hidden={!isVisible}
      aria-busy={isVisible}
      className={`fixed inset-0 z-[1200] flex items-center justify-center transition-opacity duration-200 ${
        isVisible ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(109,40,217,0.18),transparent_42%),var(--site-bg,#16171d)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,18,26,0.72),rgba(20,18,26,0.94))] backdrop-blur-sm" />

      <div
        role="status"
        aria-live="polite"
        className="relative flex items-center justify-center px-6"
      >
        <div className="relative flex h-[13.5rem] w-[13.5rem] items-center justify-center">
          <div className="absolute h-[11.5rem] w-[11.5rem] rounded-full bg-[var(--accent-soft-15)] animate-[afPulse_1800ms_ease-in-out_infinite]" />
          <div className="absolute h-[13rem] w-[13rem] rounded-full border border-white/6" />
          <div className="absolute h-[13rem] w-[13rem] rounded-full border-2 border-transparent border-t-[var(--accent-primary)] border-r-[var(--accent-soft-35)] animate-spin [animation-duration:1200ms]" />

          <div className="relative flex h-[8.5rem] w-[8.5rem] items-center justify-center animate-[afLoadingLogoPulse_1800ms_ease-in-out_infinite]">
            <img
              src="/archflow-logo.png"
              alt="ArchFlow"
              className="h-full w-full object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
