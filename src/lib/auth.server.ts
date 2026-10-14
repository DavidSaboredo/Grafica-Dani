import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { SESSION_COOKIE, verifySessionToken } from './auth'

// Verifica la firma y el vencimiento del token guardado en la cookie de sesión
export async function hasValidSession() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value
  return verifySessionToken(token)
}

// Las acciones del servidor se pueden invocar por POST desde cualquier página,
// así que además del middleware cada acción verifica la sesión.
export async function requireSession() {
  if (!(await hasValidSession())) {
    redirect('/admin/ingresar')
  }
}
