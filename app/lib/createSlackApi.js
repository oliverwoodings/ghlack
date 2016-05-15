import Slack from 'node-slack'
import invariant from 'invariant'
import config from 'config'

export default function createSlackApi ({ hook, channel }) {
  invariant(!!hook, 'Slack hook required')
  invariant(!!channel, 'Slack channel required')

  const slack = new Slack(hook)

  function send ({ text, attachments }) {
    slack.send({
      text,
      channel,
      username: config.slack.username,
      attachments 
    })
  }

  return { send }
}
