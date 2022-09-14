/**
 * @param {import('./types.mjs').UtilsParams} env
 * @returns {import('./types.mjs').Utils}
 */
export default (env) => ({
  ...env,

  parsePage: (page) => parsePage(page, env)
})

export const parsePage = (page, env) => ({
  recurringInterval: page.properties[
    env.propertyKeys.recurringInterval
  ]?.multi_select?.map(({ name }) => name),

  dueTime: new Date(page.properties[env.propertyKeys.dueDate]?.date?.start),
  newDueDate: new Date(),

  userToNotify: page.properties[env.propertyKeys.userNotify]?.people[0],
  currentStatus: page.properties[env.propertyKeys.status]?.select.name
})