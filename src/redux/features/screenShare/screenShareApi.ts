import { baseApi, type ApiResponse } from "@/redux/api/baseApi";
import type { Participant } from "@/types/meeting";
import type {
  ScreenShareStatus,
  StartScreenShareResponse,
} from "@/types/media";

type ScreenShareDecisionArgument = {
  code: string;
  userId: string;
  decision: "approve" | "deny";
};

export const screenShareApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getScreenShareStatus: builder.query<
      ApiResponse<ScreenShareStatus>,
      string
    >({
      query: (code) => `/screen-share/${code}/screenshare/status`,
      providesTags: (_result, _error, code) => [
        { type: "ScreenShare", id: code },
      ],
    }),
    startScreenShare: builder.mutation<
      ApiResponse<StartScreenShareResponse>,
      string
    >({
      query: (code) => ({
        url: `/screen-share/${code}/screenshare/start`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, code) => [
        { type: "ScreenShare", id: code },
      ],
    }),
    stopScreenShare: builder.mutation<ApiResponse<Participant>, string>({
      query: (code) => ({
        url: `/screen-share/${code}/screenshare/stop`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, code) => [
        { type: "ScreenShare", id: code },
      ],
    }),
    screenShareDecision: builder.mutation<
      ApiResponse<Participant>,
      ScreenShareDecisionArgument
    >({
      query: ({ code, userId, decision }) => ({
        url: `/screen-share/${code}/screenshare/${decision}/${userId}`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, { code }) => [
        { type: "ScreenShare", id: code },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetScreenShareStatusQuery,
  useScreenShareDecisionMutation,
  useStartScreenShareMutation,
  useStopScreenShareMutation,
} = screenShareApi;
