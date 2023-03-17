# Interweave

Interweave is a platform for creating user interfaces from static JSON. The Interweave configuration objects are meant to be checked into version control and tied closely to database and API changes.

## `validate`

The `validate()' function is a good way to test an object against your configuration. This is useful for validating user input from forms and requests.

```js
import { validate } from "@interweave/interweave";

// Validate and throw any errors to a console immediately
// Good for using in a build pipeline
validate(object, schema);

// Run and collect errors to an object
// Good for forms and handling form errors
const errorsObject = validate(object, schema, { returnErrors: true });
```

## Architecture

### Flattening and expanding

We will take nested objects, flatten them down into their keys

```js
{
    title: "Some Title",
    description: "some description",
    author: {
        name: "mike"
    }
}
```

Error and form object becomes:

```js
{
    title: "Some Title",
    description: "some description",
    "author.name": "mike"
}
```

Then we use those keys to expand back into a wider object before submission:

```js
{
    title: "Some Title",
    description: "some description",
    author: {
        name: "mike"
    }
}
```
