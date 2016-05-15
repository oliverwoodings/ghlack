export default function pullRequestReviewComment ({ payload, repo }) {
  const {
    id,
    html_url: commentUrl,
    path,
    diff_hunk,
    body,
    commit_id
  } = payload.comment

  const {
    html_url: prUrl,
    title: prTitle,
    number
  } = payload.pull_request

  const message = `In <${commentUrl}|${path}>:\n\`\`\`${diff_hunk}\`\`\`\n${body}`

  const titleUrl = `${prUrl}/files/${commit_id}#r${id}`
  const title = `*<${titleUrl}|[${repo.name}] ${prTitle} (#${number})>*`

  return {
    title,
    message
  }
}

pullRequestReviewComment.ACTIONS = ['created']
