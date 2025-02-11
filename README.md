This is a fork of the official [json-typedef-js](https://github.com/jsontypedef/json-typedef-js) that provides improved ESM support while (hopefully) maintaining compatibility with legacy CommonJS stuff.

# jtd: JSON Validation for JavaScript

[![npm](https://img.shields.io/npm/v/jtd)](https://www.npmjs.com/package/jtd)

[JSON Type Definition](https://jsontypedef.com), aka [RFC
8927](https://tools.ietf.org/html/rfc8927), is an easy-to-learn, standardized
way to define a schema for JSON data. You can use JSON Typedef to portably
validate data across programming languages, create dummy data, generate code,
and more.

This `jtd` package is a JavaScript / TypeScript implementation of JSON Type
Definition. It lets you validate input data against JSON Type Definition
schemas. `jtd` works in Node.js and web browsers.

If you're looking to generate code from schemas, check out ["Generating
TypeScript from JSON Typedef schemas"][jtd-ts-codegen] in the JSON Typedef docs.

## Installation

You can install this package with `npm`:

```bash
npm install jtd
```

Or with `yarn`:

```bash
yarn add jtd
```

## Documentation

Detailed API documentation is available online at:

https://jsontypedef.github.io/json-typedef-js/index.html

For more high-level documentation about JSON Typedef in general, or JSON Typedef
in combination with JavaScript in particular, see:

- [The JSON Typedef Website][jtd]
- ["Generating TypeScript from JSON Typedef Schemas"][jtd-ts-codegen]

## Basic Usage

Here's an example of how you can use this package to validate JSON data against
a JSON Typedef schema:

```ts
import { Schema, validate } from "jtd";

// You can leave out the "as Schema" part at the end if you're using JavaScript
// and not TypeScript.
const schema = {
  properties: {
    name: { type: "string" },
    age: { type: "uint32" },
    phones: {
      elements: { type: "string" },
    },
  },
} as Schema;

// jtd.validate returns an array of validation errors. If there were no problems
// with the input, it returns an empty array.

// Outputs: []
console.log(
  validate(schema, {
    name: "John Doe",
    age: 43,
    phones: ["+44 1234567", "+44 2345678"],
  })
);

// This next input has three problems with it:
//
// 1. It's missing "name", which is a required property.
// 2. "age" is a string, but it should be an integer.
// 3. "phones[1]" is a number, but it should be a string.
//
// Each of those errors corresponds to one of the errors returned by validate.

// Outputs:
//
// [
//   { instancePath: [], schemaPath: [ 'properties', 'name' ] },
//   {
//     instancePath: [ 'age' ],
//     schemaPath: [ 'properties', 'age', 'type' ]
//   },
//   {
//     instancePath: [ 'phones', '1' ],
//     schemaPath: [ 'properties', 'phones', 'elements', 'type' ]
//   }
// ]
console.log(
  validate(schema, {
    age: "43",
    phones: ["+44 1234567", 442345678],
  })
);
```

## Advanced Usage: Limiting Errors Returned

By default, `jtd.validate` returns every error it finds. If you just care about
whether there are any errors at all, or if you can't show more than some number
of errors, then you can get better performance out of `jtd.validate` using the
`maxErrors` option.

For example, taking the same example from before, but limiting it to 1 error, we
get:

```ts
// Outputs:
//
// [ { instancePath: [], schemaPath: [ 'properties', 'name' ] } ]
console.log(
  validate(
    schema,
    {
      age: "43",
      phones: ["+44 1234567", 442345678],
    },
    { maxErrors: 1 }
  )
);
```

## Advanced Usage: Handling Untrusted Schemas

If you want to run `jtd` against a schema that you don't trust, then you should:

1. Ensure the schema is well-formed, using `jtd.isSchema` and
   `jtd.isValidSchema`. `isSchema` does basic "type" checking (and in
   TypeScript, it acts as a type guard for the `Schema` type), while
   `isValidSchema` validates things like making sure all `ref`s have
   corresponding definitions.

2. Call `jtd.validate` with the `maxDepth` option. JSON Typedef lets you write
   recursive schemas -- if you're evaluating against untrusted schemas, you
   might go into an infinite loop when evaluating against a malicious input,
   such as this one:

   ```json
   {
     "ref": "loop",
     "definitions": {
       "loop": {
         "ref": "loop"
       }
     }
   }
   ```

   The `maxDepth` option tells `jtd.validate` how many `ref`s to follow
   recursively before giving up and throwing `jtd.MaxDepthExceededError`.

Here's an example of how you can use `jtd` to evaluate data against an untrusted
schema:

```ts
import { isSchema, isValidSchema, Schema, validate } from "jtd";

// validateUntrusted returns true if `data` satisfies `schema`, and false if it
// does not. Throws an error if `schema` is invalid, or if validation goes in an
// infinite loop.
function validateUntrusted(schema: unknown, data: unknown): boolean {
  if (!isSchema(schema) || !isValidSchema(schema)) {
    throw new Error("invalid schema");
  }

  // You should tune maxDepth to be high enough that most legitimate schemas
  // evaluate without errors, but low enough that an attacker cannot cause a
  // denial of service attack.
  return validate(schema, data, { maxDepth: 32 }).length === 0;
}

// Returns true
validateUntrusted({ type: "string" }, "foo");

// Returns false
validateUntrusted({ type: "string" }, null);

// Throws "invalid schema"
validateUntrusted({ type: "nonsense" }, null);

// Throws an instance of jtd.MaxDepthExceededError
validateUntrusted(
  {
    ref: "loop",
    definitions: {
      loop: {
        ref: "loop",
      },
    },
  },
  null
);
```

[jtd]: https://jsontypedef.com
[jtd-ts-codegen]: https://jsontypedef.com/docs/typescript-codegen/
