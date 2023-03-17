# Interweave

Interweave is a platform for creating user interfaces from static JSON. The Interweave configuration objects are meant to be checked into version control and tied closely to database and API changes.

## Flattening and expanding

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
