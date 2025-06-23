export function LoadingSpinner({ className }: { className?: string }) {
    return (
      <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${className || 'h-8 w-8'}`} />
    );
}