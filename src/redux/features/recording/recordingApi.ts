import { baseApi } from "@/redux/api/baseApi";
import type { ApiResponse, Recording } from "@/types/api";

export const recordingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    startRecording: builder.mutation<ApiResponse<Recording>, string>({
      query: (code) => ({
        url: `/recordings/${code}/start`,
        method: "POST",
      }),
      invalidatesTags: ["Recording"],
    }),
    stopRecording: builder.mutation<ApiResponse<Recording>, string>({
      query: (code) => ({
        url: `/recordings/${code}/stop`,
        method: "POST",
      }),
      invalidatesTags: ["Recording"],
    }),
    getRecordings: builder.query<ApiResponse<Recording[]>, string>({
      query: (meetingId) => `/recordings/${meetingId}`,
      providesTags: ["Recording"],
    }),
    getRecordingDownload: builder.query<
      ApiResponse<{ url: string }>,
      string
    >({
      query: (recordingId) => `/recordings/${recordingId}/download`,
      providesTags: ["Recording"],
    }),
    deleteRecording: builder.mutation<ApiResponse<null>, string>({
      query: (recordingId) => ({
        url: `/recordings/${recordingId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Recording"],
    }),
  }),
});

export const {
  useDeleteRecordingMutation,
  useGetRecordingDownloadQuery,
  useGetRecordingsQuery,
  useStartRecordingMutation,
  useStopRecordingMutation,
} = recordingApi;
