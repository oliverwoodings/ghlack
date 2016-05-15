export default function pullRequestReviewComment ({ payload, repo }) {
  const {
    id,
    html_url: commentUrl,
    path,
    diff_hunk: diffHunk,
    body,
    commit_id: commitId
  } = payload.comment

  const {
    html_url: prUrl,
    title: prTitle,
    number
  } = payload.pull_request

  const message = `_In <${commentUrl}|${path}>:_\n\`\`\`${diffHunk}\`\`\`\n${body}`

  const titleUrl = `${prUrl}/files/${commitId}#r${id}`
  const title = `*<${titleUrl}|[${repo.name}] ${prTitle} (#${number})>*`

  return {
    title,
    message
  }
}

pullRequestReviewComment.ACTIONS = ['created']
