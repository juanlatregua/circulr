import { stripe } from "./client";

export async function getReceiptUrl(paymentIntentId: string): Promise<string | null> {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.latest_charge) {
      const charge = await stripe.charges.retrieve(
        paymentIntent.latest_charge as string
      );
      return charge.receipt_url || null;
    }
    return null;
  } catch {
    return null;
  }
}
