
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Lead
 * 
 */
export type Lead = $Result.DefaultSelection<Prisma.$LeadPayload>
/**
 * Model PropertyInterest
 * 
 */
export type PropertyInterest = $Result.DefaultSelection<Prisma.$PropertyInterestPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Leads
 * const leads = await prisma.lead.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Leads
   * const leads = await prisma.lead.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.lead`: Exposes CRUD operations for the **Lead** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Leads
    * const leads = await prisma.lead.findMany()
    * ```
    */
  get lead(): Prisma.LeadDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.propertyInterest`: Exposes CRUD operations for the **PropertyInterest** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PropertyInterests
    * const propertyInterests = await prisma.propertyInterest.findMany()
    * ```
    */
  get propertyInterest(): Prisma.PropertyInterestDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.6.0
   * Query Engine version: f676762280b54cd07c770017ed3711ddde35f37a
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Lead: 'Lead',
    PropertyInterest: 'PropertyInterest'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "lead" | "propertyInterest"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Lead: {
        payload: Prisma.$LeadPayload<ExtArgs>
        fields: Prisma.LeadFieldRefs
        operations: {
          findUnique: {
            args: Prisma.LeadFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeadPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.LeadFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeadPayload>
          }
          findFirst: {
            args: Prisma.LeadFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeadPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.LeadFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeadPayload>
          }
          findMany: {
            args: Prisma.LeadFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeadPayload>[]
          }
          create: {
            args: Prisma.LeadCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeadPayload>
          }
          createMany: {
            args: Prisma.LeadCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.LeadCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeadPayload>[]
          }
          delete: {
            args: Prisma.LeadDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeadPayload>
          }
          update: {
            args: Prisma.LeadUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeadPayload>
          }
          deleteMany: {
            args: Prisma.LeadDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.LeadUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.LeadUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeadPayload>[]
          }
          upsert: {
            args: Prisma.LeadUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeadPayload>
          }
          aggregate: {
            args: Prisma.LeadAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateLead>
          }
          groupBy: {
            args: Prisma.LeadGroupByArgs<ExtArgs>
            result: $Utils.Optional<LeadGroupByOutputType>[]
          }
          count: {
            args: Prisma.LeadCountArgs<ExtArgs>
            result: $Utils.Optional<LeadCountAggregateOutputType> | number
          }
        }
      }
      PropertyInterest: {
        payload: Prisma.$PropertyInterestPayload<ExtArgs>
        fields: Prisma.PropertyInterestFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PropertyInterestFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PropertyInterestPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PropertyInterestFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PropertyInterestPayload>
          }
          findFirst: {
            args: Prisma.PropertyInterestFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PropertyInterestPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PropertyInterestFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PropertyInterestPayload>
          }
          findMany: {
            args: Prisma.PropertyInterestFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PropertyInterestPayload>[]
          }
          create: {
            args: Prisma.PropertyInterestCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PropertyInterestPayload>
          }
          createMany: {
            args: Prisma.PropertyInterestCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PropertyInterestCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PropertyInterestPayload>[]
          }
          delete: {
            args: Prisma.PropertyInterestDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PropertyInterestPayload>
          }
          update: {
            args: Prisma.PropertyInterestUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PropertyInterestPayload>
          }
          deleteMany: {
            args: Prisma.PropertyInterestDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PropertyInterestUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.PropertyInterestUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PropertyInterestPayload>[]
          }
          upsert: {
            args: Prisma.PropertyInterestUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PropertyInterestPayload>
          }
          aggregate: {
            args: Prisma.PropertyInterestAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePropertyInterest>
          }
          groupBy: {
            args: Prisma.PropertyInterestGroupByArgs<ExtArgs>
            result: $Utils.Optional<PropertyInterestGroupByOutputType>[]
          }
          count: {
            args: Prisma.PropertyInterestCountArgs<ExtArgs>
            result: $Utils.Optional<PropertyInterestCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    lead?: LeadOmit
    propertyInterest?: PropertyInterestOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type LeadCountOutputType
   */

  export type LeadCountOutputType = {
    propertyInterests: number
  }

  export type LeadCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    propertyInterests?: boolean | LeadCountOutputTypeCountPropertyInterestsArgs
  }

  // Custom InputTypes
  /**
   * LeadCountOutputType without action
   */
  export type LeadCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LeadCountOutputType
     */
    select?: LeadCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * LeadCountOutputType without action
   */
  export type LeadCountOutputTypeCountPropertyInterestsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PropertyInterestWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Lead
   */

  export type AggregateLead = {
    _count: LeadCountAggregateOutputType | null
    _avg: LeadAvgAggregateOutputType | null
    _sum: LeadSumAggregateOutputType | null
    _min: LeadMinAggregateOutputType | null
    _max: LeadMaxAggregateOutputType | null
  }

  export type LeadAvgAggregateOutputType = {
    routeStopOrder: number | null
  }

  export type LeadSumAggregateOutputType = {
    routeStopOrder: number | null
  }

  export type LeadMinAggregateOutputType = {
    id: string | null
    userId: string | null
    fullName: string | null
    phone: string | null
    email: string | null
    propertyAddress: string | null
    desiredMoveInDate: string | null
    notes: string | null
    status: string | null
    priority: string | null
    source: string | null
    nextFollowUpDate: string | null
    showingDate: string | null
    showingTime: string | null
    routeStopOrder: number | null
    routeCompleted: boolean | null
    routeNote: string | null
    agentNotes: string | null
    createdAt: string | null
    updatedAt: string | null
  }

  export type LeadMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    fullName: string | null
    phone: string | null
    email: string | null
    propertyAddress: string | null
    desiredMoveInDate: string | null
    notes: string | null
    status: string | null
    priority: string | null
    source: string | null
    nextFollowUpDate: string | null
    showingDate: string | null
    showingTime: string | null
    routeStopOrder: number | null
    routeCompleted: boolean | null
    routeNote: string | null
    agentNotes: string | null
    createdAt: string | null
    updatedAt: string | null
  }

  export type LeadCountAggregateOutputType = {
    id: number
    userId: number
    fullName: number
    phone: number
    email: number
    propertyAddress: number
    desiredMoveInDate: number
    notes: number
    status: number
    priority: number
    source: number
    nextFollowUpDate: number
    showingDate: number
    showingTime: number
    routeStopOrder: number
    routeCompleted: number
    routeNote: number
    agentNotes: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type LeadAvgAggregateInputType = {
    routeStopOrder?: true
  }

  export type LeadSumAggregateInputType = {
    routeStopOrder?: true
  }

  export type LeadMinAggregateInputType = {
    id?: true
    userId?: true
    fullName?: true
    phone?: true
    email?: true
    propertyAddress?: true
    desiredMoveInDate?: true
    notes?: true
    status?: true
    priority?: true
    source?: true
    nextFollowUpDate?: true
    showingDate?: true
    showingTime?: true
    routeStopOrder?: true
    routeCompleted?: true
    routeNote?: true
    agentNotes?: true
    createdAt?: true
    updatedAt?: true
  }

  export type LeadMaxAggregateInputType = {
    id?: true
    userId?: true
    fullName?: true
    phone?: true
    email?: true
    propertyAddress?: true
    desiredMoveInDate?: true
    notes?: true
    status?: true
    priority?: true
    source?: true
    nextFollowUpDate?: true
    showingDate?: true
    showingTime?: true
    routeStopOrder?: true
    routeCompleted?: true
    routeNote?: true
    agentNotes?: true
    createdAt?: true
    updatedAt?: true
  }

  export type LeadCountAggregateInputType = {
    id?: true
    userId?: true
    fullName?: true
    phone?: true
    email?: true
    propertyAddress?: true
    desiredMoveInDate?: true
    notes?: true
    status?: true
    priority?: true
    source?: true
    nextFollowUpDate?: true
    showingDate?: true
    showingTime?: true
    routeStopOrder?: true
    routeCompleted?: true
    routeNote?: true
    agentNotes?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type LeadAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Lead to aggregate.
     */
    where?: LeadWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Leads to fetch.
     */
    orderBy?: LeadOrderByWithRelationInput | LeadOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: LeadWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Leads from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Leads.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Leads
    **/
    _count?: true | LeadCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: LeadAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: LeadSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: LeadMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: LeadMaxAggregateInputType
  }

  export type GetLeadAggregateType<T extends LeadAggregateArgs> = {
        [P in keyof T & keyof AggregateLead]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateLead[P]>
      : GetScalarType<T[P], AggregateLead[P]>
  }




  export type LeadGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: LeadWhereInput
    orderBy?: LeadOrderByWithAggregationInput | LeadOrderByWithAggregationInput[]
    by: LeadScalarFieldEnum[] | LeadScalarFieldEnum
    having?: LeadScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: LeadCountAggregateInputType | true
    _avg?: LeadAvgAggregateInputType
    _sum?: LeadSumAggregateInputType
    _min?: LeadMinAggregateInputType
    _max?: LeadMaxAggregateInputType
  }

  export type LeadGroupByOutputType = {
    id: string
    userId: string
    fullName: string
    phone: string
    email: string
    propertyAddress: string
    desiredMoveInDate: string
    notes: string
    status: string
    priority: string
    source: string
    nextFollowUpDate: string
    showingDate: string
    showingTime: string
    routeStopOrder: number
    routeCompleted: boolean
    routeNote: string
    agentNotes: string
    createdAt: string
    updatedAt: string
    _count: LeadCountAggregateOutputType | null
    _avg: LeadAvgAggregateOutputType | null
    _sum: LeadSumAggregateOutputType | null
    _min: LeadMinAggregateOutputType | null
    _max: LeadMaxAggregateOutputType | null
  }

  type GetLeadGroupByPayload<T extends LeadGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<LeadGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof LeadGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], LeadGroupByOutputType[P]>
            : GetScalarType<T[P], LeadGroupByOutputType[P]>
        }
      >
    >


  export type LeadSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    fullName?: boolean
    phone?: boolean
    email?: boolean
    propertyAddress?: boolean
    desiredMoveInDate?: boolean
    notes?: boolean
    status?: boolean
    priority?: boolean
    source?: boolean
    nextFollowUpDate?: boolean
    showingDate?: boolean
    showingTime?: boolean
    routeStopOrder?: boolean
    routeCompleted?: boolean
    routeNote?: boolean
    agentNotes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    propertyInterests?: boolean | Lead$propertyInterestsArgs<ExtArgs>
    _count?: boolean | LeadCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["lead"]>

  export type LeadSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    fullName?: boolean
    phone?: boolean
    email?: boolean
    propertyAddress?: boolean
    desiredMoveInDate?: boolean
    notes?: boolean
    status?: boolean
    priority?: boolean
    source?: boolean
    nextFollowUpDate?: boolean
    showingDate?: boolean
    showingTime?: boolean
    routeStopOrder?: boolean
    routeCompleted?: boolean
    routeNote?: boolean
    agentNotes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["lead"]>

  export type LeadSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    fullName?: boolean
    phone?: boolean
    email?: boolean
    propertyAddress?: boolean
    desiredMoveInDate?: boolean
    notes?: boolean
    status?: boolean
    priority?: boolean
    source?: boolean
    nextFollowUpDate?: boolean
    showingDate?: boolean
    showingTime?: boolean
    routeStopOrder?: boolean
    routeCompleted?: boolean
    routeNote?: boolean
    agentNotes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["lead"]>

  export type LeadSelectScalar = {
    id?: boolean
    userId?: boolean
    fullName?: boolean
    phone?: boolean
    email?: boolean
    propertyAddress?: boolean
    desiredMoveInDate?: boolean
    notes?: boolean
    status?: boolean
    priority?: boolean
    source?: boolean
    nextFollowUpDate?: boolean
    showingDate?: boolean
    showingTime?: boolean
    routeStopOrder?: boolean
    routeCompleted?: boolean
    routeNote?: boolean
    agentNotes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type LeadOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "fullName" | "phone" | "email" | "propertyAddress" | "desiredMoveInDate" | "notes" | "status" | "priority" | "source" | "nextFollowUpDate" | "showingDate" | "showingTime" | "routeStopOrder" | "routeCompleted" | "routeNote" | "agentNotes" | "createdAt" | "updatedAt", ExtArgs["result"]["lead"]>
  export type LeadInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    propertyInterests?: boolean | Lead$propertyInterestsArgs<ExtArgs>
    _count?: boolean | LeadCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type LeadIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type LeadIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $LeadPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Lead"
    objects: {
      propertyInterests: Prisma.$PropertyInterestPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      fullName: string
      phone: string
      email: string
      propertyAddress: string
      desiredMoveInDate: string
      notes: string
      status: string
      priority: string
      source: string
      nextFollowUpDate: string
      showingDate: string
      showingTime: string
      routeStopOrder: number
      routeCompleted: boolean
      routeNote: string
      agentNotes: string
      createdAt: string
      updatedAt: string
    }, ExtArgs["result"]["lead"]>
    composites: {}
  }

  type LeadGetPayload<S extends boolean | null | undefined | LeadDefaultArgs> = $Result.GetResult<Prisma.$LeadPayload, S>

  type LeadCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<LeadFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: LeadCountAggregateInputType | true
    }

  export interface LeadDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Lead'], meta: { name: 'Lead' } }
    /**
     * Find zero or one Lead that matches the filter.
     * @param {LeadFindUniqueArgs} args - Arguments to find a Lead
     * @example
     * // Get one Lead
     * const lead = await prisma.lead.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends LeadFindUniqueArgs>(args: SelectSubset<T, LeadFindUniqueArgs<ExtArgs>>): Prisma__LeadClient<$Result.GetResult<Prisma.$LeadPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Lead that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {LeadFindUniqueOrThrowArgs} args - Arguments to find a Lead
     * @example
     * // Get one Lead
     * const lead = await prisma.lead.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends LeadFindUniqueOrThrowArgs>(args: SelectSubset<T, LeadFindUniqueOrThrowArgs<ExtArgs>>): Prisma__LeadClient<$Result.GetResult<Prisma.$LeadPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Lead that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LeadFindFirstArgs} args - Arguments to find a Lead
     * @example
     * // Get one Lead
     * const lead = await prisma.lead.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends LeadFindFirstArgs>(args?: SelectSubset<T, LeadFindFirstArgs<ExtArgs>>): Prisma__LeadClient<$Result.GetResult<Prisma.$LeadPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Lead that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LeadFindFirstOrThrowArgs} args - Arguments to find a Lead
     * @example
     * // Get one Lead
     * const lead = await prisma.lead.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends LeadFindFirstOrThrowArgs>(args?: SelectSubset<T, LeadFindFirstOrThrowArgs<ExtArgs>>): Prisma__LeadClient<$Result.GetResult<Prisma.$LeadPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Leads that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LeadFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Leads
     * const leads = await prisma.lead.findMany()
     * 
     * // Get first 10 Leads
     * const leads = await prisma.lead.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const leadWithIdOnly = await prisma.lead.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends LeadFindManyArgs>(args?: SelectSubset<T, LeadFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LeadPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Lead.
     * @param {LeadCreateArgs} args - Arguments to create a Lead.
     * @example
     * // Create one Lead
     * const Lead = await prisma.lead.create({
     *   data: {
     *     // ... data to create a Lead
     *   }
     * })
     * 
     */
    create<T extends LeadCreateArgs>(args: SelectSubset<T, LeadCreateArgs<ExtArgs>>): Prisma__LeadClient<$Result.GetResult<Prisma.$LeadPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Leads.
     * @param {LeadCreateManyArgs} args - Arguments to create many Leads.
     * @example
     * // Create many Leads
     * const lead = await prisma.lead.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends LeadCreateManyArgs>(args?: SelectSubset<T, LeadCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Leads and returns the data saved in the database.
     * @param {LeadCreateManyAndReturnArgs} args - Arguments to create many Leads.
     * @example
     * // Create many Leads
     * const lead = await prisma.lead.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Leads and only return the `id`
     * const leadWithIdOnly = await prisma.lead.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends LeadCreateManyAndReturnArgs>(args?: SelectSubset<T, LeadCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LeadPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Lead.
     * @param {LeadDeleteArgs} args - Arguments to delete one Lead.
     * @example
     * // Delete one Lead
     * const Lead = await prisma.lead.delete({
     *   where: {
     *     // ... filter to delete one Lead
     *   }
     * })
     * 
     */
    delete<T extends LeadDeleteArgs>(args: SelectSubset<T, LeadDeleteArgs<ExtArgs>>): Prisma__LeadClient<$Result.GetResult<Prisma.$LeadPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Lead.
     * @param {LeadUpdateArgs} args - Arguments to update one Lead.
     * @example
     * // Update one Lead
     * const lead = await prisma.lead.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends LeadUpdateArgs>(args: SelectSubset<T, LeadUpdateArgs<ExtArgs>>): Prisma__LeadClient<$Result.GetResult<Prisma.$LeadPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Leads.
     * @param {LeadDeleteManyArgs} args - Arguments to filter Leads to delete.
     * @example
     * // Delete a few Leads
     * const { count } = await prisma.lead.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends LeadDeleteManyArgs>(args?: SelectSubset<T, LeadDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Leads.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LeadUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Leads
     * const lead = await prisma.lead.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends LeadUpdateManyArgs>(args: SelectSubset<T, LeadUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Leads and returns the data updated in the database.
     * @param {LeadUpdateManyAndReturnArgs} args - Arguments to update many Leads.
     * @example
     * // Update many Leads
     * const lead = await prisma.lead.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Leads and only return the `id`
     * const leadWithIdOnly = await prisma.lead.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends LeadUpdateManyAndReturnArgs>(args: SelectSubset<T, LeadUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LeadPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Lead.
     * @param {LeadUpsertArgs} args - Arguments to update or create a Lead.
     * @example
     * // Update or create a Lead
     * const lead = await prisma.lead.upsert({
     *   create: {
     *     // ... data to create a Lead
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Lead we want to update
     *   }
     * })
     */
    upsert<T extends LeadUpsertArgs>(args: SelectSubset<T, LeadUpsertArgs<ExtArgs>>): Prisma__LeadClient<$Result.GetResult<Prisma.$LeadPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Leads.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LeadCountArgs} args - Arguments to filter Leads to count.
     * @example
     * // Count the number of Leads
     * const count = await prisma.lead.count({
     *   where: {
     *     // ... the filter for the Leads we want to count
     *   }
     * })
    **/
    count<T extends LeadCountArgs>(
      args?: Subset<T, LeadCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], LeadCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Lead.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LeadAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends LeadAggregateArgs>(args: Subset<T, LeadAggregateArgs>): Prisma.PrismaPromise<GetLeadAggregateType<T>>

    /**
     * Group by Lead.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LeadGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends LeadGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: LeadGroupByArgs['orderBy'] }
        : { orderBy?: LeadGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, LeadGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetLeadGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Lead model
   */
  readonly fields: LeadFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Lead.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__LeadClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    propertyInterests<T extends Lead$propertyInterestsArgs<ExtArgs> = {}>(args?: Subset<T, Lead$propertyInterestsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PropertyInterestPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Lead model
   */
  interface LeadFieldRefs {
    readonly id: FieldRef<"Lead", 'String'>
    readonly userId: FieldRef<"Lead", 'String'>
    readonly fullName: FieldRef<"Lead", 'String'>
    readonly phone: FieldRef<"Lead", 'String'>
    readonly email: FieldRef<"Lead", 'String'>
    readonly propertyAddress: FieldRef<"Lead", 'String'>
    readonly desiredMoveInDate: FieldRef<"Lead", 'String'>
    readonly notes: FieldRef<"Lead", 'String'>
    readonly status: FieldRef<"Lead", 'String'>
    readonly priority: FieldRef<"Lead", 'String'>
    readonly source: FieldRef<"Lead", 'String'>
    readonly nextFollowUpDate: FieldRef<"Lead", 'String'>
    readonly showingDate: FieldRef<"Lead", 'String'>
    readonly showingTime: FieldRef<"Lead", 'String'>
    readonly routeStopOrder: FieldRef<"Lead", 'Int'>
    readonly routeCompleted: FieldRef<"Lead", 'Boolean'>
    readonly routeNote: FieldRef<"Lead", 'String'>
    readonly agentNotes: FieldRef<"Lead", 'String'>
    readonly createdAt: FieldRef<"Lead", 'String'>
    readonly updatedAt: FieldRef<"Lead", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Lead findUnique
   */
  export type LeadFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Lead
     */
    select?: LeadSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Lead
     */
    omit?: LeadOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LeadInclude<ExtArgs> | null
    /**
     * Filter, which Lead to fetch.
     */
    where: LeadWhereUniqueInput
  }

  /**
   * Lead findUniqueOrThrow
   */
  export type LeadFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Lead
     */
    select?: LeadSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Lead
     */
    omit?: LeadOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LeadInclude<ExtArgs> | null
    /**
     * Filter, which Lead to fetch.
     */
    where: LeadWhereUniqueInput
  }

  /**
   * Lead findFirst
   */
  export type LeadFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Lead
     */
    select?: LeadSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Lead
     */
    omit?: LeadOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LeadInclude<ExtArgs> | null
    /**
     * Filter, which Lead to fetch.
     */
    where?: LeadWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Leads to fetch.
     */
    orderBy?: LeadOrderByWithRelationInput | LeadOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Leads.
     */
    cursor?: LeadWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Leads from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Leads.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Leads.
     */
    distinct?: LeadScalarFieldEnum | LeadScalarFieldEnum[]
  }

  /**
   * Lead findFirstOrThrow
   */
  export type LeadFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Lead
     */
    select?: LeadSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Lead
     */
    omit?: LeadOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LeadInclude<ExtArgs> | null
    /**
     * Filter, which Lead to fetch.
     */
    where?: LeadWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Leads to fetch.
     */
    orderBy?: LeadOrderByWithRelationInput | LeadOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Leads.
     */
    cursor?: LeadWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Leads from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Leads.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Leads.
     */
    distinct?: LeadScalarFieldEnum | LeadScalarFieldEnum[]
  }

  /**
   * Lead findMany
   */
  export type LeadFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Lead
     */
    select?: LeadSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Lead
     */
    omit?: LeadOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LeadInclude<ExtArgs> | null
    /**
     * Filter, which Leads to fetch.
     */
    where?: LeadWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Leads to fetch.
     */
    orderBy?: LeadOrderByWithRelationInput | LeadOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Leads.
     */
    cursor?: LeadWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Leads from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Leads.
     */
    skip?: number
    distinct?: LeadScalarFieldEnum | LeadScalarFieldEnum[]
  }

  /**
   * Lead create
   */
  export type LeadCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Lead
     */
    select?: LeadSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Lead
     */
    omit?: LeadOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LeadInclude<ExtArgs> | null
    /**
     * The data needed to create a Lead.
     */
    data: XOR<LeadCreateInput, LeadUncheckedCreateInput>
  }

  /**
   * Lead createMany
   */
  export type LeadCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Leads.
     */
    data: LeadCreateManyInput | LeadCreateManyInput[]
  }

  /**
   * Lead createManyAndReturn
   */
  export type LeadCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Lead
     */
    select?: LeadSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Lead
     */
    omit?: LeadOmit<ExtArgs> | null
    /**
     * The data used to create many Leads.
     */
    data: LeadCreateManyInput | LeadCreateManyInput[]
  }

  /**
   * Lead update
   */
  export type LeadUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Lead
     */
    select?: LeadSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Lead
     */
    omit?: LeadOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LeadInclude<ExtArgs> | null
    /**
     * The data needed to update a Lead.
     */
    data: XOR<LeadUpdateInput, LeadUncheckedUpdateInput>
    /**
     * Choose, which Lead to update.
     */
    where: LeadWhereUniqueInput
  }

  /**
   * Lead updateMany
   */
  export type LeadUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Leads.
     */
    data: XOR<LeadUpdateManyMutationInput, LeadUncheckedUpdateManyInput>
    /**
     * Filter which Leads to update
     */
    where?: LeadWhereInput
    /**
     * Limit how many Leads to update.
     */
    limit?: number
  }

  /**
   * Lead updateManyAndReturn
   */
  export type LeadUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Lead
     */
    select?: LeadSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Lead
     */
    omit?: LeadOmit<ExtArgs> | null
    /**
     * The data used to update Leads.
     */
    data: XOR<LeadUpdateManyMutationInput, LeadUncheckedUpdateManyInput>
    /**
     * Filter which Leads to update
     */
    where?: LeadWhereInput
    /**
     * Limit how many Leads to update.
     */
    limit?: number
  }

  /**
   * Lead upsert
   */
  export type LeadUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Lead
     */
    select?: LeadSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Lead
     */
    omit?: LeadOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LeadInclude<ExtArgs> | null
    /**
     * The filter to search for the Lead to update in case it exists.
     */
    where: LeadWhereUniqueInput
    /**
     * In case the Lead found by the `where` argument doesn't exist, create a new Lead with this data.
     */
    create: XOR<LeadCreateInput, LeadUncheckedCreateInput>
    /**
     * In case the Lead was found with the provided `where` argument, update it with this data.
     */
    update: XOR<LeadUpdateInput, LeadUncheckedUpdateInput>
  }

  /**
   * Lead delete
   */
  export type LeadDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Lead
     */
    select?: LeadSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Lead
     */
    omit?: LeadOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LeadInclude<ExtArgs> | null
    /**
     * Filter which Lead to delete.
     */
    where: LeadWhereUniqueInput
  }

  /**
   * Lead deleteMany
   */
  export type LeadDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Leads to delete
     */
    where?: LeadWhereInput
    /**
     * Limit how many Leads to delete.
     */
    limit?: number
  }

  /**
   * Lead.propertyInterests
   */
  export type Lead$propertyInterestsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PropertyInterest
     */
    select?: PropertyInterestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PropertyInterest
     */
    omit?: PropertyInterestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PropertyInterestInclude<ExtArgs> | null
    where?: PropertyInterestWhereInput
    orderBy?: PropertyInterestOrderByWithRelationInput | PropertyInterestOrderByWithRelationInput[]
    cursor?: PropertyInterestWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PropertyInterestScalarFieldEnum | PropertyInterestScalarFieldEnum[]
  }

  /**
   * Lead without action
   */
  export type LeadDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Lead
     */
    select?: LeadSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Lead
     */
    omit?: LeadOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LeadInclude<ExtArgs> | null
  }


  /**
   * Model PropertyInterest
   */

  export type AggregatePropertyInterest = {
    _count: PropertyInterestCountAggregateOutputType | null
    _avg: PropertyInterestAvgAggregateOutputType | null
    _sum: PropertyInterestSumAggregateOutputType | null
    _min: PropertyInterestMinAggregateOutputType | null
    _max: PropertyInterestMaxAggregateOutputType | null
  }

  export type PropertyInterestAvgAggregateOutputType = {
    rating: number | null
  }

  export type PropertyInterestSumAggregateOutputType = {
    rating: number | null
  }

  export type PropertyInterestMinAggregateOutputType = {
    id: string | null
    leadId: string | null
    address: string | null
    listingTitle: string | null
    source: string | null
    listingUrl: string | null
    rent: string | null
    beds: string | null
    baths: string | null
    neighborhood: string | null
    status: string | null
    rating: number | null
    clientFeedback: string | null
    pros: string | null
    cons: string | null
    agentNotes: string | null
    showingDate: string | null
    showingTime: string | null
    createdAt: string | null
    updatedAt: string | null
  }

  export type PropertyInterestMaxAggregateOutputType = {
    id: string | null
    leadId: string | null
    address: string | null
    listingTitle: string | null
    source: string | null
    listingUrl: string | null
    rent: string | null
    beds: string | null
    baths: string | null
    neighborhood: string | null
    status: string | null
    rating: number | null
    clientFeedback: string | null
    pros: string | null
    cons: string | null
    agentNotes: string | null
    showingDate: string | null
    showingTime: string | null
    createdAt: string | null
    updatedAt: string | null
  }

  export type PropertyInterestCountAggregateOutputType = {
    id: number
    leadId: number
    address: number
    listingTitle: number
    source: number
    listingUrl: number
    rent: number
    beds: number
    baths: number
    neighborhood: number
    status: number
    rating: number
    clientFeedback: number
    pros: number
    cons: number
    agentNotes: number
    showingDate: number
    showingTime: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type PropertyInterestAvgAggregateInputType = {
    rating?: true
  }

  export type PropertyInterestSumAggregateInputType = {
    rating?: true
  }

  export type PropertyInterestMinAggregateInputType = {
    id?: true
    leadId?: true
    address?: true
    listingTitle?: true
    source?: true
    listingUrl?: true
    rent?: true
    beds?: true
    baths?: true
    neighborhood?: true
    status?: true
    rating?: true
    clientFeedback?: true
    pros?: true
    cons?: true
    agentNotes?: true
    showingDate?: true
    showingTime?: true
    createdAt?: true
    updatedAt?: true
  }

  export type PropertyInterestMaxAggregateInputType = {
    id?: true
    leadId?: true
    address?: true
    listingTitle?: true
    source?: true
    listingUrl?: true
    rent?: true
    beds?: true
    baths?: true
    neighborhood?: true
    status?: true
    rating?: true
    clientFeedback?: true
    pros?: true
    cons?: true
    agentNotes?: true
    showingDate?: true
    showingTime?: true
    createdAt?: true
    updatedAt?: true
  }

  export type PropertyInterestCountAggregateInputType = {
    id?: true
    leadId?: true
    address?: true
    listingTitle?: true
    source?: true
    listingUrl?: true
    rent?: true
    beds?: true
    baths?: true
    neighborhood?: true
    status?: true
    rating?: true
    clientFeedback?: true
    pros?: true
    cons?: true
    agentNotes?: true
    showingDate?: true
    showingTime?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type PropertyInterestAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PropertyInterest to aggregate.
     */
    where?: PropertyInterestWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PropertyInterests to fetch.
     */
    orderBy?: PropertyInterestOrderByWithRelationInput | PropertyInterestOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PropertyInterestWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PropertyInterests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PropertyInterests.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PropertyInterests
    **/
    _count?: true | PropertyInterestCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PropertyInterestAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PropertyInterestSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PropertyInterestMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PropertyInterestMaxAggregateInputType
  }

  export type GetPropertyInterestAggregateType<T extends PropertyInterestAggregateArgs> = {
        [P in keyof T & keyof AggregatePropertyInterest]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePropertyInterest[P]>
      : GetScalarType<T[P], AggregatePropertyInterest[P]>
  }




  export type PropertyInterestGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PropertyInterestWhereInput
    orderBy?: PropertyInterestOrderByWithAggregationInput | PropertyInterestOrderByWithAggregationInput[]
    by: PropertyInterestScalarFieldEnum[] | PropertyInterestScalarFieldEnum
    having?: PropertyInterestScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PropertyInterestCountAggregateInputType | true
    _avg?: PropertyInterestAvgAggregateInputType
    _sum?: PropertyInterestSumAggregateInputType
    _min?: PropertyInterestMinAggregateInputType
    _max?: PropertyInterestMaxAggregateInputType
  }

  export type PropertyInterestGroupByOutputType = {
    id: string
    leadId: string
    address: string
    listingTitle: string
    source: string
    listingUrl: string
    rent: string
    beds: string
    baths: string
    neighborhood: string
    status: string
    rating: number
    clientFeedback: string
    pros: string
    cons: string
    agentNotes: string
    showingDate: string
    showingTime: string
    createdAt: string
    updatedAt: string
    _count: PropertyInterestCountAggregateOutputType | null
    _avg: PropertyInterestAvgAggregateOutputType | null
    _sum: PropertyInterestSumAggregateOutputType | null
    _min: PropertyInterestMinAggregateOutputType | null
    _max: PropertyInterestMaxAggregateOutputType | null
  }

  type GetPropertyInterestGroupByPayload<T extends PropertyInterestGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PropertyInterestGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PropertyInterestGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PropertyInterestGroupByOutputType[P]>
            : GetScalarType<T[P], PropertyInterestGroupByOutputType[P]>
        }
      >
    >


  export type PropertyInterestSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    leadId?: boolean
    address?: boolean
    listingTitle?: boolean
    source?: boolean
    listingUrl?: boolean
    rent?: boolean
    beds?: boolean
    baths?: boolean
    neighborhood?: boolean
    status?: boolean
    rating?: boolean
    clientFeedback?: boolean
    pros?: boolean
    cons?: boolean
    agentNotes?: boolean
    showingDate?: boolean
    showingTime?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    lead?: boolean | LeadDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["propertyInterest"]>

  export type PropertyInterestSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    leadId?: boolean
    address?: boolean
    listingTitle?: boolean
    source?: boolean
    listingUrl?: boolean
    rent?: boolean
    beds?: boolean
    baths?: boolean
    neighborhood?: boolean
    status?: boolean
    rating?: boolean
    clientFeedback?: boolean
    pros?: boolean
    cons?: boolean
    agentNotes?: boolean
    showingDate?: boolean
    showingTime?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    lead?: boolean | LeadDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["propertyInterest"]>

  export type PropertyInterestSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    leadId?: boolean
    address?: boolean
    listingTitle?: boolean
    source?: boolean
    listingUrl?: boolean
    rent?: boolean
    beds?: boolean
    baths?: boolean
    neighborhood?: boolean
    status?: boolean
    rating?: boolean
    clientFeedback?: boolean
    pros?: boolean
    cons?: boolean
    agentNotes?: boolean
    showingDate?: boolean
    showingTime?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    lead?: boolean | LeadDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["propertyInterest"]>

  export type PropertyInterestSelectScalar = {
    id?: boolean
    leadId?: boolean
    address?: boolean
    listingTitle?: boolean
    source?: boolean
    listingUrl?: boolean
    rent?: boolean
    beds?: boolean
    baths?: boolean
    neighborhood?: boolean
    status?: boolean
    rating?: boolean
    clientFeedback?: boolean
    pros?: boolean
    cons?: boolean
    agentNotes?: boolean
    showingDate?: boolean
    showingTime?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type PropertyInterestOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "leadId" | "address" | "listingTitle" | "source" | "listingUrl" | "rent" | "beds" | "baths" | "neighborhood" | "status" | "rating" | "clientFeedback" | "pros" | "cons" | "agentNotes" | "showingDate" | "showingTime" | "createdAt" | "updatedAt", ExtArgs["result"]["propertyInterest"]>
  export type PropertyInterestInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    lead?: boolean | LeadDefaultArgs<ExtArgs>
  }
  export type PropertyInterestIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    lead?: boolean | LeadDefaultArgs<ExtArgs>
  }
  export type PropertyInterestIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    lead?: boolean | LeadDefaultArgs<ExtArgs>
  }

  export type $PropertyInterestPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PropertyInterest"
    objects: {
      lead: Prisma.$LeadPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      leadId: string
      address: string
      listingTitle: string
      source: string
      listingUrl: string
      rent: string
      beds: string
      baths: string
      neighborhood: string
      status: string
      rating: number
      clientFeedback: string
      pros: string
      cons: string
      agentNotes: string
      showingDate: string
      showingTime: string
      createdAt: string
      updatedAt: string
    }, ExtArgs["result"]["propertyInterest"]>
    composites: {}
  }

  type PropertyInterestGetPayload<S extends boolean | null | undefined | PropertyInterestDefaultArgs> = $Result.GetResult<Prisma.$PropertyInterestPayload, S>

  type PropertyInterestCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<PropertyInterestFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: PropertyInterestCountAggregateInputType | true
    }

  export interface PropertyInterestDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PropertyInterest'], meta: { name: 'PropertyInterest' } }
    /**
     * Find zero or one PropertyInterest that matches the filter.
     * @param {PropertyInterestFindUniqueArgs} args - Arguments to find a PropertyInterest
     * @example
     * // Get one PropertyInterest
     * const propertyInterest = await prisma.propertyInterest.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PropertyInterestFindUniqueArgs>(args: SelectSubset<T, PropertyInterestFindUniqueArgs<ExtArgs>>): Prisma__PropertyInterestClient<$Result.GetResult<Prisma.$PropertyInterestPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one PropertyInterest that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PropertyInterestFindUniqueOrThrowArgs} args - Arguments to find a PropertyInterest
     * @example
     * // Get one PropertyInterest
     * const propertyInterest = await prisma.propertyInterest.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PropertyInterestFindUniqueOrThrowArgs>(args: SelectSubset<T, PropertyInterestFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PropertyInterestClient<$Result.GetResult<Prisma.$PropertyInterestPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PropertyInterest that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PropertyInterestFindFirstArgs} args - Arguments to find a PropertyInterest
     * @example
     * // Get one PropertyInterest
     * const propertyInterest = await prisma.propertyInterest.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PropertyInterestFindFirstArgs>(args?: SelectSubset<T, PropertyInterestFindFirstArgs<ExtArgs>>): Prisma__PropertyInterestClient<$Result.GetResult<Prisma.$PropertyInterestPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PropertyInterest that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PropertyInterestFindFirstOrThrowArgs} args - Arguments to find a PropertyInterest
     * @example
     * // Get one PropertyInterest
     * const propertyInterest = await prisma.propertyInterest.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PropertyInterestFindFirstOrThrowArgs>(args?: SelectSubset<T, PropertyInterestFindFirstOrThrowArgs<ExtArgs>>): Prisma__PropertyInterestClient<$Result.GetResult<Prisma.$PropertyInterestPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more PropertyInterests that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PropertyInterestFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PropertyInterests
     * const propertyInterests = await prisma.propertyInterest.findMany()
     * 
     * // Get first 10 PropertyInterests
     * const propertyInterests = await prisma.propertyInterest.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const propertyInterestWithIdOnly = await prisma.propertyInterest.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PropertyInterestFindManyArgs>(args?: SelectSubset<T, PropertyInterestFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PropertyInterestPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a PropertyInterest.
     * @param {PropertyInterestCreateArgs} args - Arguments to create a PropertyInterest.
     * @example
     * // Create one PropertyInterest
     * const PropertyInterest = await prisma.propertyInterest.create({
     *   data: {
     *     // ... data to create a PropertyInterest
     *   }
     * })
     * 
     */
    create<T extends PropertyInterestCreateArgs>(args: SelectSubset<T, PropertyInterestCreateArgs<ExtArgs>>): Prisma__PropertyInterestClient<$Result.GetResult<Prisma.$PropertyInterestPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many PropertyInterests.
     * @param {PropertyInterestCreateManyArgs} args - Arguments to create many PropertyInterests.
     * @example
     * // Create many PropertyInterests
     * const propertyInterest = await prisma.propertyInterest.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PropertyInterestCreateManyArgs>(args?: SelectSubset<T, PropertyInterestCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many PropertyInterests and returns the data saved in the database.
     * @param {PropertyInterestCreateManyAndReturnArgs} args - Arguments to create many PropertyInterests.
     * @example
     * // Create many PropertyInterests
     * const propertyInterest = await prisma.propertyInterest.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many PropertyInterests and only return the `id`
     * const propertyInterestWithIdOnly = await prisma.propertyInterest.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PropertyInterestCreateManyAndReturnArgs>(args?: SelectSubset<T, PropertyInterestCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PropertyInterestPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a PropertyInterest.
     * @param {PropertyInterestDeleteArgs} args - Arguments to delete one PropertyInterest.
     * @example
     * // Delete one PropertyInterest
     * const PropertyInterest = await prisma.propertyInterest.delete({
     *   where: {
     *     // ... filter to delete one PropertyInterest
     *   }
     * })
     * 
     */
    delete<T extends PropertyInterestDeleteArgs>(args: SelectSubset<T, PropertyInterestDeleteArgs<ExtArgs>>): Prisma__PropertyInterestClient<$Result.GetResult<Prisma.$PropertyInterestPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one PropertyInterest.
     * @param {PropertyInterestUpdateArgs} args - Arguments to update one PropertyInterest.
     * @example
     * // Update one PropertyInterest
     * const propertyInterest = await prisma.propertyInterest.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PropertyInterestUpdateArgs>(args: SelectSubset<T, PropertyInterestUpdateArgs<ExtArgs>>): Prisma__PropertyInterestClient<$Result.GetResult<Prisma.$PropertyInterestPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more PropertyInterests.
     * @param {PropertyInterestDeleteManyArgs} args - Arguments to filter PropertyInterests to delete.
     * @example
     * // Delete a few PropertyInterests
     * const { count } = await prisma.propertyInterest.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PropertyInterestDeleteManyArgs>(args?: SelectSubset<T, PropertyInterestDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PropertyInterests.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PropertyInterestUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PropertyInterests
     * const propertyInterest = await prisma.propertyInterest.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PropertyInterestUpdateManyArgs>(args: SelectSubset<T, PropertyInterestUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PropertyInterests and returns the data updated in the database.
     * @param {PropertyInterestUpdateManyAndReturnArgs} args - Arguments to update many PropertyInterests.
     * @example
     * // Update many PropertyInterests
     * const propertyInterest = await prisma.propertyInterest.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more PropertyInterests and only return the `id`
     * const propertyInterestWithIdOnly = await prisma.propertyInterest.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends PropertyInterestUpdateManyAndReturnArgs>(args: SelectSubset<T, PropertyInterestUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PropertyInterestPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one PropertyInterest.
     * @param {PropertyInterestUpsertArgs} args - Arguments to update or create a PropertyInterest.
     * @example
     * // Update or create a PropertyInterest
     * const propertyInterest = await prisma.propertyInterest.upsert({
     *   create: {
     *     // ... data to create a PropertyInterest
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PropertyInterest we want to update
     *   }
     * })
     */
    upsert<T extends PropertyInterestUpsertArgs>(args: SelectSubset<T, PropertyInterestUpsertArgs<ExtArgs>>): Prisma__PropertyInterestClient<$Result.GetResult<Prisma.$PropertyInterestPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of PropertyInterests.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PropertyInterestCountArgs} args - Arguments to filter PropertyInterests to count.
     * @example
     * // Count the number of PropertyInterests
     * const count = await prisma.propertyInterest.count({
     *   where: {
     *     // ... the filter for the PropertyInterests we want to count
     *   }
     * })
    **/
    count<T extends PropertyInterestCountArgs>(
      args?: Subset<T, PropertyInterestCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PropertyInterestCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PropertyInterest.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PropertyInterestAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PropertyInterestAggregateArgs>(args: Subset<T, PropertyInterestAggregateArgs>): Prisma.PrismaPromise<GetPropertyInterestAggregateType<T>>

    /**
     * Group by PropertyInterest.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PropertyInterestGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PropertyInterestGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PropertyInterestGroupByArgs['orderBy'] }
        : { orderBy?: PropertyInterestGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PropertyInterestGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPropertyInterestGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PropertyInterest model
   */
  readonly fields: PropertyInterestFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PropertyInterest.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PropertyInterestClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    lead<T extends LeadDefaultArgs<ExtArgs> = {}>(args?: Subset<T, LeadDefaultArgs<ExtArgs>>): Prisma__LeadClient<$Result.GetResult<Prisma.$LeadPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the PropertyInterest model
   */
  interface PropertyInterestFieldRefs {
    readonly id: FieldRef<"PropertyInterest", 'String'>
    readonly leadId: FieldRef<"PropertyInterest", 'String'>
    readonly address: FieldRef<"PropertyInterest", 'String'>
    readonly listingTitle: FieldRef<"PropertyInterest", 'String'>
    readonly source: FieldRef<"PropertyInterest", 'String'>
    readonly listingUrl: FieldRef<"PropertyInterest", 'String'>
    readonly rent: FieldRef<"PropertyInterest", 'String'>
    readonly beds: FieldRef<"PropertyInterest", 'String'>
    readonly baths: FieldRef<"PropertyInterest", 'String'>
    readonly neighborhood: FieldRef<"PropertyInterest", 'String'>
    readonly status: FieldRef<"PropertyInterest", 'String'>
    readonly rating: FieldRef<"PropertyInterest", 'Int'>
    readonly clientFeedback: FieldRef<"PropertyInterest", 'String'>
    readonly pros: FieldRef<"PropertyInterest", 'String'>
    readonly cons: FieldRef<"PropertyInterest", 'String'>
    readonly agentNotes: FieldRef<"PropertyInterest", 'String'>
    readonly showingDate: FieldRef<"PropertyInterest", 'String'>
    readonly showingTime: FieldRef<"PropertyInterest", 'String'>
    readonly createdAt: FieldRef<"PropertyInterest", 'String'>
    readonly updatedAt: FieldRef<"PropertyInterest", 'String'>
  }
    

  // Custom InputTypes
  /**
   * PropertyInterest findUnique
   */
  export type PropertyInterestFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PropertyInterest
     */
    select?: PropertyInterestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PropertyInterest
     */
    omit?: PropertyInterestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PropertyInterestInclude<ExtArgs> | null
    /**
     * Filter, which PropertyInterest to fetch.
     */
    where: PropertyInterestWhereUniqueInput
  }

  /**
   * PropertyInterest findUniqueOrThrow
   */
  export type PropertyInterestFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PropertyInterest
     */
    select?: PropertyInterestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PropertyInterest
     */
    omit?: PropertyInterestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PropertyInterestInclude<ExtArgs> | null
    /**
     * Filter, which PropertyInterest to fetch.
     */
    where: PropertyInterestWhereUniqueInput
  }

  /**
   * PropertyInterest findFirst
   */
  export type PropertyInterestFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PropertyInterest
     */
    select?: PropertyInterestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PropertyInterest
     */
    omit?: PropertyInterestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PropertyInterestInclude<ExtArgs> | null
    /**
     * Filter, which PropertyInterest to fetch.
     */
    where?: PropertyInterestWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PropertyInterests to fetch.
     */
    orderBy?: PropertyInterestOrderByWithRelationInput | PropertyInterestOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PropertyInterests.
     */
    cursor?: PropertyInterestWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PropertyInterests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PropertyInterests.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PropertyInterests.
     */
    distinct?: PropertyInterestScalarFieldEnum | PropertyInterestScalarFieldEnum[]
  }

  /**
   * PropertyInterest findFirstOrThrow
   */
  export type PropertyInterestFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PropertyInterest
     */
    select?: PropertyInterestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PropertyInterest
     */
    omit?: PropertyInterestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PropertyInterestInclude<ExtArgs> | null
    /**
     * Filter, which PropertyInterest to fetch.
     */
    where?: PropertyInterestWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PropertyInterests to fetch.
     */
    orderBy?: PropertyInterestOrderByWithRelationInput | PropertyInterestOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PropertyInterests.
     */
    cursor?: PropertyInterestWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PropertyInterests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PropertyInterests.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PropertyInterests.
     */
    distinct?: PropertyInterestScalarFieldEnum | PropertyInterestScalarFieldEnum[]
  }

  /**
   * PropertyInterest findMany
   */
  export type PropertyInterestFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PropertyInterest
     */
    select?: PropertyInterestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PropertyInterest
     */
    omit?: PropertyInterestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PropertyInterestInclude<ExtArgs> | null
    /**
     * Filter, which PropertyInterests to fetch.
     */
    where?: PropertyInterestWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PropertyInterests to fetch.
     */
    orderBy?: PropertyInterestOrderByWithRelationInput | PropertyInterestOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PropertyInterests.
     */
    cursor?: PropertyInterestWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PropertyInterests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PropertyInterests.
     */
    skip?: number
    distinct?: PropertyInterestScalarFieldEnum | PropertyInterestScalarFieldEnum[]
  }

  /**
   * PropertyInterest create
   */
  export type PropertyInterestCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PropertyInterest
     */
    select?: PropertyInterestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PropertyInterest
     */
    omit?: PropertyInterestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PropertyInterestInclude<ExtArgs> | null
    /**
     * The data needed to create a PropertyInterest.
     */
    data: XOR<PropertyInterestCreateInput, PropertyInterestUncheckedCreateInput>
  }

  /**
   * PropertyInterest createMany
   */
  export type PropertyInterestCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PropertyInterests.
     */
    data: PropertyInterestCreateManyInput | PropertyInterestCreateManyInput[]
  }

  /**
   * PropertyInterest createManyAndReturn
   */
  export type PropertyInterestCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PropertyInterest
     */
    select?: PropertyInterestSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the PropertyInterest
     */
    omit?: PropertyInterestOmit<ExtArgs> | null
    /**
     * The data used to create many PropertyInterests.
     */
    data: PropertyInterestCreateManyInput | PropertyInterestCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PropertyInterestIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * PropertyInterest update
   */
  export type PropertyInterestUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PropertyInterest
     */
    select?: PropertyInterestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PropertyInterest
     */
    omit?: PropertyInterestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PropertyInterestInclude<ExtArgs> | null
    /**
     * The data needed to update a PropertyInterest.
     */
    data: XOR<PropertyInterestUpdateInput, PropertyInterestUncheckedUpdateInput>
    /**
     * Choose, which PropertyInterest to update.
     */
    where: PropertyInterestWhereUniqueInput
  }

  /**
   * PropertyInterest updateMany
   */
  export type PropertyInterestUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PropertyInterests.
     */
    data: XOR<PropertyInterestUpdateManyMutationInput, PropertyInterestUncheckedUpdateManyInput>
    /**
     * Filter which PropertyInterests to update
     */
    where?: PropertyInterestWhereInput
    /**
     * Limit how many PropertyInterests to update.
     */
    limit?: number
  }

  /**
   * PropertyInterest updateManyAndReturn
   */
  export type PropertyInterestUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PropertyInterest
     */
    select?: PropertyInterestSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the PropertyInterest
     */
    omit?: PropertyInterestOmit<ExtArgs> | null
    /**
     * The data used to update PropertyInterests.
     */
    data: XOR<PropertyInterestUpdateManyMutationInput, PropertyInterestUncheckedUpdateManyInput>
    /**
     * Filter which PropertyInterests to update
     */
    where?: PropertyInterestWhereInput
    /**
     * Limit how many PropertyInterests to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PropertyInterestIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * PropertyInterest upsert
   */
  export type PropertyInterestUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PropertyInterest
     */
    select?: PropertyInterestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PropertyInterest
     */
    omit?: PropertyInterestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PropertyInterestInclude<ExtArgs> | null
    /**
     * The filter to search for the PropertyInterest to update in case it exists.
     */
    where: PropertyInterestWhereUniqueInput
    /**
     * In case the PropertyInterest found by the `where` argument doesn't exist, create a new PropertyInterest with this data.
     */
    create: XOR<PropertyInterestCreateInput, PropertyInterestUncheckedCreateInput>
    /**
     * In case the PropertyInterest was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PropertyInterestUpdateInput, PropertyInterestUncheckedUpdateInput>
  }

  /**
   * PropertyInterest delete
   */
  export type PropertyInterestDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PropertyInterest
     */
    select?: PropertyInterestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PropertyInterest
     */
    omit?: PropertyInterestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PropertyInterestInclude<ExtArgs> | null
    /**
     * Filter which PropertyInterest to delete.
     */
    where: PropertyInterestWhereUniqueInput
  }

  /**
   * PropertyInterest deleteMany
   */
  export type PropertyInterestDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PropertyInterests to delete
     */
    where?: PropertyInterestWhereInput
    /**
     * Limit how many PropertyInterests to delete.
     */
    limit?: number
  }

  /**
   * PropertyInterest without action
   */
  export type PropertyInterestDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PropertyInterest
     */
    select?: PropertyInterestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PropertyInterest
     */
    omit?: PropertyInterestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PropertyInterestInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const LeadScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    fullName: 'fullName',
    phone: 'phone',
    email: 'email',
    propertyAddress: 'propertyAddress',
    desiredMoveInDate: 'desiredMoveInDate',
    notes: 'notes',
    status: 'status',
    priority: 'priority',
    source: 'source',
    nextFollowUpDate: 'nextFollowUpDate',
    showingDate: 'showingDate',
    showingTime: 'showingTime',
    routeStopOrder: 'routeStopOrder',
    routeCompleted: 'routeCompleted',
    routeNote: 'routeNote',
    agentNotes: 'agentNotes',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type LeadScalarFieldEnum = (typeof LeadScalarFieldEnum)[keyof typeof LeadScalarFieldEnum]


  export const PropertyInterestScalarFieldEnum: {
    id: 'id',
    leadId: 'leadId',
    address: 'address',
    listingTitle: 'listingTitle',
    source: 'source',
    listingUrl: 'listingUrl',
    rent: 'rent',
    beds: 'beds',
    baths: 'baths',
    neighborhood: 'neighborhood',
    status: 'status',
    rating: 'rating',
    clientFeedback: 'clientFeedback',
    pros: 'pros',
    cons: 'cons',
    agentNotes: 'agentNotes',
    showingDate: 'showingDate',
    showingTime: 'showingTime',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type PropertyInterestScalarFieldEnum = (typeof PropertyInterestScalarFieldEnum)[keyof typeof PropertyInterestScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    
  /**
   * Deep Input Types
   */


  export type LeadWhereInput = {
    AND?: LeadWhereInput | LeadWhereInput[]
    OR?: LeadWhereInput[]
    NOT?: LeadWhereInput | LeadWhereInput[]
    id?: StringFilter<"Lead"> | string
    userId?: StringFilter<"Lead"> | string
    fullName?: StringFilter<"Lead"> | string
    phone?: StringFilter<"Lead"> | string
    email?: StringFilter<"Lead"> | string
    propertyAddress?: StringFilter<"Lead"> | string
    desiredMoveInDate?: StringFilter<"Lead"> | string
    notes?: StringFilter<"Lead"> | string
    status?: StringFilter<"Lead"> | string
    priority?: StringFilter<"Lead"> | string
    source?: StringFilter<"Lead"> | string
    nextFollowUpDate?: StringFilter<"Lead"> | string
    showingDate?: StringFilter<"Lead"> | string
    showingTime?: StringFilter<"Lead"> | string
    routeStopOrder?: IntFilter<"Lead"> | number
    routeCompleted?: BoolFilter<"Lead"> | boolean
    routeNote?: StringFilter<"Lead"> | string
    agentNotes?: StringFilter<"Lead"> | string
    createdAt?: StringFilter<"Lead"> | string
    updatedAt?: StringFilter<"Lead"> | string
    propertyInterests?: PropertyInterestListRelationFilter
  }

  export type LeadOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    fullName?: SortOrder
    phone?: SortOrder
    email?: SortOrder
    propertyAddress?: SortOrder
    desiredMoveInDate?: SortOrder
    notes?: SortOrder
    status?: SortOrder
    priority?: SortOrder
    source?: SortOrder
    nextFollowUpDate?: SortOrder
    showingDate?: SortOrder
    showingTime?: SortOrder
    routeStopOrder?: SortOrder
    routeCompleted?: SortOrder
    routeNote?: SortOrder
    agentNotes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    propertyInterests?: PropertyInterestOrderByRelationAggregateInput
  }

  export type LeadWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: LeadWhereInput | LeadWhereInput[]
    OR?: LeadWhereInput[]
    NOT?: LeadWhereInput | LeadWhereInput[]
    userId?: StringFilter<"Lead"> | string
    fullName?: StringFilter<"Lead"> | string
    phone?: StringFilter<"Lead"> | string
    email?: StringFilter<"Lead"> | string
    propertyAddress?: StringFilter<"Lead"> | string
    desiredMoveInDate?: StringFilter<"Lead"> | string
    notes?: StringFilter<"Lead"> | string
    status?: StringFilter<"Lead"> | string
    priority?: StringFilter<"Lead"> | string
    source?: StringFilter<"Lead"> | string
    nextFollowUpDate?: StringFilter<"Lead"> | string
    showingDate?: StringFilter<"Lead"> | string
    showingTime?: StringFilter<"Lead"> | string
    routeStopOrder?: IntFilter<"Lead"> | number
    routeCompleted?: BoolFilter<"Lead"> | boolean
    routeNote?: StringFilter<"Lead"> | string
    agentNotes?: StringFilter<"Lead"> | string
    createdAt?: StringFilter<"Lead"> | string
    updatedAt?: StringFilter<"Lead"> | string
    propertyInterests?: PropertyInterestListRelationFilter
  }, "id">

  export type LeadOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    fullName?: SortOrder
    phone?: SortOrder
    email?: SortOrder
    propertyAddress?: SortOrder
    desiredMoveInDate?: SortOrder
    notes?: SortOrder
    status?: SortOrder
    priority?: SortOrder
    source?: SortOrder
    nextFollowUpDate?: SortOrder
    showingDate?: SortOrder
    showingTime?: SortOrder
    routeStopOrder?: SortOrder
    routeCompleted?: SortOrder
    routeNote?: SortOrder
    agentNotes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: LeadCountOrderByAggregateInput
    _avg?: LeadAvgOrderByAggregateInput
    _max?: LeadMaxOrderByAggregateInput
    _min?: LeadMinOrderByAggregateInput
    _sum?: LeadSumOrderByAggregateInput
  }

  export type LeadScalarWhereWithAggregatesInput = {
    AND?: LeadScalarWhereWithAggregatesInput | LeadScalarWhereWithAggregatesInput[]
    OR?: LeadScalarWhereWithAggregatesInput[]
    NOT?: LeadScalarWhereWithAggregatesInput | LeadScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Lead"> | string
    userId?: StringWithAggregatesFilter<"Lead"> | string
    fullName?: StringWithAggregatesFilter<"Lead"> | string
    phone?: StringWithAggregatesFilter<"Lead"> | string
    email?: StringWithAggregatesFilter<"Lead"> | string
    propertyAddress?: StringWithAggregatesFilter<"Lead"> | string
    desiredMoveInDate?: StringWithAggregatesFilter<"Lead"> | string
    notes?: StringWithAggregatesFilter<"Lead"> | string
    status?: StringWithAggregatesFilter<"Lead"> | string
    priority?: StringWithAggregatesFilter<"Lead"> | string
    source?: StringWithAggregatesFilter<"Lead"> | string
    nextFollowUpDate?: StringWithAggregatesFilter<"Lead"> | string
    showingDate?: StringWithAggregatesFilter<"Lead"> | string
    showingTime?: StringWithAggregatesFilter<"Lead"> | string
    routeStopOrder?: IntWithAggregatesFilter<"Lead"> | number
    routeCompleted?: BoolWithAggregatesFilter<"Lead"> | boolean
    routeNote?: StringWithAggregatesFilter<"Lead"> | string
    agentNotes?: StringWithAggregatesFilter<"Lead"> | string
    createdAt?: StringWithAggregatesFilter<"Lead"> | string
    updatedAt?: StringWithAggregatesFilter<"Lead"> | string
  }

  export type PropertyInterestWhereInput = {
    AND?: PropertyInterestWhereInput | PropertyInterestWhereInput[]
    OR?: PropertyInterestWhereInput[]
    NOT?: PropertyInterestWhereInput | PropertyInterestWhereInput[]
    id?: StringFilter<"PropertyInterest"> | string
    leadId?: StringFilter<"PropertyInterest"> | string
    address?: StringFilter<"PropertyInterest"> | string
    listingTitle?: StringFilter<"PropertyInterest"> | string
    source?: StringFilter<"PropertyInterest"> | string
    listingUrl?: StringFilter<"PropertyInterest"> | string
    rent?: StringFilter<"PropertyInterest"> | string
    beds?: StringFilter<"PropertyInterest"> | string
    baths?: StringFilter<"PropertyInterest"> | string
    neighborhood?: StringFilter<"PropertyInterest"> | string
    status?: StringFilter<"PropertyInterest"> | string
    rating?: IntFilter<"PropertyInterest"> | number
    clientFeedback?: StringFilter<"PropertyInterest"> | string
    pros?: StringFilter<"PropertyInterest"> | string
    cons?: StringFilter<"PropertyInterest"> | string
    agentNotes?: StringFilter<"PropertyInterest"> | string
    showingDate?: StringFilter<"PropertyInterest"> | string
    showingTime?: StringFilter<"PropertyInterest"> | string
    createdAt?: StringFilter<"PropertyInterest"> | string
    updatedAt?: StringFilter<"PropertyInterest"> | string
    lead?: XOR<LeadScalarRelationFilter, LeadWhereInput>
  }

  export type PropertyInterestOrderByWithRelationInput = {
    id?: SortOrder
    leadId?: SortOrder
    address?: SortOrder
    listingTitle?: SortOrder
    source?: SortOrder
    listingUrl?: SortOrder
    rent?: SortOrder
    beds?: SortOrder
    baths?: SortOrder
    neighborhood?: SortOrder
    status?: SortOrder
    rating?: SortOrder
    clientFeedback?: SortOrder
    pros?: SortOrder
    cons?: SortOrder
    agentNotes?: SortOrder
    showingDate?: SortOrder
    showingTime?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    lead?: LeadOrderByWithRelationInput
  }

  export type PropertyInterestWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: PropertyInterestWhereInput | PropertyInterestWhereInput[]
    OR?: PropertyInterestWhereInput[]
    NOT?: PropertyInterestWhereInput | PropertyInterestWhereInput[]
    leadId?: StringFilter<"PropertyInterest"> | string
    address?: StringFilter<"PropertyInterest"> | string
    listingTitle?: StringFilter<"PropertyInterest"> | string
    source?: StringFilter<"PropertyInterest"> | string
    listingUrl?: StringFilter<"PropertyInterest"> | string
    rent?: StringFilter<"PropertyInterest"> | string
    beds?: StringFilter<"PropertyInterest"> | string
    baths?: StringFilter<"PropertyInterest"> | string
    neighborhood?: StringFilter<"PropertyInterest"> | string
    status?: StringFilter<"PropertyInterest"> | string
    rating?: IntFilter<"PropertyInterest"> | number
    clientFeedback?: StringFilter<"PropertyInterest"> | string
    pros?: StringFilter<"PropertyInterest"> | string
    cons?: StringFilter<"PropertyInterest"> | string
    agentNotes?: StringFilter<"PropertyInterest"> | string
    showingDate?: StringFilter<"PropertyInterest"> | string
    showingTime?: StringFilter<"PropertyInterest"> | string
    createdAt?: StringFilter<"PropertyInterest"> | string
    updatedAt?: StringFilter<"PropertyInterest"> | string
    lead?: XOR<LeadScalarRelationFilter, LeadWhereInput>
  }, "id">

  export type PropertyInterestOrderByWithAggregationInput = {
    id?: SortOrder
    leadId?: SortOrder
    address?: SortOrder
    listingTitle?: SortOrder
    source?: SortOrder
    listingUrl?: SortOrder
    rent?: SortOrder
    beds?: SortOrder
    baths?: SortOrder
    neighborhood?: SortOrder
    status?: SortOrder
    rating?: SortOrder
    clientFeedback?: SortOrder
    pros?: SortOrder
    cons?: SortOrder
    agentNotes?: SortOrder
    showingDate?: SortOrder
    showingTime?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: PropertyInterestCountOrderByAggregateInput
    _avg?: PropertyInterestAvgOrderByAggregateInput
    _max?: PropertyInterestMaxOrderByAggregateInput
    _min?: PropertyInterestMinOrderByAggregateInput
    _sum?: PropertyInterestSumOrderByAggregateInput
  }

  export type PropertyInterestScalarWhereWithAggregatesInput = {
    AND?: PropertyInterestScalarWhereWithAggregatesInput | PropertyInterestScalarWhereWithAggregatesInput[]
    OR?: PropertyInterestScalarWhereWithAggregatesInput[]
    NOT?: PropertyInterestScalarWhereWithAggregatesInput | PropertyInterestScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"PropertyInterest"> | string
    leadId?: StringWithAggregatesFilter<"PropertyInterest"> | string
    address?: StringWithAggregatesFilter<"PropertyInterest"> | string
    listingTitle?: StringWithAggregatesFilter<"PropertyInterest"> | string
    source?: StringWithAggregatesFilter<"PropertyInterest"> | string
    listingUrl?: StringWithAggregatesFilter<"PropertyInterest"> | string
    rent?: StringWithAggregatesFilter<"PropertyInterest"> | string
    beds?: StringWithAggregatesFilter<"PropertyInterest"> | string
    baths?: StringWithAggregatesFilter<"PropertyInterest"> | string
    neighborhood?: StringWithAggregatesFilter<"PropertyInterest"> | string
    status?: StringWithAggregatesFilter<"PropertyInterest"> | string
    rating?: IntWithAggregatesFilter<"PropertyInterest"> | number
    clientFeedback?: StringWithAggregatesFilter<"PropertyInterest"> | string
    pros?: StringWithAggregatesFilter<"PropertyInterest"> | string
    cons?: StringWithAggregatesFilter<"PropertyInterest"> | string
    agentNotes?: StringWithAggregatesFilter<"PropertyInterest"> | string
    showingDate?: StringWithAggregatesFilter<"PropertyInterest"> | string
    showingTime?: StringWithAggregatesFilter<"PropertyInterest"> | string
    createdAt?: StringWithAggregatesFilter<"PropertyInterest"> | string
    updatedAt?: StringWithAggregatesFilter<"PropertyInterest"> | string
  }

  export type LeadCreateInput = {
    id: string
    userId: string
    fullName: string
    phone: string
    email: string
    propertyAddress: string
    desiredMoveInDate: string
    notes: string
    status: string
    priority: string
    source: string
    nextFollowUpDate: string
    showingDate: string
    showingTime: string
    routeStopOrder?: number
    routeCompleted?: boolean
    routeNote?: string
    agentNotes: string
    createdAt: string
    updatedAt: string
    propertyInterests?: PropertyInterestCreateNestedManyWithoutLeadInput
  }

  export type LeadUncheckedCreateInput = {
    id: string
    userId: string
    fullName: string
    phone: string
    email: string
    propertyAddress: string
    desiredMoveInDate: string
    notes: string
    status: string
    priority: string
    source: string
    nextFollowUpDate: string
    showingDate: string
    showingTime: string
    routeStopOrder?: number
    routeCompleted?: boolean
    routeNote?: string
    agentNotes: string
    createdAt: string
    updatedAt: string
    propertyInterests?: PropertyInterestUncheckedCreateNestedManyWithoutLeadInput
  }

  export type LeadUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    propertyAddress?: StringFieldUpdateOperationsInput | string
    desiredMoveInDate?: StringFieldUpdateOperationsInput | string
    notes?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    priority?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    nextFollowUpDate?: StringFieldUpdateOperationsInput | string
    showingDate?: StringFieldUpdateOperationsInput | string
    showingTime?: StringFieldUpdateOperationsInput | string
    routeStopOrder?: IntFieldUpdateOperationsInput | number
    routeCompleted?: BoolFieldUpdateOperationsInput | boolean
    routeNote?: StringFieldUpdateOperationsInput | string
    agentNotes?: StringFieldUpdateOperationsInput | string
    createdAt?: StringFieldUpdateOperationsInput | string
    updatedAt?: StringFieldUpdateOperationsInput | string
    propertyInterests?: PropertyInterestUpdateManyWithoutLeadNestedInput
  }

  export type LeadUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    propertyAddress?: StringFieldUpdateOperationsInput | string
    desiredMoveInDate?: StringFieldUpdateOperationsInput | string
    notes?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    priority?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    nextFollowUpDate?: StringFieldUpdateOperationsInput | string
    showingDate?: StringFieldUpdateOperationsInput | string
    showingTime?: StringFieldUpdateOperationsInput | string
    routeStopOrder?: IntFieldUpdateOperationsInput | number
    routeCompleted?: BoolFieldUpdateOperationsInput | boolean
    routeNote?: StringFieldUpdateOperationsInput | string
    agentNotes?: StringFieldUpdateOperationsInput | string
    createdAt?: StringFieldUpdateOperationsInput | string
    updatedAt?: StringFieldUpdateOperationsInput | string
    propertyInterests?: PropertyInterestUncheckedUpdateManyWithoutLeadNestedInput
  }

  export type LeadCreateManyInput = {
    id: string
    userId: string
    fullName: string
    phone: string
    email: string
    propertyAddress: string
    desiredMoveInDate: string
    notes: string
    status: string
    priority: string
    source: string
    nextFollowUpDate: string
    showingDate: string
    showingTime: string
    routeStopOrder?: number
    routeCompleted?: boolean
    routeNote?: string
    agentNotes: string
    createdAt: string
    updatedAt: string
  }

  export type LeadUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    propertyAddress?: StringFieldUpdateOperationsInput | string
    desiredMoveInDate?: StringFieldUpdateOperationsInput | string
    notes?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    priority?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    nextFollowUpDate?: StringFieldUpdateOperationsInput | string
    showingDate?: StringFieldUpdateOperationsInput | string
    showingTime?: StringFieldUpdateOperationsInput | string
    routeStopOrder?: IntFieldUpdateOperationsInput | number
    routeCompleted?: BoolFieldUpdateOperationsInput | boolean
    routeNote?: StringFieldUpdateOperationsInput | string
    agentNotes?: StringFieldUpdateOperationsInput | string
    createdAt?: StringFieldUpdateOperationsInput | string
    updatedAt?: StringFieldUpdateOperationsInput | string
  }

  export type LeadUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    propertyAddress?: StringFieldUpdateOperationsInput | string
    desiredMoveInDate?: StringFieldUpdateOperationsInput | string
    notes?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    priority?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    nextFollowUpDate?: StringFieldUpdateOperationsInput | string
    showingDate?: StringFieldUpdateOperationsInput | string
    showingTime?: StringFieldUpdateOperationsInput | string
    routeStopOrder?: IntFieldUpdateOperationsInput | number
    routeCompleted?: BoolFieldUpdateOperationsInput | boolean
    routeNote?: StringFieldUpdateOperationsInput | string
    agentNotes?: StringFieldUpdateOperationsInput | string
    createdAt?: StringFieldUpdateOperationsInput | string
    updatedAt?: StringFieldUpdateOperationsInput | string
  }

  export type PropertyInterestCreateInput = {
    id: string
    address: string
    listingTitle: string
    source: string
    listingUrl: string
    rent: string
    beds: string
    baths: string
    neighborhood: string
    status: string
    rating: number
    clientFeedback: string
    pros: string
    cons: string
    agentNotes: string
    showingDate: string
    showingTime: string
    createdAt: string
    updatedAt: string
    lead: LeadCreateNestedOneWithoutPropertyInterestsInput
  }

  export type PropertyInterestUncheckedCreateInput = {
    id: string
    leadId: string
    address: string
    listingTitle: string
    source: string
    listingUrl: string
    rent: string
    beds: string
    baths: string
    neighborhood: string
    status: string
    rating: number
    clientFeedback: string
    pros: string
    cons: string
    agentNotes: string
    showingDate: string
    showingTime: string
    createdAt: string
    updatedAt: string
  }

  export type PropertyInterestUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    listingTitle?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    listingUrl?: StringFieldUpdateOperationsInput | string
    rent?: StringFieldUpdateOperationsInput | string
    beds?: StringFieldUpdateOperationsInput | string
    baths?: StringFieldUpdateOperationsInput | string
    neighborhood?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    rating?: IntFieldUpdateOperationsInput | number
    clientFeedback?: StringFieldUpdateOperationsInput | string
    pros?: StringFieldUpdateOperationsInput | string
    cons?: StringFieldUpdateOperationsInput | string
    agentNotes?: StringFieldUpdateOperationsInput | string
    showingDate?: StringFieldUpdateOperationsInput | string
    showingTime?: StringFieldUpdateOperationsInput | string
    createdAt?: StringFieldUpdateOperationsInput | string
    updatedAt?: StringFieldUpdateOperationsInput | string
    lead?: LeadUpdateOneRequiredWithoutPropertyInterestsNestedInput
  }

  export type PropertyInterestUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    leadId?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    listingTitle?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    listingUrl?: StringFieldUpdateOperationsInput | string
    rent?: StringFieldUpdateOperationsInput | string
    beds?: StringFieldUpdateOperationsInput | string
    baths?: StringFieldUpdateOperationsInput | string
    neighborhood?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    rating?: IntFieldUpdateOperationsInput | number
    clientFeedback?: StringFieldUpdateOperationsInput | string
    pros?: StringFieldUpdateOperationsInput | string
    cons?: StringFieldUpdateOperationsInput | string
    agentNotes?: StringFieldUpdateOperationsInput | string
    showingDate?: StringFieldUpdateOperationsInput | string
    showingTime?: StringFieldUpdateOperationsInput | string
    createdAt?: StringFieldUpdateOperationsInput | string
    updatedAt?: StringFieldUpdateOperationsInput | string
  }

  export type PropertyInterestCreateManyInput = {
    id: string
    leadId: string
    address: string
    listingTitle: string
    source: string
    listingUrl: string
    rent: string
    beds: string
    baths: string
    neighborhood: string
    status: string
    rating: number
    clientFeedback: string
    pros: string
    cons: string
    agentNotes: string
    showingDate: string
    showingTime: string
    createdAt: string
    updatedAt: string
  }

  export type PropertyInterestUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    listingTitle?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    listingUrl?: StringFieldUpdateOperationsInput | string
    rent?: StringFieldUpdateOperationsInput | string
    beds?: StringFieldUpdateOperationsInput | string
    baths?: StringFieldUpdateOperationsInput | string
    neighborhood?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    rating?: IntFieldUpdateOperationsInput | number
    clientFeedback?: StringFieldUpdateOperationsInput | string
    pros?: StringFieldUpdateOperationsInput | string
    cons?: StringFieldUpdateOperationsInput | string
    agentNotes?: StringFieldUpdateOperationsInput | string
    showingDate?: StringFieldUpdateOperationsInput | string
    showingTime?: StringFieldUpdateOperationsInput | string
    createdAt?: StringFieldUpdateOperationsInput | string
    updatedAt?: StringFieldUpdateOperationsInput | string
  }

  export type PropertyInterestUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    leadId?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    listingTitle?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    listingUrl?: StringFieldUpdateOperationsInput | string
    rent?: StringFieldUpdateOperationsInput | string
    beds?: StringFieldUpdateOperationsInput | string
    baths?: StringFieldUpdateOperationsInput | string
    neighborhood?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    rating?: IntFieldUpdateOperationsInput | number
    clientFeedback?: StringFieldUpdateOperationsInput | string
    pros?: StringFieldUpdateOperationsInput | string
    cons?: StringFieldUpdateOperationsInput | string
    agentNotes?: StringFieldUpdateOperationsInput | string
    showingDate?: StringFieldUpdateOperationsInput | string
    showingTime?: StringFieldUpdateOperationsInput | string
    createdAt?: StringFieldUpdateOperationsInput | string
    updatedAt?: StringFieldUpdateOperationsInput | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type PropertyInterestListRelationFilter = {
    every?: PropertyInterestWhereInput
    some?: PropertyInterestWhereInput
    none?: PropertyInterestWhereInput
  }

  export type PropertyInterestOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type LeadCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    fullName?: SortOrder
    phone?: SortOrder
    email?: SortOrder
    propertyAddress?: SortOrder
    desiredMoveInDate?: SortOrder
    notes?: SortOrder
    status?: SortOrder
    priority?: SortOrder
    source?: SortOrder
    nextFollowUpDate?: SortOrder
    showingDate?: SortOrder
    showingTime?: SortOrder
    routeStopOrder?: SortOrder
    routeCompleted?: SortOrder
    routeNote?: SortOrder
    agentNotes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type LeadAvgOrderByAggregateInput = {
    routeStopOrder?: SortOrder
  }

  export type LeadMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    fullName?: SortOrder
    phone?: SortOrder
    email?: SortOrder
    propertyAddress?: SortOrder
    desiredMoveInDate?: SortOrder
    notes?: SortOrder
    status?: SortOrder
    priority?: SortOrder
    source?: SortOrder
    nextFollowUpDate?: SortOrder
    showingDate?: SortOrder
    showingTime?: SortOrder
    routeStopOrder?: SortOrder
    routeCompleted?: SortOrder
    routeNote?: SortOrder
    agentNotes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type LeadMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    fullName?: SortOrder
    phone?: SortOrder
    email?: SortOrder
    propertyAddress?: SortOrder
    desiredMoveInDate?: SortOrder
    notes?: SortOrder
    status?: SortOrder
    priority?: SortOrder
    source?: SortOrder
    nextFollowUpDate?: SortOrder
    showingDate?: SortOrder
    showingTime?: SortOrder
    routeStopOrder?: SortOrder
    routeCompleted?: SortOrder
    routeNote?: SortOrder
    agentNotes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type LeadSumOrderByAggregateInput = {
    routeStopOrder?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type LeadScalarRelationFilter = {
    is?: LeadWhereInput
    isNot?: LeadWhereInput
  }

  export type PropertyInterestCountOrderByAggregateInput = {
    id?: SortOrder
    leadId?: SortOrder
    address?: SortOrder
    listingTitle?: SortOrder
    source?: SortOrder
    listingUrl?: SortOrder
    rent?: SortOrder
    beds?: SortOrder
    baths?: SortOrder
    neighborhood?: SortOrder
    status?: SortOrder
    rating?: SortOrder
    clientFeedback?: SortOrder
    pros?: SortOrder
    cons?: SortOrder
    agentNotes?: SortOrder
    showingDate?: SortOrder
    showingTime?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PropertyInterestAvgOrderByAggregateInput = {
    rating?: SortOrder
  }

  export type PropertyInterestMaxOrderByAggregateInput = {
    id?: SortOrder
    leadId?: SortOrder
    address?: SortOrder
    listingTitle?: SortOrder
    source?: SortOrder
    listingUrl?: SortOrder
    rent?: SortOrder
    beds?: SortOrder
    baths?: SortOrder
    neighborhood?: SortOrder
    status?: SortOrder
    rating?: SortOrder
    clientFeedback?: SortOrder
    pros?: SortOrder
    cons?: SortOrder
    agentNotes?: SortOrder
    showingDate?: SortOrder
    showingTime?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PropertyInterestMinOrderByAggregateInput = {
    id?: SortOrder
    leadId?: SortOrder
    address?: SortOrder
    listingTitle?: SortOrder
    source?: SortOrder
    listingUrl?: SortOrder
    rent?: SortOrder
    beds?: SortOrder
    baths?: SortOrder
    neighborhood?: SortOrder
    status?: SortOrder
    rating?: SortOrder
    clientFeedback?: SortOrder
    pros?: SortOrder
    cons?: SortOrder
    agentNotes?: SortOrder
    showingDate?: SortOrder
    showingTime?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PropertyInterestSumOrderByAggregateInput = {
    rating?: SortOrder
  }

  export type PropertyInterestCreateNestedManyWithoutLeadInput = {
    create?: XOR<PropertyInterestCreateWithoutLeadInput, PropertyInterestUncheckedCreateWithoutLeadInput> | PropertyInterestCreateWithoutLeadInput[] | PropertyInterestUncheckedCreateWithoutLeadInput[]
    connectOrCreate?: PropertyInterestCreateOrConnectWithoutLeadInput | PropertyInterestCreateOrConnectWithoutLeadInput[]
    createMany?: PropertyInterestCreateManyLeadInputEnvelope
    connect?: PropertyInterestWhereUniqueInput | PropertyInterestWhereUniqueInput[]
  }

  export type PropertyInterestUncheckedCreateNestedManyWithoutLeadInput = {
    create?: XOR<PropertyInterestCreateWithoutLeadInput, PropertyInterestUncheckedCreateWithoutLeadInput> | PropertyInterestCreateWithoutLeadInput[] | PropertyInterestUncheckedCreateWithoutLeadInput[]
    connectOrCreate?: PropertyInterestCreateOrConnectWithoutLeadInput | PropertyInterestCreateOrConnectWithoutLeadInput[]
    createMany?: PropertyInterestCreateManyLeadInputEnvelope
    connect?: PropertyInterestWhereUniqueInput | PropertyInterestWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type PropertyInterestUpdateManyWithoutLeadNestedInput = {
    create?: XOR<PropertyInterestCreateWithoutLeadInput, PropertyInterestUncheckedCreateWithoutLeadInput> | PropertyInterestCreateWithoutLeadInput[] | PropertyInterestUncheckedCreateWithoutLeadInput[]
    connectOrCreate?: PropertyInterestCreateOrConnectWithoutLeadInput | PropertyInterestCreateOrConnectWithoutLeadInput[]
    upsert?: PropertyInterestUpsertWithWhereUniqueWithoutLeadInput | PropertyInterestUpsertWithWhereUniqueWithoutLeadInput[]
    createMany?: PropertyInterestCreateManyLeadInputEnvelope
    set?: PropertyInterestWhereUniqueInput | PropertyInterestWhereUniqueInput[]
    disconnect?: PropertyInterestWhereUniqueInput | PropertyInterestWhereUniqueInput[]
    delete?: PropertyInterestWhereUniqueInput | PropertyInterestWhereUniqueInput[]
    connect?: PropertyInterestWhereUniqueInput | PropertyInterestWhereUniqueInput[]
    update?: PropertyInterestUpdateWithWhereUniqueWithoutLeadInput | PropertyInterestUpdateWithWhereUniqueWithoutLeadInput[]
    updateMany?: PropertyInterestUpdateManyWithWhereWithoutLeadInput | PropertyInterestUpdateManyWithWhereWithoutLeadInput[]
    deleteMany?: PropertyInterestScalarWhereInput | PropertyInterestScalarWhereInput[]
  }

  export type PropertyInterestUncheckedUpdateManyWithoutLeadNestedInput = {
    create?: XOR<PropertyInterestCreateWithoutLeadInput, PropertyInterestUncheckedCreateWithoutLeadInput> | PropertyInterestCreateWithoutLeadInput[] | PropertyInterestUncheckedCreateWithoutLeadInput[]
    connectOrCreate?: PropertyInterestCreateOrConnectWithoutLeadInput | PropertyInterestCreateOrConnectWithoutLeadInput[]
    upsert?: PropertyInterestUpsertWithWhereUniqueWithoutLeadInput | PropertyInterestUpsertWithWhereUniqueWithoutLeadInput[]
    createMany?: PropertyInterestCreateManyLeadInputEnvelope
    set?: PropertyInterestWhereUniqueInput | PropertyInterestWhereUniqueInput[]
    disconnect?: PropertyInterestWhereUniqueInput | PropertyInterestWhereUniqueInput[]
    delete?: PropertyInterestWhereUniqueInput | PropertyInterestWhereUniqueInput[]
    connect?: PropertyInterestWhereUniqueInput | PropertyInterestWhereUniqueInput[]
    update?: PropertyInterestUpdateWithWhereUniqueWithoutLeadInput | PropertyInterestUpdateWithWhereUniqueWithoutLeadInput[]
    updateMany?: PropertyInterestUpdateManyWithWhereWithoutLeadInput | PropertyInterestUpdateManyWithWhereWithoutLeadInput[]
    deleteMany?: PropertyInterestScalarWhereInput | PropertyInterestScalarWhereInput[]
  }

  export type LeadCreateNestedOneWithoutPropertyInterestsInput = {
    create?: XOR<LeadCreateWithoutPropertyInterestsInput, LeadUncheckedCreateWithoutPropertyInterestsInput>
    connectOrCreate?: LeadCreateOrConnectWithoutPropertyInterestsInput
    connect?: LeadWhereUniqueInput
  }

  export type LeadUpdateOneRequiredWithoutPropertyInterestsNestedInput = {
    create?: XOR<LeadCreateWithoutPropertyInterestsInput, LeadUncheckedCreateWithoutPropertyInterestsInput>
    connectOrCreate?: LeadCreateOrConnectWithoutPropertyInterestsInput
    upsert?: LeadUpsertWithoutPropertyInterestsInput
    connect?: LeadWhereUniqueInput
    update?: XOR<XOR<LeadUpdateToOneWithWhereWithoutPropertyInterestsInput, LeadUpdateWithoutPropertyInterestsInput>, LeadUncheckedUpdateWithoutPropertyInterestsInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type PropertyInterestCreateWithoutLeadInput = {
    id: string
    address: string
    listingTitle: string
    source: string
    listingUrl: string
    rent: string
    beds: string
    baths: string
    neighborhood: string
    status: string
    rating: number
    clientFeedback: string
    pros: string
    cons: string
    agentNotes: string
    showingDate: string
    showingTime: string
    createdAt: string
    updatedAt: string
  }

  export type PropertyInterestUncheckedCreateWithoutLeadInput = {
    id: string
    address: string
    listingTitle: string
    source: string
    listingUrl: string
    rent: string
    beds: string
    baths: string
    neighborhood: string
    status: string
    rating: number
    clientFeedback: string
    pros: string
    cons: string
    agentNotes: string
    showingDate: string
    showingTime: string
    createdAt: string
    updatedAt: string
  }

  export type PropertyInterestCreateOrConnectWithoutLeadInput = {
    where: PropertyInterestWhereUniqueInput
    create: XOR<PropertyInterestCreateWithoutLeadInput, PropertyInterestUncheckedCreateWithoutLeadInput>
  }

  export type PropertyInterestCreateManyLeadInputEnvelope = {
    data: PropertyInterestCreateManyLeadInput | PropertyInterestCreateManyLeadInput[]
  }

  export type PropertyInterestUpsertWithWhereUniqueWithoutLeadInput = {
    where: PropertyInterestWhereUniqueInput
    update: XOR<PropertyInterestUpdateWithoutLeadInput, PropertyInterestUncheckedUpdateWithoutLeadInput>
    create: XOR<PropertyInterestCreateWithoutLeadInput, PropertyInterestUncheckedCreateWithoutLeadInput>
  }

  export type PropertyInterestUpdateWithWhereUniqueWithoutLeadInput = {
    where: PropertyInterestWhereUniqueInput
    data: XOR<PropertyInterestUpdateWithoutLeadInput, PropertyInterestUncheckedUpdateWithoutLeadInput>
  }

  export type PropertyInterestUpdateManyWithWhereWithoutLeadInput = {
    where: PropertyInterestScalarWhereInput
    data: XOR<PropertyInterestUpdateManyMutationInput, PropertyInterestUncheckedUpdateManyWithoutLeadInput>
  }

  export type PropertyInterestScalarWhereInput = {
    AND?: PropertyInterestScalarWhereInput | PropertyInterestScalarWhereInput[]
    OR?: PropertyInterestScalarWhereInput[]
    NOT?: PropertyInterestScalarWhereInput | PropertyInterestScalarWhereInput[]
    id?: StringFilter<"PropertyInterest"> | string
    leadId?: StringFilter<"PropertyInterest"> | string
    address?: StringFilter<"PropertyInterest"> | string
    listingTitle?: StringFilter<"PropertyInterest"> | string
    source?: StringFilter<"PropertyInterest"> | string
    listingUrl?: StringFilter<"PropertyInterest"> | string
    rent?: StringFilter<"PropertyInterest"> | string
    beds?: StringFilter<"PropertyInterest"> | string
    baths?: StringFilter<"PropertyInterest"> | string
    neighborhood?: StringFilter<"PropertyInterest"> | string
    status?: StringFilter<"PropertyInterest"> | string
    rating?: IntFilter<"PropertyInterest"> | number
    clientFeedback?: StringFilter<"PropertyInterest"> | string
    pros?: StringFilter<"PropertyInterest"> | string
    cons?: StringFilter<"PropertyInterest"> | string
    agentNotes?: StringFilter<"PropertyInterest"> | string
    showingDate?: StringFilter<"PropertyInterest"> | string
    showingTime?: StringFilter<"PropertyInterest"> | string
    createdAt?: StringFilter<"PropertyInterest"> | string
    updatedAt?: StringFilter<"PropertyInterest"> | string
  }

  export type LeadCreateWithoutPropertyInterestsInput = {
    id: string
    userId: string
    fullName: string
    phone: string
    email: string
    propertyAddress: string
    desiredMoveInDate: string
    notes: string
    status: string
    priority: string
    source: string
    nextFollowUpDate: string
    showingDate: string
    showingTime: string
    routeStopOrder?: number
    routeCompleted?: boolean
    routeNote?: string
    agentNotes: string
    createdAt: string
    updatedAt: string
  }

  export type LeadUncheckedCreateWithoutPropertyInterestsInput = {
    id: string
    userId: string
    fullName: string
    phone: string
    email: string
    propertyAddress: string
    desiredMoveInDate: string
    notes: string
    status: string
    priority: string
    source: string
    nextFollowUpDate: string
    showingDate: string
    showingTime: string
    routeStopOrder?: number
    routeCompleted?: boolean
    routeNote?: string
    agentNotes: string
    createdAt: string
    updatedAt: string
  }

  export type LeadCreateOrConnectWithoutPropertyInterestsInput = {
    where: LeadWhereUniqueInput
    create: XOR<LeadCreateWithoutPropertyInterestsInput, LeadUncheckedCreateWithoutPropertyInterestsInput>
  }

  export type LeadUpsertWithoutPropertyInterestsInput = {
    update: XOR<LeadUpdateWithoutPropertyInterestsInput, LeadUncheckedUpdateWithoutPropertyInterestsInput>
    create: XOR<LeadCreateWithoutPropertyInterestsInput, LeadUncheckedCreateWithoutPropertyInterestsInput>
    where?: LeadWhereInput
  }

  export type LeadUpdateToOneWithWhereWithoutPropertyInterestsInput = {
    where?: LeadWhereInput
    data: XOR<LeadUpdateWithoutPropertyInterestsInput, LeadUncheckedUpdateWithoutPropertyInterestsInput>
  }

  export type LeadUpdateWithoutPropertyInterestsInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    propertyAddress?: StringFieldUpdateOperationsInput | string
    desiredMoveInDate?: StringFieldUpdateOperationsInput | string
    notes?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    priority?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    nextFollowUpDate?: StringFieldUpdateOperationsInput | string
    showingDate?: StringFieldUpdateOperationsInput | string
    showingTime?: StringFieldUpdateOperationsInput | string
    routeStopOrder?: IntFieldUpdateOperationsInput | number
    routeCompleted?: BoolFieldUpdateOperationsInput | boolean
    routeNote?: StringFieldUpdateOperationsInput | string
    agentNotes?: StringFieldUpdateOperationsInput | string
    createdAt?: StringFieldUpdateOperationsInput | string
    updatedAt?: StringFieldUpdateOperationsInput | string
  }

  export type LeadUncheckedUpdateWithoutPropertyInterestsInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    propertyAddress?: StringFieldUpdateOperationsInput | string
    desiredMoveInDate?: StringFieldUpdateOperationsInput | string
    notes?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    priority?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    nextFollowUpDate?: StringFieldUpdateOperationsInput | string
    showingDate?: StringFieldUpdateOperationsInput | string
    showingTime?: StringFieldUpdateOperationsInput | string
    routeStopOrder?: IntFieldUpdateOperationsInput | number
    routeCompleted?: BoolFieldUpdateOperationsInput | boolean
    routeNote?: StringFieldUpdateOperationsInput | string
    agentNotes?: StringFieldUpdateOperationsInput | string
    createdAt?: StringFieldUpdateOperationsInput | string
    updatedAt?: StringFieldUpdateOperationsInput | string
  }

  export type PropertyInterestCreateManyLeadInput = {
    id: string
    address: string
    listingTitle: string
    source: string
    listingUrl: string
    rent: string
    beds: string
    baths: string
    neighborhood: string
    status: string
    rating: number
    clientFeedback: string
    pros: string
    cons: string
    agentNotes: string
    showingDate: string
    showingTime: string
    createdAt: string
    updatedAt: string
  }

  export type PropertyInterestUpdateWithoutLeadInput = {
    id?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    listingTitle?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    listingUrl?: StringFieldUpdateOperationsInput | string
    rent?: StringFieldUpdateOperationsInput | string
    beds?: StringFieldUpdateOperationsInput | string
    baths?: StringFieldUpdateOperationsInput | string
    neighborhood?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    rating?: IntFieldUpdateOperationsInput | number
    clientFeedback?: StringFieldUpdateOperationsInput | string
    pros?: StringFieldUpdateOperationsInput | string
    cons?: StringFieldUpdateOperationsInput | string
    agentNotes?: StringFieldUpdateOperationsInput | string
    showingDate?: StringFieldUpdateOperationsInput | string
    showingTime?: StringFieldUpdateOperationsInput | string
    createdAt?: StringFieldUpdateOperationsInput | string
    updatedAt?: StringFieldUpdateOperationsInput | string
  }

  export type PropertyInterestUncheckedUpdateWithoutLeadInput = {
    id?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    listingTitle?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    listingUrl?: StringFieldUpdateOperationsInput | string
    rent?: StringFieldUpdateOperationsInput | string
    beds?: StringFieldUpdateOperationsInput | string
    baths?: StringFieldUpdateOperationsInput | string
    neighborhood?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    rating?: IntFieldUpdateOperationsInput | number
    clientFeedback?: StringFieldUpdateOperationsInput | string
    pros?: StringFieldUpdateOperationsInput | string
    cons?: StringFieldUpdateOperationsInput | string
    agentNotes?: StringFieldUpdateOperationsInput | string
    showingDate?: StringFieldUpdateOperationsInput | string
    showingTime?: StringFieldUpdateOperationsInput | string
    createdAt?: StringFieldUpdateOperationsInput | string
    updatedAt?: StringFieldUpdateOperationsInput | string
  }

  export type PropertyInterestUncheckedUpdateManyWithoutLeadInput = {
    id?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    listingTitle?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    listingUrl?: StringFieldUpdateOperationsInput | string
    rent?: StringFieldUpdateOperationsInput | string
    beds?: StringFieldUpdateOperationsInput | string
    baths?: StringFieldUpdateOperationsInput | string
    neighborhood?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    rating?: IntFieldUpdateOperationsInput | number
    clientFeedback?: StringFieldUpdateOperationsInput | string
    pros?: StringFieldUpdateOperationsInput | string
    cons?: StringFieldUpdateOperationsInput | string
    agentNotes?: StringFieldUpdateOperationsInput | string
    showingDate?: StringFieldUpdateOperationsInput | string
    showingTime?: StringFieldUpdateOperationsInput | string
    createdAt?: StringFieldUpdateOperationsInput | string
    updatedAt?: StringFieldUpdateOperationsInput | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}