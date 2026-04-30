export type ApiError = {
  error: string;
  details?: Record<string, string[]>;
};

export type ApiSuccessMessage = {
  message: string;
};
