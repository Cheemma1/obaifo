import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/shared/lib/api-client";

export function useDonationStats() {
  return useQuery({
    queryKey: ["donations", "stats"],
    queryFn: () => api<{ supporters: number }>("/donations/stats"),
    staleTime: 5 * 60_000,
  });
}

/** Starts checkout and sends the browser to the payment page (or the mock thank-you page). */
export function useStartDonation() {
  return useMutation({
    mutationFn: (input: { amountKobo: number; name?: string; email?: string }) =>
      api<{ authorizationUrl: string; reference: string }>("/donations", { method: "POST", body: input }),
    onSuccess: ({ authorizationUrl }) => window.location.assign(authorizationUrl),
  });
}

export function useVerifyDonation() {
  return useMutation({
    mutationFn: (reference: string) =>
      api<{ name: string; amountKobo: number }>("/donations/verify", { method: "POST", body: { reference } }),
  });
}
