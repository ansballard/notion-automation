/**
 * @param {import('./types.mjs').Env} env
 * @returns {import('./types.mjs').Utils}
 */
export default (env) => ({
  parsePage: (page) => parsePage(page, env),
  log: (...args) => log(env, ...args),
  nextDay: (dueTime, current) => nextDay(dueTime, current, env)
});

/** @type {import('./types.mjs').ParsePage} */
export const parsePage = (page, env) => {
  const recurringInterval = page.properties[
    env.propertyKeys.recurringInterval
  ]?.multi_select?.map(({ name }) => name);

  const dueTime = new Date(
    page.properties[env.propertyKeys.dueDate]?.date?.start
  );

  const userToNotify = page.properties[env.propertyKeys.userNotify]?.people[0];
  const currentStatus = page.properties[env.propertyKeys.status]?.select.name;

  // skip page if
  // - DUE_TIME isn't a prop
  // - RECURRING_INTERVAL isn't a prop or is empty
  // - DUE_DATE is in the future
  const skip =
    !dueTime ||
    !recurringInterval ||
    recurringInterval.length < 1 ||
    new Date() < dueTime;

  return {
    recurringInterval,
    dueTime,
    userToNotify,
    currentStatus,
    skip,
  };
};

/** @type {import('./types.mjs').NextDay} */
export const nextDay = (dueTime, current, env) => {
  const newDate = current ? new Date(current) : new Date()
  if (!current) {
    // Determine the next recurrence by setting the time in the current day
    newDate.setHours(
      dueTime.getHours() + env.timeZone.offset,
      dueTime.getMinutes(),
      dueTime.getSeconds()
    );
    // if the time puts us in the past, increment by 1 day
    if (newDate < new Date()) {
      newDate.setMonth(newDate.getMonth(), newDate.getDate() + 1);
    }
  } else {
    newDate.setMonth(newDate.getMonth(), newDate.getDate() + 1)
  }
  return newDate
}

/** @type {import('./types.mjs').Log} */
export const log = (env, ...args) => {
  env.verbose && console.log(...args);
};
