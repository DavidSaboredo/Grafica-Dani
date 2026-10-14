import { ingresar } from '../acciones'
import BotonEnviar from '../componentes/BotonEnviar'

const ERRORES: Record<string, string> = {
  datos: 'Usuario o contraseña incorrectos.',
  config: 'El panel todavía no está configurado: faltan ADMIN_USERNAME, ADMIN_PASSWORD o AUTH_SECRET en las variables de entorno.',
}

export default async function IngresarPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  const mensaje = error ? ERRORES[error] : null

  return (
    <div className="admin-login">
      <form action={ingresar} className="admin-card admin-login-card">
        <div className="admin-login-header">
          <span className="admin-login-icon" aria-hidden="true">🔐</span>
          <h1 className="admin-title">Panel de productos</h1>
          <p className="admin-subtitle">Ingresá para cargar y editar el catálogo.</p>
        </div>

        {mensaje && (
          <p className="admin-alerta admin-alerta-error" role="alert">{mensaje}</p>
        )}

        <div className="form-group">
          <label htmlFor="usuario" className="form-label">Usuario</label>
          <input
            id="usuario"
            name="usuario"
            type="text"
            className="form-input"
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="clave" className="form-label">Contraseña</label>
          <input
            id="clave"
            name="clave"
            type="password"
            className="form-input"
            autoComplete="current-password"
            required
          />
        </div>

        <BotonEnviar textoEnviando="Ingresando...">Ingresar</BotonEnviar>
      </form>
    </div>
  )
}
