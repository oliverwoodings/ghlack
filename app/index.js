import log from './log'
import { map } from 'lodash'
import config from 'config'
import pollUser from './pollUser'

log.info('Starting ghlack')

const users = config.users

map(users, (user, name) => {
  pollUser(name, user)
})
