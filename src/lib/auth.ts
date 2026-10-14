// Sesión del panel /admin firmada con HMAC-SHA256 usando Web Crypto (crypto.subtle),
// para que funcione igual en el middleware y en las acciones del servidor.
// Formato del token: base64url(payload JSON) + '.' + base64url(firma)

export const SESSION_COOKIE = 'dprint_admin'
export const SESSION_COOKIE_PATH = '/admin'
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 días, en segundos

const MIN_SECRET_LENGTH = 32
const encoder = new TextEncoder()

type SessionPayload = {
  sub: string
  exp: number
}

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET?.trim()
  return secret && secret.length >= MIN_SECRET_LENGTH ? secret : null
}

// El ingreso solo funciona si están las 3 variables (sin valores por defecto en el código)
export function isAuthConfigured() {
  return Boolean(
    process.env.ADMIN_USERNAME?.trim() &&
      process.env.ADMIN_PASSWORD?.trim() &&
      getAuthSecret()
  )
}

function toBase64Url(bytes: Uint8Array) {
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(value: string) {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(base64 + '='.repeat((4 - (base64.length % 4)) % 4))
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

async function hmacSha256(data: string, secret: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  return new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(data)))
}

function timingSafeEqualBytes(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i]
  }
  return diff === 0
}

// Comparación de textos en tiempo constante: se comparan los SHA-256 (mismo largo)
// para no filtrar ni el contenido ni el largo del valor secreto.
export async function safeEqual(a: string, b: string) {
  const [hashA, hashB] = await Promise.all([
    crypto.subtle.digest('SHA-256', encoder.encode(a)),
    crypto.subtle.digest('SHA-256', encoder.encode(b)),
  ])
  return timingSafeEqualBytes(new Uint8Array(hashA), new Uint8Array(hashB))
}

export async function createSessionToken(username: string) {
  const secret = getAuthSecret()
  if (!secret) return null

  const payload: SessionPayload = {
    sub: username,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
  }
  const encodedPayload = toBase64Url(encoder.encode(JSON.stringify(payload)))
  const signature = toBase64Url(await hmacSha256(encodedPayload, secret))

  return `${encodedPayload}.${signature}`
}

export async function verifySessionToken(token: string | null | undefined) {
  const secret = getAuthSecret()
  if (!secret || !token) return false

  const parts = token.split('.')
  if (parts.length !== 2) return false
  const [encodedPayload, encodedSignature] = parts

  try {
    const expectedSignature = await hmacSha256(encodedPayload, secret)
    if (!timingSafeEqualBytes(fromBase64Url(encodedSignature), expectedSignature)) {
      return false
    }

    const payload = JSON.parse(
      new TextDecoder().decode(fromBase64Url(encodedPayload))
    ) as Partial<SessionPayload>

    return typeof payload.exp === 'number' && payload.exp > Math.floor(Date.now() / 1000)
  } catch {
    return false
  }
}
