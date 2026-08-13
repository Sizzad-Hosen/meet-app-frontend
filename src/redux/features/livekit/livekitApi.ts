import { normalizeMeetingCode } from "@/lib/meeting-code";
import { baseApi, type ApiResponse } from "@/redux/api/baseApi";
import type { JoinMeetingRequest } from "@/types/meeting";
import type { LiveKitTokenResponse } from "@/types/media";

export const livekitApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLiveKitToken: builder.mutation<
      ApiResponse<LiveKitTokenResponse>,
      JoinMeetingRequest
    >({
      query: ({ joinCode }) => ({
        url: "/livekit/token",
        method: "POST",
        body: { joinCode: normalizeMeetingCode(joinCode) },
      }),
      invalidatesTags: ["LiveKit"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetLiveKitTokenMutation } = livekitApi;
