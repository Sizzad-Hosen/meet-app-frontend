import { baseApi, type ApiResponse } from "@/redux/api/baseApi";
import type { Recording } from "@/types/media";

type RecordingMutationArgument = {
  code: string;
  meetingId: string;
};

export const recordingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRecordings: builder.query<ApiResponse<Recording[]>, string>({
      query: (meetingId) => `/recordings/${meetingId}`,
      providesTags: (_result, _error, meetingId) => [
        { type: "Recording", id: meetingId },
      ],
    }),
    startRecording: builder.mutation<
      ApiResponse<Recording>,
      RecordingMutationArgument
    >({
      query: ({ code }) => ({
        url: `/recordings/${code}/start`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, { meetingId }) => [
        { type: "Recording", id: meetingId },
      ],
    }),
    stopRecording: builder.mutation<
      ApiResponse<Recording>,
      RecordingMutationArgument
    >({
      query: ({ code }) => ({
        url: `/recordings/${code}/stop`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, { meetingId }) => [
        { type: "Recording", id: meetingId },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetRecordingsQuery,
  useStartRecordingMutation,
  useStopRecordingMutation,
} = recordingsApi;
