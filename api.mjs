import _fetch from "node-fetch";

/** @typedef {import('./types.mjs').Page} Page */
/** @typedef {import('./types.mjs').Database} Database */

/**
 * @param {import('./types.mjs').RequestInfo} url
 * @param {import('./types.mjs').RequestInit} [init]
 * @returns {Promise<any>}
 */
export const fetch = async (url, init) => {
  const response = await _fetch(url, {
    ...(init || {}),
    body: init?.body ? JSON.stringify(init.body) : null,
    headers: {
      ...(init?.headers || {}),
      Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
      "Content-Type": "application/json",
      "Notion-Version": "2021-08-16",
    },
  });
  return response.json();
};

/**
 * @param {string} id
 * @param {import('./types.mjs').QueryFilters} [filter]
 * @param {import('./types.mjs').QuerySort[]} [sorts]
 * @returns {Promise<import('./types.mjs').Page[]>}
 */
export const queryDatabase = async (
  id,
  filter = undefined,
  sorts = undefined
) => {
  /** @type {Database} */
  const database = await fetch(
    `https://api.notion.com/v1/databases/${id}/query`,
    {
      method: "POST",
      body: {
        filter,
        sorts,
      },
    }
  );
  return database.results;
};

/**
 * @param {string} id
 * @returns {Promise<import('./types.mjs').Page[]>}
 */
export const getRecurringPages = async (id) =>
  queryDatabase(id, {
    property: "Recurring",
    checkbox: {
      equals: true,
    },
  });

/**
 * @param {string} id
 * @param {any} properties
 * @returns {Promise<import('./types.mjs').Page>}
 */
export const updatePage = async (id, properties) => {
  /** @type {import('./types.mjs').Page} */
  return fetch(`https://api.notion.com/v1/pages/${id}`, {
    method: "PATCH",
    body: {
      properties,
    },
  });
};

/**
 * @param {string} id
 * @returns {Promise<import('./types.mjs').Page>}
 */
export const getPage = (id) => {
  return fetch(`https://api.notion.com/v1/pages/${id}`)
}

/**
 * @param {string} id
 * @returns {Promise<import('./types.mjs').Block>}
 */
export const getBlockChildren = (id) => {
  return fetch(`https://api.notion.com/v1/blocks/${id}/children`)
}

export const addComment = (id, richText) => {
  return fetch(`https://api.notion.com/v1/comments`, {
    method: "POST",
    body: {
      parent: {
        page_id: id,
      },
      rich_text: richText,
    },
  });
};
