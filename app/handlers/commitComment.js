export default function commitComment ({ payload, repo }) {
  const {
    html_url,
    commit_id,
    path,
    body
  } = payload.comment

  const message = `_In <${html_url}|${path}>:_\n${body}`

  const titleUrl = `https://github.com/${repo.name}/commit/${commit_id}`
  const title = `*<${titleUrl}|[${repo.name}] ${commit_id}>*`

  return {
    title,
    message
  }
}

commitComment.ACTIONS = ['created']
