export default function commitComment ({ payload, repo }) {
  const {
    html_url: htmlUrl,
    commit_id: commitId,
    path,
    body
  } = payload.comment

  const message = `_In <${htmlUrl}|${path}>:_\n${body}`

  const titleUrl = `https://github.com/${repo.name}/commit/${commitId}`
  const title = `*<${titleUrl}|[${repo.name}] ${commitId}>*`

  return {
    title,
    message
  }
}

commitComment.ACTIONS = ['created']
