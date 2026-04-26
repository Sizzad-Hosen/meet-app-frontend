type ErrorPayload = {
  data?: {
    message?: string;
    errorSources?: Array<{ message?: string }>;
  };
  error?: string;
};

export function getApiErrorMessage(error: unknown) {
  const payload = error as ErrorPayload;

  return (
    payload.data?.message ??
    payload.data?.errorSources?.[0]?.message ??
    payload.error ??
    "Something went wrong. Please try again."
  );
}
