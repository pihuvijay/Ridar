export type ApiResponse<T> = {
  ok: boolean;
  data?: T;
  error?: { message: string };
};

export function ok<T>(data: T): ApiResponse<T> {
  return { ok: true, data };
}

export function fail(message: string): ApiResponse<never> {
  return { ok: false, error: { message } };
}