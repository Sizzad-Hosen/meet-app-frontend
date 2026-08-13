import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { User } from "@/types/auth";
import type { RootState } from "../store";
import { clearCredentials, setCredentials } from "../features/auth/authSlice";

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  meta?: { page?: number; limit?: number; total?: number };
};

type RefreshResponse = ApiResponse<{ accessToken: string; user: User }>;

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) headers.set("authorization", `Bearer ${token}`);
    return headers;
  },
});

const baseQueryWithRefreshToken: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  const requestUrl = typeof args === "string" ? args : args.url;

  if (result.error?.status === 401 && requestUrl !== "/auth/refresh-token") {
    const refreshResult = await baseQuery(
      { url: "/auth/refresh-token", method: "POST" },
      api,
      extraOptions,
    );
    const refreshData = refreshResult.data as RefreshResponse | undefined;

    if (refreshData?.data.accessToken && refreshData.data.user) {
      api.dispatch(setCredentials(refreshData.data));
      result = await baseQuery(args, api, extraOptions);
    } else {
      api.dispatch(clearCredentials());
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: baseQueryWithRefreshToken,
  tagTypes: ["Auth", "Meeting", "Participant", "LiveKit", "Recording", "ScreenShare"],
  endpoints: () => ({}),
});
