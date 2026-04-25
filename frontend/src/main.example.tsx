/**
 * MAIN.TSX - PUNTO DE ENTRADA DE LA APLICACIÓN
 * 
 * Este archivo muestra cómo integrar el AuthProvider correctamente
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import { AuthProvider } from '@/app/providers/auth-provider'
import { AppRouter } from '@/app/router'
import './index.css'

/**
 * ESTRUCTURA CORRECTA:
 * 
 * 1. AuthProvider DEBE estar FUERA de AppRouter
 * 2. AuthProvider DEBE estar DENTRO de React.StrictMode
 * 3. AppRouter consume useAuth() dentro del contexto
 * 
 * ✅ CORRECTO
 */
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* AuthProvider proporciona contexto global de autenticación */}
    <AuthProvider>
      {/* AppRouter usa useAuth() internamente */}
      <AppRouter />
    </AuthProvider>
  </React.StrictMode>,
)

/**
 * ❌ INCORRECTO - No hagas esto:
 * 
 * ReactDOM.createRoot(document.getElementById('root')!).render(
 *   <React.StrictMode>
 *     <AppRouter>
 *       <AuthProvider>  {/* AppRouter no puede envolver AuthProvider */}
 *         ...
 *       </AuthProvider>
 *     </AppRouter>
 *   </React.StrictMode>,
 * )
 * 
 * Razón: AppRouter necesita acceder a useAuth() que es proporcionado
 * por AuthProvider, así que AuthProvider debe estar afuera.
 */
