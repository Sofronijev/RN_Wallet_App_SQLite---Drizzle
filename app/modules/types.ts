export enum FetchStatus {
  success = "success",
  loading = "loading",
  loadingMore = "loadingMore",
  error = "error",
}

export type SimpleResponse = {
  message: string;
};

export type ResponseError = {
  data: { message: string };
  status: number;
};
