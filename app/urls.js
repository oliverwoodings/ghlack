export function notificationsUrl () {
  return `https://api.github.com/notifications`
}

export function eventsUrl (user) {
  return `https://api.github.com/users/${user}/received_events`
}
