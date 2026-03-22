import {
  DEFAULT_SIGNUP_USER_TYPE,
  type CreateUserRequest,
} from "@/types/requests";

/**
 * Builds the POST /api/users body: `type` is always Free; `avatarUrl` omitted when empty.
 */
export function buildCreateUserPayload(formData: FormData): CreateUserRequest {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const avatarRaw = String(formData.get("avatarUrl") ?? "").trim();

  const payload: CreateUserRequest = {
    name,
    email,
    password,
    type: DEFAULT_SIGNUP_USER_TYPE,
  };

  if (avatarRaw) {
    payload.avatarUrl = avatarRaw;
  }

  return payload;
}

/** Client-side validation before calling the API. Returns an error message or null if OK. */
export function validateSignUpPayload(payload: CreateUserRequest): string | null {
  if (!payload.name) {
    return "Informe seu nome.";
  }
  if (!payload.email) {
    return "Informe um e-mail válido.";
  }
  if (payload.password.length < 8) {
    return "A senha deve ter pelo menos 8 caracteres.";
  }
  if (payload.avatarUrl) {
    try {
      const u = new URL(payload.avatarUrl);
      if (u.protocol !== "http:" && u.protocol !== "https:") {
        return "URL do avatar deve ser http ou https.";
      }
    } catch {
      return "URL do avatar inválida.";
    }
  }
  return null;
}
