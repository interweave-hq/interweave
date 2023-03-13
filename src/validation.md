# Validation

These are the rules we check to ensure that a schema object was configured correctly.

## Rules

if schema.is_optional is false, these fields can't be set

-   validation.ensure_empty_if_any_present
-   validation.ensure_empty_if_all_present
-   validation.ensure_empty_if_all_empty
-   validation.ensure_empty_if_any_empty
-   validation.ensure_empty_if_none_empty

if schema.type is string, these fields cant be set

-   validation.min
-   validation.max

if schema.type is a number, these fields cant be set

-   validation.is_email
-   validation.is_phone.include_country_code

if schema.type is object, these fields must be set

-   schema.object_schema

if schema.type is object, these fields must not be set

-   schema.enum
-   validation.min
-   validation.max
-   validation.equals
-   validation.is_email
-   validation.is_phone

if schema.type is boolean, these fields must not be set

-   schema.enum
-   validation.min
-   validation.max
-   validation.is_email
-   validation.is_phone

schema.defaultValue passes validation

if schema.type isnt string and is_array is false, these feilds must not be set

-   validation.length
-   validation.min_length
-   validation.max_length
