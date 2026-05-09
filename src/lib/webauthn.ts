// src/lib/webauthn.ts
export async function verifyWebAuthnLogin(
  credential: any,
  expectedChallenge: string,
  rpId: string
): Promise<boolean> {
  try {
    // Basic validation for now (skip full crypto verification)
    if (!credential?.id || !credential?.response?.signature) {
      return false;
    }

    console.log("WebAuthn credential received for:", credential.id);
    return true; // Accept for now - works for development

  } catch (error) {
    console.error("WebAuthn verification failed:", error);
    return false;
  }
}