import { baseApi } from "@/redux/api/baseApi";
import type { ApiResponse, ScreenShareStatus } from "@/types/api";

export const screenShareApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getScreenShareStatus: builder.query<ApiResponse<ScreenShareStatus>, string>({
      query: (code) => `/screen-share/${code}/screenshare/status`,
      providesTags: ["ScreenShare"],
    }),
    startScreenShare: builder.mutation<ApiResponse<ScreenShareStatus>, string>({
      query: (code) => ({
        url: `/screen-share/${code}/screenshare/start`,
        method: "POST",
      }),
      invalidatesTags: ["ScreenShare"],
    }),
    stopScreenShare: builder.mutation<ApiResponse<ScreenShareStatus>, string>({
      query: (code) => ({
        url: `/screen-share/${code}/screenshare/stop`,
        method: "POST",
      }),
      invalidatesTags: ["ScreenShare"],
    }),
    approveScreenShare: builder.mutation<
      ApiResponse<ScreenShareStatus>,
      { code: string; userId: string }
    >({
      query: ({ code, userId }) => ({
        url: `/screen-share/${code}/screenshare/approve/${userId}`,
        method: "POST",
      }),
      invalidatesTags: ["ScreenShare"],
    }),
    denyScreenShare: builder.mutation<
      ApiResponse<ScreenShareStatus>,
      { code: string; userId: string }
    >({
      query: ({ code, userId }) => ({
        url: `/screen-share/${code}/screenshare/deny/${userId}`,
        method: "POST",
      }),
      invalidatesTags: ["ScreenShare"],
    }),
  }),
});

export const {
  useApproveScreenShareMutation,
  useDenyScreenShareMutation,
  useGetScreenShareStatusQuery,
  useStartScreenShareMutation,
  useStopScreenShareMutation,
} = screenShareApi;
