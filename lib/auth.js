import { redirect } from 'next/navigation'

export const roles = {
  ADMIN: 'admin',
  MANAGER: 'manager',
}

export function getLoginRedirect(role) {
  return role === roles.MANAGER ? '/manager/dashboard' : '/admin/dashboard'
}

export function getLoginPath(role) {
  return role === roles.MANAGER ? '/manager/login' : '/admin/login'
}

export function enforceRole(sessionRole, requiredRole) {
  if (sessionRole !== requiredRole) {
    redirect(getLoginPath(requiredRole))
  }
}


