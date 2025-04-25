export interface IResponse<T> {
  correlationId: string;
  status: string;
  data: T;
}
