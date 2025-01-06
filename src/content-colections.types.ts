import {
  AnyZodObject,
  ZodDiscriminatedUnion,
  ZodEffects,
  ZodIntersection,
  ZodLiteral,
  ZodNumber,
  ZodObject,
  ZodString,
  ZodUnion,
} from "astro/zod";
import { Loader } from "astro/loaders";

export type ImageFunction = () => ZodObject<{
  src: ZodString;
  width: ZodNumber;
  height: ZodNumber;
  format: ZodUnion<
    [
      ZodLiteral<"png">,
      ZodLiteral<"jpg">,
      ZodLiteral<"jpeg">,
      ZodLiteral<"tiff">,
      ZodLiteral<"webp">,
      ZodLiteral<"gif">,
      ZodLiteral<"svg">,
      ZodLiteral<"avif">
    ]
  >;
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

type BaseSchemaWithoutEffects =
  | AnyZodObject
  | ZodUnion<
      [BaseSchemaWithoutEffectsHelper, ...BaseSchemaWithoutEffectsHelper[]]
    >
  | ZodDiscriminatedUnion<string, AnyZodObject[]>
  | ZodIntersection<
      BaseSchemaWithoutEffectsHelper,
      BaseSchemaWithoutEffectsHelper
    >;

type BaseSchemaWithoutEffectsHelper = AnyZodObject | BaseSchemaWithoutEffects;

export type BaseSchema =
  | BaseSchemaWithoutEffects
  | ZodEffects<BaseSchemaWithoutEffects>;

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
