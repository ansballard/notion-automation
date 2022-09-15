import rc from "rc";

const appName = "nautomation";

/** @type {import('./types.mjs').Config} */
const defaults = {
  databaseId: process.env.databaseId,
  notionToken: process.env.notionToken,

  propertyKeys: {
    recurringInterval: "Recurring Interval",
    dueDate: "Due Date",
    userNotify: "Notify",
    status: "Status",
  },
  status: {
    todo: "To Do",
    done: "Done",
  },
  timeZone: {
    region: "America/New_York",
    //@ts-ignore cast to int before export
    offset: "-4",
  },
};

/** @type {import('./types.mjs').Config} */
const config = rc(appName, defaults);
export default {
  ...config,
  timeZone: {
    ...config.timeZone,
    // offset is a number, if it's invalid just throw up
    offset: +config.timeZone.offset
  }
}
