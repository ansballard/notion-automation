import { RequestInfo, RequestInit as _RequestInit, Response } from "node-fetch";

export type RequestInit =
  | (Omit<_RequestInit, "body"> & { body: any })
  | undefined;
export { RequestInfo, Response };
export enum QueryFilterPropertyType {
  RICH_TEXT = "rich_text",
  PHONE_NUMBER = "phone_number",
  NUMBER = "number",
  CHECKBOX = "checkbox",
  SELECT = "select",
  MULTI_SELECT = "multi-select",
  DATE = "date",
  PEOPLE = "people",
  FILES = "files",
  RELATION = "relation",
  STATUS = "status",
  FORMULA = "formula",
  CREATED_TIME = "created_time",
  LAST_EDITED_TIME = "last_edited_time",
}
export type QueryFilterCondition =
  | string
  | {
      equals: string | boolean;
    }
  | {
      does_not_equal: string | boolean;
    }
  | {
      contains: string;
    }
  | {
      does_not_contain: string;
    }
  | {
      starts_with: string;
    }
  | {
      ends_with: string;
    }
  | {
      is_empty: boolean;
    }
  | {
      is_not_empty: boolean;
    };
export enum QueryFilterOperator {
  OR = "or",
  AND = "and",
}
export type QueryFilter = {
  property: string;
  // [key in QueryFilterPropertyType]: {
  [key: string]: QueryFilterCondition;
};
export type CompoundQueryFilter = {
  [key in QueryFilterOperator]?: QueryFilter;
};
export type QueryFilters = QueryFilter | CompoundQueryFilter;

export enum QueryDirection {
  ASC = "ascending",
  DESC = "descending",
}
export type QuerySort = {
  property: string;
  direction: QueryDirection;
};

export type Database = {
  object: string;
  results: Page[];
};
export type PartialUser = {
  object: string; // "user"
  id: string;
};
export type Page = {
  object: string; // "page"
  id: string;
  created_time: string;
  created_by: PartialUser;
  last_edited_time: string;
  last_edited_by: PartialUser;
  archived: boolean;
  icon: File;
  cover: File;
  properties: {
    id: string;
  };
  parent: {
    type: string;
    database_id: string;
  };
  url: string;
};

export type Block = {
  type: string;
  results: Array<{
    type: "to_do";
    to_do: {
      checked: boolean;
    };
  }>;
};
