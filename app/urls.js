export function notificationsUrl (since) {
  return `https://api.github.com/notifications?since=${since}`
}

export function commitCommentsUrl (owner, repo, red) {
  return `https://api.github.com/repos/${org}/${repo}/commits/${ref}/comments`
}

export function issueCommentsUrl (owner, repo, issue) {

}