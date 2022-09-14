import _fetch from "node-fetch";

/** @typedef {import('./types.mjs').Block} Block */
/** @typedef {import('./types.mjs').Page} Page */
/** @typedef {import('./types.mjs').Database} Database */

/**
 * @param {import('./types.mjs').ApiParams} env
 * @returns {import('./types.mjs').Api}
 */
export default (env) => {
  const { db, token, dry, verbose } = env;

  return {
    db,
    token,
    dry,
    verbose,

    queryDatabase: (filter, sorts) => queryDatabase(filter, sorts, env),
    getRecurringPages: () => getRecurringPages(env),
    updatePage: (id, properties) => updatePage(id, properties, env),
    getPage: (id) => getPage(id, env),
    getChildBlocks: (id) => getChildBlocks(id, env),
    addComment: (id, richText) => addComment(id, richText, env),
  };
};

const MUTATOR = true;
const QUERY = false;

/** @type {import('./types.mjs').Fetch} */
export async function fetch(url, init, env, mutable) {
  const body = init?.body;
  const headers = {
    ...(init?.headers || {}),
    Authorization: `Bearer TOKEN_TOKEN_TOKEN`,
    "Content-Type": "application/json",
    "Notion-Version": "2021-08-16",
  };
  if (env.dry && mutable) {
    if (env.verbose) {
      console.log("---");
      console.log(
        `fetch(\n  "${url}",\n  body: ${JSON.stringify(
          body
        )},\n  headers: ${JSON.stringify(headers)}\n})`
      );
      console.log("---");
    }
    return {};
  }
  const response = await _fetch(url, {
    ...(init || {}),
    body: init?.body ? JSON.stringify(init.body) : null,
    headers: {
      ...headers,
      Authorization: `Bearer ${env.token}`,
    },
  });
  return response.json();
}

/** @type {import('./types.mjs').QueryDatabase} */
export const queryDatabase = async (filter, sorts, env) => {
  env.verbose && console.log("Query database");
  /** @type {Database} */
  // @ts-ignore Casting fetch to a specific type
  const database = await fetch(
    `https://api.notion.com/v1/databases/${env.db}/query`,
    {
      method: "POST",
      body: {
        filter,
        sorts,
      },
    },
    env,
    QUERY
  );
  return database?.results;
};

/** @type {import('./types.mjs').GetRecurringPages} */
export const getRecurringPages = async (env) =>
  queryDatabase(
    {
      property: "Recurring",
      checkbox: {
        equals: true,
      },
    },
    undefined,
    env
  );

/** @type {import('./types.mjs').UpdatePage} */
export const updatePage = async (id, properties, env) => {
  env.verbose && console.log(`Update Page: ${id}`);
  /** @type {Page} */
  // @ts-ignore Casting fetch to a specific type
  const page = await fetch(
    `https://api.notion.com/v1/pages/${id}`,
    {
      method: "PATCH",
      body: {
        properties,
      },
    },
    env,
    MUTATOR
  );
  return page;
};

/** @type {import('./types.mjs').GetPage} */
export const getPage = async (id, env) => {
  env.verbose && console.log(`Get Page: ${id}`);
  /** @type {Page} */
  // @ts-ignore Casting fetch to a specific type
  const page = await fetch(
    `https://api.notion.com/v1/pages/${id}`,
    undefined,
    env,
    QUERY
  );
  return page;
};

/** @type {import('./types.mjs').GetChildBlocks} */
export const getChildBlocks = async (id, env) => {
  env.verbose && console.log(`Get Child Blocks: ${id}`);
  /** @type {Block} */
  // @ts-ignore Casting fetch to a specific type
  const block = await fetch(
    `https://api.notion.com/v1/blocks/${id}/children`,
    undefined,
    env,
    QUERY
  );
  return block;
};

/** @type {import('./types.mjs').addComment} */
export const addComment = (id, richText, env) => {
  env.verbose && console.log(`Add Comment: ${id}`);
  return fetch(
    `https://api.notion.com/v1/comments`,
    {
      method: "POST",
      body: {
        parent: {
          page_id: id,
        },
        rich_text: richText,
      },
    },
    env,
    MUTATOR
  );
};
