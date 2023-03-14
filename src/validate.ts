import { type Schema, type KeyConfiguration } from "./interfaces";

const throwError = (err: string) => {
	throw new Error(`${err}`);
};

function get(object: object, path: string, defaultValue = null): any {
	// Convert dot notation to bracket notation
	path = path.replace(/\[(\w+)\]/g, ".$1");
	path = path.replace(/^\./, "");

	// Split path into an array of keys
	const keys = path.split(".");

	// Iterate over the keys to retrieve the value
	let result = object;
	for (const key of keys) {
		if (
			result != null &&
			Object.prototype.hasOwnProperty.call(result, key)
		) {
			result = result[key as keyof typeof result];
		} else {
			return defaultValue;
		}
	}

	return result === undefined ? defaultValue : result;
}

// obj will be the object we're testing
// schema will be the schema we're testing against
export function validate(
	obj: { [key: string]: any },
	schema: Schema,
	fullValueObject?: { [key: string]: any }
) {
	const schemaKeys = Object.keys(schema.keys);
	const requiredKeys = schemaKeys.filter(
		(k) => !schema.keys[k].schema.is_optional
	);
	const objectKeys = Object.keys(obj);

	// Check to make sure each required key is present
	requiredKeys.forEach((k) => {
		if (!objectKeys.includes(k)) {
			throwError(`Missing required key '${k}' in supplied object.`);
		}
	});

	const determinedFullValueObject = fullValueObject ? fullValueObject : obj;

	// Validate each key and its value
	objectKeys.forEach((k) => {
		const schemaConfig = schema.keys[k];
		const value = obj[k];
		validateKeyConfiguration(
			k,
			value,
			schemaConfig,
			determinedFullValueObject
		);
	});
}

const isValuePresent = (fullObject: object, target: string) => {
	// Deep parse
	const value = get(fullObject, target);
	return !(typeof value === "undefined" || value === null || value === "");
};

/**
 *
 * Purely for checking the validity of the supplied object
 * NOT the supplied configuration
 * at this point we assume the configuration is correct
 */
function validateKeyConfiguration(
	key: string,
	value: any,
	config: KeyConfiguration,
	fullValueObject: object
) {
	// Make sure required keys have a value
	if (!config.schema.is_optional) {
		if (value === null || value === undefined || value === "") {
			throwError(
				`Key '${key}' is a required field, but no value was received.`
			);
		}
	}

	if (config.validation) {
		// Lets do our ensure present checks before possible returning on null | undefined
		if (config.validation.ensure_present_if_all_present) {
			const arr = config.validation.ensure_present_if_all_present;
			const values = arr
				.map((target) => isValuePresent(fullValueObject, target))
				.filter((v) => v === true);
			const allPresent = values.length === arr.length;
			if (allPresent && !value) {
				throwError(
					`Key ${key} must have a value if keys ${arr.join(
						", "
					)} are present, received ${value}.`
				);
			}
		}

		// Lets do our ensure present checks before possible returning on null | undefined
		if (config.validation.ensure_present_if_any_present) {
			const arr = config.validation.ensure_present_if_any_present;
			const values = arr
				.map((target) => isValuePresent(fullValueObject, target))
				.filter((v) => v === true);
			const anyPresent = values.length > 0;
			if (anyPresent && !value) {
				throwError(
					`Key ${key} must have a value if any of the keys ${arr.join(
						", "
					)} are present, received ${value}.`
				);
			}
		}

		// Lets do our ensure present checks before possible returning on null | undefined
		if (config.validation.ensure_present_if_any_empty) {
			const arr = config.validation.ensure_present_if_any_empty;
			const values = arr
				.map((target) => isValuePresent(fullValueObject, target))
				.filter((v) => v === true);
			const anyEmpty = values.length !== arr.length;
			if (anyEmpty && !value) {
				throwError(
					`Key ${key} must have a value if any of the keys ${arr.join(
						", "
					)} are empty, received ${value}.`
				);
			}
		}

		// Lets do our ensure present checks before possible returning on null | undefined
		const ensurePresentIfAllEmpty =
			config.validation.ensure_present_if_all_empty;
		if (typeof ensurePresentIfAllEmpty !== "undefined") {
			const values = ensurePresentIfAllEmpty
				.map((target) => isValuePresent(fullValueObject, target))
				.filter((v) => v === true);
			const allEmpty = values.length === 0;
			if (allEmpty && !value) {
				throwError(
					`Key ${key} must have a value if all of the keys ${ensurePresentIfAllEmpty.join(
						", "
					)} are empty, received ${value}.`
				);
			}
		}

		// Lets do our ensure present checks before possible returning on null | undefined
		if (config.validation.ensure_present_if_none_empty) {
			const arr = config.validation.ensure_present_if_none_empty;
			const values = arr
				.map((target) => isValuePresent(fullValueObject, target))
				.filter((v) => v === true);
			const noneEmpty = values.length === arr.length;
			if (noneEmpty && !value) {
				throwError(
					`Key ${key} must have a value if none of the keys ${arr.join(
						", "
					)} are empty, received ${value}.`
				);
			}
		}
	}

	// If it's optional and not present, lets move on
	if (
		config.schema.is_optional &&
		(typeof value === "undefined" || value === null)
	) {
		return true;
	}

	// Make sure value is an array if it was specified
	if (config.schema.is_array) {
		if (!Array.isArray(value)) {
			throwError(
				`Key '${key}' was specified as an array field, but no array was received.`
			);
		}
	}

	// Make sure value objects are configured correctly
	if (config.schema.type !== typeof value) {
		throwError(
			`Key '${key}' was specified as type ${
				config.schema.type
			} but received ${typeof value}.`
		);
	}

	// Make sure objects and their keys obey the rules
	if (config.schema.type === "object") {
		// Exclamation point because we assume a correct configuration
		validate(value, config.schema.object_schema!, fullValueObject);
	}

	// Make sure value is part of the enum if supplied
	if (config.schema.enum) {
		if (config.schema.enum.length === 0 && value) {
			throwError(
				`Key ${key} specified an enum with no values, preventing this value from being set. Please delete the enum field, add values to the enum, or make sure this key is null or undefined.`
			);
		}
		// Lets make sure all the values in the array are in the enum
		if (Array.isArray(value)) {
			value.forEach((v) => {
				// Not sure why we have to check twice
				if (config.schema.enum) {
					if (!(config.schema.enum as any[]).includes(v)) {
						throwError(
							`Value '${v}' specified in array for key '${key}' is not an allowed value according to the supplied enum.`
						);
					}
					if (config.schema.enum.length === 0 && value.length > 0) {
						throwError(
							`Key ${key} specified an enum with no values, preventing this value from being set. Please delete the enum field, add values to the enum, or make sure this key is null or undefined.`
						);
					}
				}
			});
		}
		if (!(config.schema.enum as any[]).includes(value)) {
			throwError(
				`Key '${key}' expected a specfic value from the specified enum. Instead received '${value}'.`
			);
		}
	}

	// Make sure validations are valid
	if (config.validation) {
		// NUMBER validations
		if (config.schema.type === "number") {
			if (config.validation.min) {
				if (value < config.validation.min) {
					throwError(
						`Key '${key}' has a minimum value of '${config.validation.min}' but received '${value}'.`
					);
				}
			}
			if (config.validation.max) {
				if (value > config.validation.max) {
					throwError(
						`Key '${key}' has a maximum value of '${config.validation.max}' but received '${value}'.`
					);
				}
			}
		}

		// STRING and ARRAY validations
		if (config.schema.type === "string" || Array.isArray(value)) {
			if (config.validation.length) {
				if (value.length !== config.validation.length) {
					throwError(
						`Key '${key}' should have an exact length of ${config.validation.length}, but received ${value.length}.`
					);
				}
			}
			if (config.validation.max_length) {
				if (value.length > config.validation.max_length) {
					throwError(
						`Key '${key}' should not exceed a length of ${config.validation.max_length}, but received ${value.length}.`
					);
				}
			}
			if (config.validation.min_length) {
				if (value.length < config.validation.min_length) {
					throwError(
						`Key '${key}' should not have a length less than ${config.validation.max_length}, but received ${value.length}.`
					);
				}
			}
		}

		if (config.validation.equals) {
			if (value !== config.validation.equals) {
				throwError(
					`Key '${key}' should equal '${config.validation.equals}'.`
				);
			}
		}
		if (config.validation.is_not) {
			if (value === config.validation.equals) {
				throwError(
					`Key '${key}' should not equal '${config.validation.is_not}'.`
				);
			}
		}

		if (config.validation.is_email) {
			// Make sure there is a . and an @
			if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
				throwError(
					`Key '${key}' was specified to be an email but received '${value}'.`
				);
			}
			// Make sure the @ comes before the .
			if (value.indexOf("@") > value.indexOf(".")) {
				throwError(
					`Key '${key}' was passed an invalid email '${value}'.`
				);
			}
			const domain = value.substring(
				value.indexOf("@") + 1,
				value.lastIndexOf(".")
			);
			const tld = value.substring(value.lastIndexOf(".") + 1);
			// No characters in between @ and .
			if (!domain) {
				throwError(
					`Key '${key}' was passed an invalid email '${value}'.`
				);
			}
			if (typeof config.validation.is_email === "object") {
				if (config.validation.is_email?.forbidden_domains) {
					if (
						config.validation.is_email?.forbidden_domains.includes(
							domain
						)
					) {
						throwError(
							`Key '${key}' was passed an email with a forbidden domain '${domain}'.`
						);
					}
				}
				if (config.validation.is_email?.forbidden_tlds) {
					if (
						config.validation.is_email?.forbidden_tlds.includes(tld)
					) {
						throwError(
							`Key '${key}' was passed an email with an invalid TLD '${tld}'.`
						);
					}
				}
			}
		}

		if (config.validation.is_phone) {
			if (typeof config.validation.is_phone === "object") {
				if (config.validation.is_phone.include_country_code) {
					if (!/^\+?\d+$/.test(value) || value.charAt(0) !== "+") {
						throwError(
							`Phone number must be a string consisting of numbers and a country code denoted with a '+' at the beginning, received '${value}'.`
						);
					}
				}
			} else {
				if (!/^\d+$/.test(value)) {
					throwError(
						`Phone number must be a string consisting only of numbers, received '${value}'.`
					);
				}
			}
		}
	}

	return true;
}

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
		return throwError(
			`'${fieldName}' must not be set in key '${key}' ${why}.`
		);
	}
	return true;
}

/**
 * Recursively traverse an object's keys and ensure each is okay
 */
export function validateSchema(schema: Schema) {
	// Loop through each key and validate its schema
	for (const [k, keySchema] of Object.entries(schema.keys)) {
		validateKeySchema(k, keySchema);
	}
	return true;
}

/**
 * Function we can check a keys configuration object
 */
function validateKeySchema(key: string, config: KeyConfiguration) {
	const { schema, validation } = config;

	// Lets set the key so we don't have to keep doing it
	const ensureFieldNotSet = (
		fieldName: string,
		value: unknown,
		why: string
	) => fieldMustNotBeSet(key, fieldName, value, why);
	const ensureFieldSet = (fieldName: string, value: unknown, why: string) =>
		fieldMustBeSet(key, fieldName, value, why);

	ensureFieldSet("schema.type", schema?.type, "; field is required");

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
		validateKeyConfiguration(key, schema.default_value, config, {});
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
