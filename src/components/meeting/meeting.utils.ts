type ApiErrorShape = {
  status?: number;
  data?: {
    message?: string;
    errorSources?: Array<{ path?: string; message?: string }>;
  };
  error?: string;
};

export function getApiErrorMessage(error: unknown): string {
  const apiError = error as ApiErrorShape;
  const fieldError = apiError.data?.errorSources?.find((item) => item.message)?.message;

  return fieldError
    ?? apiError.data?.message
    ?? apiError.error
    ?? (error instanceof Error ? error.message : undefined)
    ?? "Something went wrong. Please try again.";
}

export function getApiErrorStatus(error: unknown): number | undefined {
  return (error as ApiErrorShape).status;
}

export function getInitials(name?: string): string {
  return (name || "Guest")
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
