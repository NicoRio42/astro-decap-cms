import type { ZodType } from "astro/zod";
import type { Loader } from "astro/loaders";

export type ImageFunction = () => ZodType<{
  src: string;
  width: number;
  height: number;
  format:
    | "png"
    | "jpg"
    | "jpeg"
    | "tiff"
    | "webp"
    | "gif"
    | "svg"
    | "avif"
    | "apng";
}>;

export interface DataEntry {
  id: string;
  data: Record<string, unknown>;
  filePath?: string;
  body?: string;
}

export interface DataStore {
  get: (key: string) => DataEntry;
  entries: () => Array<[id: string, DataEntry]>;
  set: (
    key: string,
    data: Record<string, unknown>,
    body?: string,
    filePath?: string
  ) => void;
  values: () => Array<DataEntry>;
  keys: () => Array<string>;
  delete: (key: string) => void;
  clear: () => void;
  has: (key: string) => boolean;
}

export interface MetaStore {
  get: (key: string) => string | undefined;
  set: (key: string, value: string) => void;
  delete: (key: string) => void;
  has: (key: string) => boolean;
}

export type BaseSchema = ZodType;

export type SchemaContext = { image: ImageFunction };

type ContentLayerConfig<
  S extends BaseSchema,
  TData extends { id: string } = { id: string }
> = {
  type?: "content_layer";
  schema?: S | ((context: SchemaContext) => S);
  loader:
    | Loader
    | (() =>
        | Array<TData>
        | Promise<Array<TData>>
        | Record<string, Omit<TData, "id"> & { id?: string }>
        | Promise<Record<string, Omit<TData, "id"> & { id?: string }>>);
};

type DataCollectionConfig<S extends BaseSchema> = {
  type: "data";
  schema?: S | ((context: SchemaContext) => S);
};

type ContentCollectionConfig<S extends BaseSchema> = {
  type?: "content";
  schema?: S | ((context: SchemaContext) => S);
  loader?: never;
};

export type CollectionConfig<S extends BaseSchema> =
  | ContentCollectionConfig<S>
  | DataCollectionConfig<S>
  | ContentLayerConfig<S>;

export type defineCollection = <S extends BaseSchema>(
  input: CollectionConfig<S>
) => CollectionConfig<S>;
