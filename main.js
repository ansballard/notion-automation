import API from "./api.js";
import Utils from "./utils.js";
import config from "./config.js";

import mri from "mri";

const { dry, verbose } = mri(process.argv.slice(2), {
  alias: {
    d: "dry",
    v: "verbose",
  },
  boolean: ["dry", "verbose"],
});

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const { getRecurringPages, updatePage, addComment, getChildBlocks } = API({
  ...config,
  dry,
  verbose,
});
const { parsePage, log, nextDay } = Utils({
  ...config,
  dry,
  verbose,
});

const pages = await getRecurringPages();
log(`Iterating ${pages.length} Pages`);

for (const page of pages) {
  const {
    recurringInterval,
    dueTime,
    userToNotify,
    currentStatus,
    skip,
  } = parsePage(page);

  if (skip) {
    continue;
  }

  let newDueDate = nextDay(dueTime)

  for (let i = 0; i < DAYS.length; i++) {
    if (recurringInterval.includes(DAYS[newDueDate.getDay()])) {
      console.log(
        `Next recurring ${config.propertyKeys.dueDate} is ${
          DAYS[newDueDate.getDay()]
        }`
      );
      console.log(
        `New due date is ${
          DAYS[newDueDate.getDay()]
        }, ${newDueDate.toTimeString()}`
      );
      await updatePage(page.id, {
        [config.propertyKeys.dueDate]: {
          date: {
            start: newDueDate.toISOString(),
            time_zone: config.timeZone.region,
          },
        },
        [config.propertyKeys.status]: {
          select: {
            name: config.status.todo,
          },
        },
      });
      if (userToNotify && currentStatus === config.status.todo) {
        await addComment(page.id, [
          {
            type: "mention",
            mention: {
              type: "user",
              user: userToNotify,
            },
          },
          {
            type: "text",
            text: {
              content: ` This task wasn't marked `,
            },
          },
          {
            type: "text",
            text: {
              content: config.status.done,
            },
            annotations: {
              color: "red",
              bold: true,
            },
          },
          {
            type: "text",
            text: {
              content: `, did you forget?`,
            },
          },
        ]);
      }
      break;
    } else {
      console.log(
        `${
          DAYS[newDueDate.getDay()]
        } isn't set for recurring, checking next day...`
      );
      newDueDate = nextDay(dueTime, newDueDate)
    }
  }
}
