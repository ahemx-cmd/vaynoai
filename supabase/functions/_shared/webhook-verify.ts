/**
 * HMAC-SHA256 signature verification for webhooks
 */

/**
 * Verify LemonSqueezy webhook signature using HMAC-SHA256
 * @param payload - Raw request body as string
 * @param signature - Signature from x-signature header
 * @param secret - Webhook secret from environment
 * @returns boolean indicating if signature is valid
 */
export async function verifyLemonSqueezySignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  try {
    // LemonSqueezy uses HMAC-SHA256 for webhook signatures
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(payload)
    );

    // Convert to hex string
    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // Constant-time comparison to prevent timing attacks
    return constantTimeCompare(signature, expectedSignature);
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}
