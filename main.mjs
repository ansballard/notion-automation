import { getRecurringPages, updatePage, addComment } from "./api.mjs";

const DB_ID = process.env.DB_ID

const RECURRING_INTERVAL_PROPERTY_KEY = 'Recurring Interval'
const DUE_DATE_PROPERTY_KEY = 'Due Date'
const USER_NOTIFY_PROPERTY_KEY = 'Notify'
const STATUS_PROPERTY_KEY = 'Status'

const TODO_STATUS = 'To Do'
const DONE_STATUS = 'Done'

const TIME_ZONE = 'America/New_York'
const TIME_ZONE_OFFSET = -4

const DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
]

const pages = await getRecurringPages(DB_ID)

for(const page of pages) {
  /** @type {string[]} */
  const recurringInterval = page.properties[RECURRING_INTERVAL_PROPERTY_KEY]?.multi_select?.map(({ name }) => name)

  const dueTime = new Date(page.properties[DUE_DATE_PROPERTY_KEY]?.date?.start)
  const newDueDate = new Date()

  const userToNotify = page.properties[USER_NOTIFY_PROPERTY_KEY]?.people[0]
  const currentStatus = page.properties[STATUS_PROPERTY_KEY]?.select.name

  // skip page if
  // - DUE_TIME isn't a prop
  // - RECURRING_INTERVAL isn't a prop or is empty
  // - DUE_DATE is in the future
  if (!dueTime || !recurringInterval || recurringInterval.length < 1 || newDueDate < dueTime) {
    continue;
  }

  // Determine the next recurrence by setting the time in the current day
  newDueDate.setHours((dueTime.getHours() + TIME_ZONE_OFFSET), dueTime.getMinutes(), dueTime.getSeconds())
  // if the time puts us in the past, increment by 1 day
  if (newDueDate < new Date()) {
    newDueDate.setMonth(newDueDate.getMonth(), newDueDate.getDate() + 1)
  }

  for (let i = 0; i < DAYS.length; i++) {
    if (recurringInterval.includes(DAYS[newDueDate.getDay()])) {
      console.log(`Next recurring ${DUE_DATE_PROPERTY_KEY} is ${DAYS[newDueDate.getDay()]}`)
      console.log(`New due date is ${DAYS[newDueDate.getDay()]}, ${newDueDate.toTimeString()}`)
      await updatePage(page.id, {
        [DUE_DATE_PROPERTY_KEY]: {
          date: {
            start: newDueDate.toISOString(),
            time_zone: TIME_ZONE
          }
        },
        [STATUS_PROPERTY_KEY]: {
          select: {
            name: TODO_STATUS
          }
        }
      })
      if (userToNotify && currentStatus === TODO_STATUS) {
        await addComment(page.id, [{
          type: 'mention',
          mention: {
            type: 'user',
            user: userToNotify
          },
        }, {
          type: 'text',
          text: {
            content: ` This task wasn't marked `
          }
        }, {
          type: 'text',
          text: {
            content: DONE_STATUS
          },
          annotations: {
            color: 'red',
            bold: true
          }
        }, {
          type: 'text',
          text: {
            content: `, did you forget?`
          }
        }])
      }
      break;
    } else {
      console.log(`${DAYS[newDueDate.getDay()]} isn't set for recurring, checking next day...`)
      newDueDate.setMonth(newDueDate.getMonth(), newDueDate.getDate() + 1)
    }
  }
}
