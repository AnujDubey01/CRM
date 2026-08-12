const USER_KEYS = ['user', 'authUser', 'currentUser']
const TOKEN_KEYS = ['token', 'authToken', 'accessToken']

const demoUser = {
  name: 'Admin User',
  firstName: 'Admin',
  email: 'admin@opsflow.com',
  role: 'admin',
  roleLabel: 'Admin',
}

const formatRole = (role) => {
  if (!role) {
    return demoUser.roleLabel
  }

  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()
}

const parseStoredUser = () => {
  for (const key of USER_KEYS) {
    const rawValue = localStorage.getItem(key)

    if (!rawValue) {
      continue
    }

    try {
      const parsedValue = JSON.parse(rawValue)

      if (parsedValue?.name) {
        const role = parsedValue.role?.toLowerCase() || demoUser.role

        return {
          ...parsedValue,
          role,
          firstName: parsedValue.name.split(' ')[0],
          roleLabel: formatRole(role),
        }
      }
    } catch {
      // Ignore malformed storage values and continue.
    }
  }

  return demoUser
}

export const getCurrentUser = () => parseStoredUser()

export const getAccessToken = () => {
  for (const key of TOKEN_KEYS) {
    const token = localStorage.getItem(key)

    if (token) {
      return token
    }
  }

  return ''
}

export const isUsingDemoSession = () => getAccessToken() === ''
