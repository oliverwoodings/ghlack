export function notificationsUrl () {
  return `https://api.github.com/notifications`
}

export function commitCommentsUrl (owner, repo, red) {
  return `https://api.github.com/repos/${org}/${repo}/commits/${ref}/comments`
}

export function issueCommentsUrl (owner, repo, issue) {

}