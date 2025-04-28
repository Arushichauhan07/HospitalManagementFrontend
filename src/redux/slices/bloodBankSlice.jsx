import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const apiUrl = import.meta.env.VITE_API_URL;

export const bloodBankApi = createApi({
  reducerPath: "bloodBankApi",
  baseQuery: fetchBaseQuery({ baseUrl: `${apiUrl}/blood-bank`, credentials: "include" }),
  endpoints: (builder) => ({
    // Fetch all blood banks
    fetchBloodBanks: builder.query({
      query: () => "/get-all",
      providesTags: ["AddBlood"],
    }),

    // Fetch all blood donations
    fetchBloodDonations: builder.query({
      query: () => "/get-all-donation",
    }),

    // Fetch all blood requests
    fetchBloodRequests: builder.query({
      query: () => "/get-all-req",
      providesTags: ["AddBloodReq"]
    }),

    // Create a new blood bank entry
    createBloodBank: builder.mutation({
      query: (newBloodBank) => ({
        url: "/create",
        method: "POST",
        body: newBloodBank,
      }),
      invalidatesTags: ["AddBlood"], 
    }),

    // Create a new blood request
    createBloodRequest: builder.mutation({
      query: (newBloodRequest) => ({
        url: "/create-req", 
        method: "POST",
        body: newBloodRequest,
      }),
      invalidatesTags: ["AddBloodReq"], 
    }),
  }),
});

// Auto-generated hooks for components
export const {
  useFetchBloodBanksQuery,
  useFetchBloodDonationsQuery,
  useFetchBloodRequestsQuery,
  useCreateBloodBankMutation,
  useCreateBloodRequestMutation, // New hook for creating a blood request
} = bloodBankApi;
