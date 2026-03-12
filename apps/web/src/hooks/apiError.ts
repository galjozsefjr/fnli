export type ResponseError = {
  message: string;
  type?: string;
};

export class ApiError extends Error {
  constructor(
    public error: ResponseError,
    public statusCode: number
  ) {
    super(error.message);
  }
}
