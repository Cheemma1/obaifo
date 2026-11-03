import { env } from "../../config/env";
import { prisma } from "../../shared/db/client";
import type { User } from "../../shared/types";
import { badRequest, HttpError, notFound } from "../../shared/utils/http-error";
import { newId } from "../../shared/utils/text";

/**
 * Ọbaifo is free. Donations are one-off gifts that help pay for hosting and
 * building. With PAYSTACK_SECRET_KEY set we use Paystack's hosted checkout;
 * without it (local dev) the mock provider succeeds immediately.
 */

const provider = () => (env.paystackSecretKey ? "paystack" : "mock");

export async function startDonation(
  input: { amountKobo: number; name: string; email: string },
  user?: User,
) {
  const reference = `agm_gift_${newId().replace(/-/g, "").slice(0, 18)}`;
  const callbackPath = `/donate/thanks?reference=${reference}`;
  const p = provider();

  await prisma.donation.create({
    data: {
      userId: user?.id ?? null,
      name: input.name,
      email: input.email,
      reference,
      amountKobo: input.amountKobo,
      provider: p,
    },
  });

  // Mock checkout stays on whatever origin the browser is already on.
  if (p === "mock")
    return { provider: p, reference, authorizationUrl: callbackPath };

  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.paystackSecretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: input.email,
      amount: input.amountKobo,
      reference,
      currency: "NGN",
      callback_url: `${env.clientOrigin}${callbackPath}`,
      metadata: {
        kind: "donation",
        name: input.name,
        userId: user?.id ?? null,
      },
    }),
  });
  const body = (await res.json()) as {
    status: boolean;
    message: string;
    data?: { authorization_url: string };
  };
  if (!res.ok || !body.status || !body.data)
    throw new HttpError(502, `Payment provider error: ${body.message}`);
  return {
    provider: p,
    reference,
    authorizationUrl: body.data.authorization_url,
  };
}

/** Confirms a donation by its reference. Safe to call more than once. */
export async function verifyDonation(reference: string) {
  let donation = await prisma.donation.findUnique({ where: { reference } });
  if (!donation) throw notFound("Donation not found");

  if (donation.status === "pending") {
    let paid = donation.provider === "mock";
    if (donation.provider === "paystack") {
      const res = await fetch(
        `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
        {
          headers: { Authorization: `Bearer ${env.paystackSecretKey}` },
        },
      );
      const body = (await res.json()) as {
        data?: { status: string; amount: number };
      };
      paid =
        body.data?.status === "success" &&
        body.data.amount >= donation.amountKobo;
    }
    donation = await prisma.donation.update({
      where: { id: donation.id },
      data: { status: paid ? "success" : "failed" },
    });
  }

  if (donation.status !== "success")
    throw badRequest("The payment was not completed", "PAYMENT_FAILED");
  return { name: donation.name, amountKobo: donation.amountKobo };
}

/** Public, anonymous tally for the "help build" panel. */
export async function donationStats() {
  return {
    supporters: await prisma.donation.count({ where: { status: "success" } }),
  };
}
