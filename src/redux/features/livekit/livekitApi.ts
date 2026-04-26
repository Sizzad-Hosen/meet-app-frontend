import { baseApi } from "@/redux/api/baseApi";
import type { ApiResponse, JoinMeetingRequest } from "@/types/api";

export const liveKitApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLiveKitToken: builder.mutation<
      ApiResponse<{ token: string }>,
      JoinMeetingRequest
    >({
      query: (body) => ({
        url: "/livekit/token",
        method: "POST",
        body,
      }),
      invalidatesTags: ["LiveKit"],
    }),
  }),
});

export const { useGetLiveKitTokenMutation } = liveKitApi;
