import { APIContext } from "astro";

export type GetEnvObjectFromRequestContext = (
  context: APIContext
) => Record<string, string>;

export type DecapCmsIntegrationOptions =
  | {
      cmsConfig: CmsConfig;
      cmsScriptSrc?: string;
      injectOAuthRoute?: false;
    }
  | {
      cmsConfig: CmsConfig;
      cmsScriptSrc?: string;
      injectOAuthRoute: true;
      getEnvObjectFromRequestContext: GetEnvObjectFromRequestContext;
    };

type CmsBackendType =
  | "azure"
  | "git-gateway"
  | "github"
  | "gitlab"
  | "gitea"
  | "bitbucket"
  | "test-repo"
  | "proxy";

type CmsMapWidgetType = "Point" | "LineString" | "Polygon";

type CmsMarkdownWidgetButton =
  | "bold"
  | "italic"
  | "code"
  | "link"
  | "heading-one"
  | "heading-two"
  | "heading-three"
  | "heading-four"
  | "heading-five"
  | "heading-six"
  | "quote"
  | "code-block"
  | "bulleted-list"
  | "numbered-list";

interface CmsSelectWidgetOptionObject {
  label: string;
  value: any;
}

type CmsCollectionFormatType = string;

type CmsAuthScope = "repo" | "public_repo";

type CmsPublishMode = "simple" | "editorial_workflow" | "";

type CmsSlugEncoding = "unicode" | "ascii";

interface CmsI18nConfig {
  structure: "multiple_folders" | "multiple_files" | "single_file";
  locales: string[];
  default_locale?: string;
}

interface CmsFieldBase {
  name: string;
  label?: string;
  required?: boolean;
  hint?: string;
  pattern?: [string, string];
  i18n?: boolean | "translate" | "duplicate" | "none";
  media_folder?: string;
  public_folder?: string;
  comment?: string;
}

interface CmsFieldBoolean {
  widget: "boolean";
  default?: boolean;
}

interface CmsFieldCode {
  widget: "code";
  default?: any;

  default_language?: string;
  allow_language_selection?: boolean;
  keys?: { code: string; lang: string };
  output_code_only?: boolean;
}

interface CmsFieldColor {
  widget: "color";
  default?: string;

  allowInput?: boolean;
  enableAlpha?: boolean;
}

interface CmsFieldDateTime {
  widget: "datetime";
  default?: string;

  format?: string;
  date_format?: boolean | string;
  time_format?: boolean | string;
  picker_utc?: boolean;

  /**
   * @deprecated Use date_format instead
   */
  dateFormat?: boolean | string;
  /**
   * @deprecated Use time_format instead
   */
  timeFormat?: boolean | string;
  /**
   * @deprecated Use picker_utc instead
   */
  pickerUtc?: boolean;
}

interface CmsFieldFileOrImage {
  widget: "file" | "image";
  default?: string;

  media_library?: CmsMediaLibrary;
  allow_multiple?: boolean;
  choose_url?: boolean;
  config?: any;
}

interface CmsFieldObject {
  widget: "object";
  default?: any;

  collapsed?: boolean;
  summary?: string;
  fields: CmsField[];
}

interface CmsFieldList {
  widget: "list";
  default?: any;

  allow_add?: boolean;
  collapsed?: boolean;
  summary?: string;
  minimize_collapsed?: boolean;
  label_singular?: string;
  field?: CmsField;
  fields?: CmsField[];
  max?: number;
  min?: number;
  add_to_top?: boolean;
  types?: (CmsFieldBase & CmsFieldObject)[];
}

interface CmsFieldMap {
  widget: "map";
  default?: string;

  decimals?: number;
  type?: CmsMapWidgetType;
}

interface CmsFieldMarkdown {
  widget: "markdown";
  default?: string;

  minimal?: boolean;
  buttons?: CmsMarkdownWidgetButton[];
  editor_components?: string[];
  modes?: ("raw" | "rich_text")[];

  /**
   * @deprecated Use editor_components instead
   */
  editorComponents?: string[];
}

interface CmsFieldNumber {
  widget: "number";
  default?: string | number;

  value_type?: "int" | "float" | string;
  min?: number;
  max?: number;

  step?: number;

  /**
   * @deprecated Use valueType instead
   */
  valueType?: "int" | "float" | string;
}

interface CmsFieldSelect {
  widget: "select";
  default?: string | string[];

  options: string[] | CmsSelectWidgetOptionObject[];
  multiple?: boolean;
  min?: number;
  max?: number;
}

interface CmsFieldRelation {
  widget: "relation";
  default?: string | string[];

  collection: string;
  value_field: string;
  search_fields: string[];
  file?: string;
  display_fields?: string[];
  multiple?: boolean;
  options_length?: number;

  /**
   * @deprecated Use value_field instead
   */
  valueField?: string;
  /**
   * @deprecated Use search_fields instead
   */
  searchFields?: string[];
  /**
   * @deprecated Use display_fields instead
   */
  displayFields?: string[];
  /**
   * @deprecated Use options_length instead
   */
  optionsLength?: number;
}

interface CmsFieldHidden {
  widget: "hidden";
  default?: any;
}

interface CmsFieldStringOrText {
  // This is the default widget, so declaring its type is optional.
  widget?: "string" | "text";
  default?: string;
}

interface CmsFieldMeta {
  name: string;
  label: string;
  widget: string;
  required: boolean;
  index_file: string;
  meta: boolean;
}

type CmsField = CmsFieldBase &
  (
    | CmsFieldBoolean
    | CmsFieldCode
    | CmsFieldColor
    | CmsFieldDateTime
    | CmsFieldFileOrImage
    | CmsFieldList
    | CmsFieldMap
    | CmsFieldMarkdown
    | CmsFieldNumber
    | CmsFieldObject
    | CmsFieldRelation
    | CmsFieldSelect
    | CmsFieldHidden
    | CmsFieldStringOrText
    | CmsFieldMeta
  );

interface CmsCollectionFile {
  name: string;
  label: string;
  file: string;
  fields: CmsField[];
  label_singular?: string;
  description?: string;
  preview_path?: string;
  preview_path_date_field?: string;
  i18n?: boolean | CmsI18nConfig;
  media_folder?: string;
  public_folder?: string;
}

interface ViewFilter {
  label: string;
  field: string;
  pattern: string;
}

interface ViewGroup {
  label: string;
  field: string;
  pattern?: string;
}

export interface CmsCollection {
  name: string;
  label: string;
  label_singular?: string;
  description?: string;
  folder?: string;
  files?: CmsCollectionFile[];
  identifier_field?: string;
  summary?: string;
  slug?: string;
  preview_path?: string;
  preview_path_date_field?: string;
  create?: boolean;
  delete?: boolean;
  hide?: boolean;
  editor?: {
    preview?: boolean;
  };
  publish?: boolean;
  nested?: {
    depth: number;
  };
  meta?: { path?: { label: string; widget: string; index_file: string } };

  /**
   * It accepts the following values: yml, yaml, toml, json, md, markdown, html
   *
   * You may also specify a custom extension not included in the list above, by specifying the format value.
   */
  extension?: string;
  format?: CmsCollectionFormatType;

  frontmatter_delimiter?: string[] | string;
  fields?: CmsField[];
  filter?: { field: string; value: any };
  path?: string;
  media_folder?: string;
  public_folder?: string;
  sortable_fields?: string[];
  view_filters?: ViewFilter[];
  view_groups?: ViewGroup[];
  i18n?: boolean | CmsI18nConfig;

  /**
   * @deprecated Use sortable_fields instead
   */
  sortableFields?: string[];
}

interface CmsBackend {
  name: CmsBackendType;
  auth_scope?: CmsAuthScope;
  open_authoring?: boolean;
  always_fork?: boolean;
  repo?: string;
  branch?: string;
  api_root?: string;
  site_domain?: string;
  base_url?: string;
  auth_endpoint?: string;
  app_id?: string;
  auth_type?: "implicit" | "pkce";
  cms_label_prefix?: string;
  squash_merges?: boolean;
  proxy_url?: string;
  commit_messages?: {
    create?: string;
    update?: string;
    delete?: string;
    uploadMedia?: string;
    deleteMedia?: string;
    openAuthoring?: string;
  };
}

interface CmsSlug {
  encoding?: CmsSlugEncoding;
  clean_accents?: boolean;
  sanitize_replacement?: string;
}

interface CmsLocalBackend {
  url?: string;
  allowed_hosts?: string[];
}

export interface CmsConfig {
  backend: CmsBackend;
  collections: CmsCollection[];
  locale?: string;
  site_url?: string;
  display_url?: string;
  logo_url?: string;
  show_preview_links?: boolean;
  media_folder?: string;
  public_folder?: string;
  media_folder_relative?: boolean;
  media_library?: CmsMediaLibrary;
  publish_mode?: CmsPublishMode;
  load_config_file?: boolean;
  integrations?: {
    hooks: string[];
    provider: string;
    collections?: "*" | string[];
    applicationID?: string;
    apiKey?: string;
    getSignedFormURL?: string;
  }[];
  slug?: CmsSlug;
  i18n?: CmsI18nConfig;
  local_backend?: boolean | CmsLocalBackend;
  editor?: {
    preview?: boolean;
  };
}

type CmsMediaLibraryOptions = any; // TODO: type properly

interface CmsMediaLibrary {
  name: string;
  config?: CmsMediaLibraryOptions;
}
