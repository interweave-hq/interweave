import {
	InterfaceConfiguration,
	type FieldConfiguration,
	type Fields,
} from "./interfaces";
import { validateFieldValue } from "./validate";

const throwError = (err: string) => {
	throw new Error(`${err}`);
};

function fieldMustNotBeSet(
	key: string,
	fieldName: string,
	value: unknown,
	why: string
) {
	if (Array.isArray(value)) {
		if (value.length > 0) {
			return throwError(
				`'${fieldName}' must not be set in key '${key}' ${why}.`
			);
		}
		return true;
	}
	if (
		typeof value === "undefined" ||
		value === null ||
		value === "" ||
		value === false
	) {
		return true;
	}
	return throwError(`'${fieldName}' must not be set in key '${key}' ${why}.`);
}

function fieldMustBeSet(
	key: string,
	fieldName: string,
	value: unknown,
	why: string
) {
	if (Array.isArray(value)) {
		if (value.length <= 0) {
			return throwError(
				`'${fieldName}' must be set in key '${key}' ${why}.`
			);
		}
	}
	if (
		typeof value === "undefined" ||
		value === null ||
		value === "" ||
		value === false
	) {
		return throwError(`'${fieldName}' must be set in key '${key}' ${why}.`);
	}
	return true;
}

/**
 * Recursively traverse an object's keys and ensure each is okay
 */
export function validateConfiguration(config: InterfaceConfiguration) {
	// Extra checks on access, authentication, key, title, description
	// ...

	// Loop through each key and validate its schema
	validateFields(config.fields);
	return true;
}

/**
 * Recursively traverse an object's fields and ensure each is okay
 */
export function validateFields(fields: Fields) {
	// Loop through each key and validate its schema
	for (const [fieldName, fieldConfiguration] of Object.entries(fields)) {
		validateFieldConfiguration(fieldName, fieldConfiguration);
	}
	return true;
}

/**
 * Function we can check a keys configuration object
 */
function validateFieldConfiguration(key: string, config: FieldConfiguration) {
	const { schema, validation } = config;

	// Lets set the key so we don't have to keep doing it
	const ensureFieldNotSet = (
		fieldName: string,
		value: unknown,
		why: string
	) => fieldMustNotBeSet(key, fieldName, value, why);
	const ensureFieldSet = (fieldName: string, value: unknown, why: string) =>
		fieldMustBeSet(key, fieldName, value, why);

	ensureFieldSet("schema.type", schema?.type, "- field is required");

	if (!schema.is_optional) {
		const reason = "if schema.is_optional is false";
		ensureFieldNotSet(
			"validation.ensure_empty_if_any_present",
			validation?.ensure_empty_if_any_present,
			reason
		);
		ensureFieldNotSet(
			"validation.ensure_empty_if_all_present",
			validation?.ensure_empty_if_all_present,
			reason
		);
		ensureFieldNotSet(
			"validation.ensure_empty_if_all_empty",
			validation?.ensure_empty_if_all_empty,
			reason
		);
		ensureFieldNotSet(
			"validation.ensure_empty_if_any_empty",
			validation?.ensure_empty_if_any_empty,
			reason
		);
		ensureFieldNotSet(
			"validation.ensure_empty_if_none_empty",
			validation?.ensure_empty_if_none_empty,
			reason
		);
	}

	if (schema.type === "string") {
		const reason = "if schema.type is string";
		ensureFieldNotSet("validation.min", validation?.min, reason);
		ensureFieldNotSet("validation.max", validation?.max, reason);
	}

	if (schema.type === "number") {
		const reason = "if schema.type is number";
		ensureFieldNotSet("validation.is_email", validation?.is_email, reason);
		if (typeof validation?.is_phone !== "undefined") {
			if (typeof validation.is_phone === "object") {
				ensureFieldNotSet(
					"validation.is_phone.include_country_code",
					validation?.is_phone?.include_country_code,
					reason
				);
			}
		}
		ensureFieldNotSet("validation.is_phone", validation?.is_phone, reason);
	}

	if (schema.type === "object") {
		// Check recursive fields inside the nested Schema
		if (schema.object_schema) {
			validateFields(schema.object_schema);
		}
		const reason = "if schema.type is number";
		ensureFieldNotSet("schema.enum", schema?.enum, reason);
		ensureFieldNotSet("validation.min", validation?.min, reason);
		ensureFieldNotSet("validation.max", validation?.max, reason);
		ensureFieldNotSet("validation.equals", validation?.equals, reason);
		ensureFieldNotSet("validation.is_email", validation?.is_email, reason);
		ensureFieldNotSet("validation.is_phone", validation?.is_phone, reason);
		ensureFieldSet("schema.object_schema", schema?.object_schema, reason);
	}

	if (schema.type === "boolean") {
		const reason = "if schema.type is boolean";
		ensureFieldNotSet("schema.enum", schema?.enum, reason);
		ensureFieldNotSet("validation.min", validation?.min, reason);
		ensureFieldNotSet("validation.max", validation?.max, reason);
		ensureFieldNotSet("validation.is_email", validation?.is_email, reason);
		ensureFieldNotSet("validation.is_phone", validation?.is_phone, reason);
	}

	// Let's make sure the default value obeys our rules
	if (schema.default_value) {
		validateFieldValue(key, schema.default_value, config, {});
	}

	// length, min_length, and max_length only available on strings and arrays
	if (schema.type !== "string" && !schema.is_array) {
		const reason = "if type isn't string and is not an array";
		ensureFieldNotSet("validation.length", validation?.length, reason);
		ensureFieldNotSet(
			"validation.min_length",
			validation?.min_length,
			reason
		);
		ensureFieldNotSet(
			"validation.max_length",
			validation?.max_length,
			reason
		);
	}
	return true;
}
