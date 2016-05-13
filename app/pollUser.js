import createGithubApi from './lib/createGithubApi'
import createSlackApi from './lib/createSlackApi'
import handleNotifications from './handlers'
import createLogger from './log'

const log = createLogger('pollUser')

export default function pollUser (name, config) {
  const slack = createSlackApi(config.slack)
  const github = createGithubApi(name, config.githubToken)

  poll()

  async function poll () {
    log.info(`Polling ${name}`)

    const {
      pollInterval,
      notifications
    } = await github.getNewNotifications()

    log.debug(`Received notifications for ${name}`)

    handleNotifications(notifications, github, slack)
    github.markAsRead()

    setTimeout(poll, pollInterval * 1000)
  }
}
