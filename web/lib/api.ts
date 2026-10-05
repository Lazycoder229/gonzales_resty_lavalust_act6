export type User = { id: number; name: string; email: string }

export type Product = {
  id: number
  product_name: string
  description: string
  price: string
  quantity: number
  created_at: string
}

type ApiError = { error?: string; message?: string }
type TokenResponse = {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
}

const API_URL = (process.env.LAVALUST_API_URL || "https://gonzales-resty-lavalust-act6.onrender.com/api").replace(/\/$/, "")
const SESSION_KEY = "stockroom.session"

async function request(url: string, options: RequestInit = {}) {
  try {
    return await fetch(url, options)
  } catch {
    throw new Error(`Cannot reach the LavaLust API at ${API_URL}. Check that the backend is running and the API URL is correct.`)
  }
}

export type Session = { user: User; tokens: TokenResponse }

export function readSession(): Session | null {
  if (typeof window === "undefined") return null
  try {
    const value = sessionStorage.getItem(SESSION_KEY)
    return value ? (JSON.parse(value) as Session) : null
  } catch {
    return null
  }
}

export function saveSession(session: Session | null) {
  if (typeof window === "undefined") return
  if (session) sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
  else sessionStorage.removeItem(SESSION_KEY)
}

async function parseResponse<T>(response: Response): Promise<T> {
  const result = (await response.json().catch(() => ({}))) as ApiError & T
  if (!response.ok) throw new Error(result.error || result.message || "Something went wrong. Please try again.")
  return result
}

export async function authenticate(path: "login" | "register", fields: Record<string, string>) {
  const response = await request(`${API_URL}/auth/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(fields),
  })
  return parseResponse<Session & { message: string }>(response)
}

async function refreshSession(session: Session) {
  const response = await request(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: session.tokens.refresh_token }),
  })
  const result = await parseResponse<{ tokens: TokenResponse }>(response)
  const updated = { ...session, tokens: result.tokens }
  saveSession(updated)
  return updated
}

export async function apiFetch<T>(path: string, options: RequestInit = {}) {
  let session = readSession()
  if (!session) throw new Error("Your session has expired. Sign in again to continue.")

  const send = (accessToken: string) =>
    request(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
        Authorization: `Bearer ${accessToken}`,
      },
    })

  let response = await send(session.tokens.access_token)
  if (response.status === 401) {
    try {
      session = await refreshSession(session)
      response = await send(session.tokens.access_token)
    } catch {
      saveSession(null)
      throw new Error("Your session has expired. Sign in again to continue.")
    }
  }
  return parseResponse<T>(response)
}

export async function signOut() {
  const session = readSession()
  if (!session) return
  try {
    await request(`${API_URL}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.tokens.access_token}`,
      },
      body: JSON.stringify({ refresh_token: session.tokens.refresh_token }),
    })
  } finally {
    saveSession(null)
  }
}
