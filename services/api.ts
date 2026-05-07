import { UserProfile, LanguageCode, ThemeMode } from "../types";

const resolveApiBaseUrl = (): string => {
  const envBase = (import.meta as any)?.env?.VITE_API_BASE_URL as string | undefined;
  if (envBase && envBase.trim()) {
    return envBase.replace(/\/$/, "");
  }

  if (typeof window === "undefined") {
    return "http://localhost:4000/api";
  }

  const { origin, hostname, port } = window.location;
  const isLocalHost = hostname === "localhost" || hostname === "127.0.0.1";
  const localFrontendPorts = new Set(["3000", "4173", "5173"]);

  if (isLocalHost && localFrontendPorts.has(port)) {
    return "http://localhost:4000/api";
  }

  return `${origin.replace(/\/$/, "")}/api`;
};

const API_BASE_URL = resolveApiBaseUrl();

if (typeof window !== "undefined") {
  console.log("[API][INIT] API_BASE_URL resuelta", {
    origin: window.location.origin,
    apiBaseUrl: API_BASE_URL,
  });
}

export interface RegisterPayload {
  name?: string;
  email: string;
  password: string;
  role?: "cliente" | "empresa";
  destination?: string;
  dates?: string;
  tripStartDate?: string;
  tripEndDate?: string;
  age?: number;
  sex?: UserProfile["sex"];
  country?: string;
  bio?: string;
  budget?: UserProfile["budget"];
  travelStyle?: UserProfile["travelStyle"];
  interests?: UserProfile["interests"];
  avatarUrl?: string;
  language?: LanguageCode;
  theme?: ThemeMode;
}

export async function registerUser(
  payload: RegisterPayload
): Promise<UserProfile> {
  const endpoint = `${API_BASE_URL}/auth/register`;
  const requestStartedAt = Date.now();
  console.log("[API][REGISTER] Preparando request", {
    endpoint,
    payloadPreview: {
      ...payload,
      password: `***hidden***(${payload.password.length})`,
    },
  });

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  console.log("[API][REGISTER] Response recibida", {
    endpoint,
    ok: res.ok,
    status: res.status,
    statusText: res.statusText,
    elapsedMs: Date.now() - requestStartedAt,
  });

  let data: any = null;
  let fallbackText: string | null = null;

  // Leemos primero como texto para evitar "body already consumed"
  const rawBody = await res.text();
  if (rawBody) {
    try {
      data = JSON.parse(rawBody);
      console.log("[API][REGISTER] Body parseado como JSON", {
        type: typeof data,
        hasId: !!data?.id,
        hasError: !!data?.error,
      });
    } catch {
      fallbackText = rawBody;
      console.warn("[API][REGISTER] Body no es JSON, se usa texto", {
        length: fallbackText.length,
        preview: fallbackText.slice(0, 200),
      });
    }
  }

  if (!res.ok) {
    const message =
      (data && typeof data === "object" && (data.error || data.message)) ||
      fallbackText ||
      `Error al registrar usuario (HTTP ${res.status})`;
    console.error("[API][REGISTER] Request fallida", {
      endpoint,
      status: res.status,
      statusText: res.statusText,
      message,
    });
    throw new Error(message);
  }

  console.log("[API][REGISTER] Request exitosa", {
    endpoint,
    userId: data?.id,
    userEmail: data?.email,
  });

  return data as UserProfile;
}

export async function loginUser(
  email: string,
  password: string
): Promise<UserProfile> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  let data: any = null;
  let fallbackText: string | null = null;

  try {
    data = await res.json();
  } catch {
    // Si no es JSON válido, intentamos leer el cuerpo como texto
    try {
      fallbackText = await res.text();
    } catch {
      // ignoramos el error, nos quedamos sin cuerpo legible
    }
  }

  if (!res.ok) {
    const message =
      (data && typeof data === "object" && (data.error || data.message)) ||
      fallbackText ||
      "Error al iniciar sesión";
    throw new Error(message);
  }

  // El servidor respondió 200 pero el cuerpo no es un JSON de usuario válido
  if (!data || typeof data !== "object") {
    throw new Error(
      fallbackText || "Respuesta inválida del servidor al iniciar sesión"
    );
  }

  return data as UserProfile;
}

async function parseJsonResponse(res: Response): Promise<{ data: any; text: string }> {
  const text = await res.text();
  if (!text) return { data: null, text: "" };
  try {
    return { data: JSON.parse(text), text };
  } catch {
    return { data: null, text };
  }
}

export async function recoverAccount(
  email: string,
  newPassword: string
): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE_URL}/auth/recover`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, newPassword }),
  });

  const rawBody = await res.text();
  let data: any = null;
  let fallbackText: string | null = null;

  if (rawBody) {
    try {
      data = JSON.parse(rawBody);
    } catch {
      fallbackText = rawBody;
    }
  }

  if (!res.ok) {
    const message =
      (data && typeof data === "object" && (data.error || data.message)) ||
      fallbackText ||
      "No se pudo recuperar la cuenta";
    throw new Error(message);
  }

  return {
    message:
      (data && typeof data === "object" && data.message) ||
      "Contraseña actualizada correctamente.",
  };
}

export async function updateUserProfile(
  id: string,
  profile: Partial<UserProfile>
): Promise<UserProfile> {
  const payload = { ...profile } as Record<string, unknown>;
  delete payload.id;
  const res = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const { data, text } = await parseJsonResponse(res);
  if (!res.ok) {
    const message =
      (data && typeof data === "object" && (data.error || data.message)) ||
      text ||
      `Error al actualizar usuario (HTTP ${res.status})`;
    throw new Error(message);
  }
  if (!data || typeof data !== "object") {
    throw new Error(text || "Respuesta inválida del servidor");
  }
  return data as UserProfile;
}

export async function deleteUserAccount(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/users/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const { data, text } = await parseJsonResponse(res);
    const message =
      (data && typeof data === "object" && (data.error || data.message)) ||
      text ||
      `Error al borrar la cuenta (HTTP ${res.status})`;
    throw new Error(message);
  }
}

export async function scheduleAccountDeletion(
  id: string,
  scheduledAtIso: string
): Promise<UserProfile> {
  const res = await fetch(`${API_BASE_URL}/users/${id}/schedule-deletion`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ scheduledAt: scheduledAtIso }),
  });
  const { data, text } = await parseJsonResponse(res);
  if (!res.ok) {
    const message =
      (data && typeof data === "object" && (data.error || data.message)) ||
      text ||
      "Error al programar el borrado";
    throw new Error(message);
  }
  return data as UserProfile;
}

export async function cancelScheduledDeletion(id: string): Promise<UserProfile> {
  const res = await fetch(`${API_BASE_URL}/users/${id}/cancel-deletion`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  const { data, text } = await parseJsonResponse(res);
  if (!res.ok) {
    const message =
      (data && typeof data === "object" && (data.error || data.message)) ||
      text ||
      "Error al cancelar el borrado";
    throw new Error(message);
  }
  return data as UserProfile;
}

