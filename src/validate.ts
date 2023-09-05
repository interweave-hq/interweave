import { arraysAreEqual, isEmpty, isValuePresent } from "./helpers";
import {
	InterfaceConfiguration,
	type FieldConfiguration,
	type Fields,
} from "./interfaces";
import { get } from "./helpers";

const throwError = (err: string) => {
	throw new Error(`${err}`);
};

interface ValidateOptions {
	/**
	 * Whether to return an object of keys and their errors
	 */
	returnErrors?: boolean;

	/**
	 * Specify the wider object so that we may properly look for dependent fields
	 */
	fullValueObject?: Record<string, unknown>;

	/**
	 * recursive
	 */
	recursiveOpts?: {
		/**
		 * Errors object for recursively handling the store
		 */
		errorsObj?: ErrorsReturnObject;
		/**
		 * Path of the key
		 */
		path?: string;
	};
	/**
	 * Fields object to assist with
	 */
	allFields?: Fields;
}
export type ExternalValidateOptions = Omit<ValidateOptions, "recursiveOpts">;

export interface ErrorsReturnObject {
	didError: boolean;
	keys: {
		[key: string]: {
			errors: string[];
			requiredAndMissing?: boolean;
		};
	};
}

/**
 * Validate a new object against your configuration
 * obj = the object we're testing
 * configuration = the Interface Configuration we're testing against
 */
export function validate(
	obj: Record<any, unknown>,
	configuration: InterfaceConfiguration,
	opts?: ValidateOptions
) {
	const fields = configuration.fields;
	const schemaKeys = Object.keys(fields);
	const requiredKeys = schemaKeys.filter(
		(k) =>
			!fields[k].schema.is_optional &&
			// Hiding the form element disables validation
			!fields[k].interface?.form?.hidden
	);
	const objectKeys = Object.keys(obj);

	// Handle storing all errors
	// This object doesn't get passed around but the function that sets this does
	// We pass the errors object back and forth to maintain the store as we pass through recursive steps
	const errorsReturnObject: ErrorsReturnObject = opts?.recursiveOpts
		?.errorsObj
		? opts.recursiveOpts.errorsObj
		: {
				didError: false,
				keys: {},
		  };

	// Controls setting the errors in our store
	const setErrorInReturnObject = (
		/**
		 * Key to set in the object
		 */
		key: string,
		/**
		 * Error that was encountered
		 */
		err: string,
		/**
		 * Whether or not this field was required AND missing
		 * This will help us control frontend errors
		 */
		requiredAndMissing?: boolean
	) => {
		// Let it be known that this validation has failed
		errorsReturnObject.didError = true;

		// Set to an object if the key doesn't have anything set yet
		if (typeof errorsReturnObject.keys[key] !== "object") {
			errorsReturnObject.keys[key] = {
				errors: [],
				requiredAndMissing: false,
			};
		}
		// Shorten access to path
		// Can't move this above becuase we get yelled at for resetting a const
		const fieldInErrorObject = errorsReturnObject.keys[key];

		// Keep track of the missing required field
		if (requiredAndMissing) {
			fieldInErrorObject.requiredAndMissing = true;
		}

		// Add the error to the errors array
		// Set the errors array if no array exists yet
		if (fieldInErrorObject.errors) {
			fieldInErrorObject.errors.push(err);
		} else {
			fieldInErrorObject.errors = [err];
		}
		return;
	};
	const errorFn = opts?.returnErrors ? setErrorInReturnObject : throwError;

	// Check to make sure each required key is present
	// In general, it sucks that we have to put the function here
	// It'd serve much better not here, but we won't have access to the full Schema in the function below
	// Some fields may not be present, so we have to loop through the schema looking for missing keys
	// Can't do that in reverse
	requiredKeys.forEach((k) => {
		const val = obj[k];
		if (isEmpty(val)) {
			// Check to make sure if there is an outKey specified, and that there is a value present
			const potentialOutKey = fields[k].interface?.form?.out_key;
			if (potentialOutKey) {
				const newVal = obj[potentialOutKey];
				if (!isEmpty(newVal)) {
					return;
				}
			}

			const errString = `Missing required key '${k}' in supplied object.`;
			const targetKey = opts?.recursiveOpts?.path
				? `${opts?.recursiveOpts?.path}.${k}`
				: k;
			if (opts?.returnErrors) {
				errorFn(targetKey, errString, true);
			} else {
				throwError(errString);
			}
		}
	});

	// Specify the wider object so that we may properly look for dependent fields
	// This will be the full object, NOT a subset as we move recursively through
	const determinedFullValueObject = opts?.fullValueObject
		? opts?.fullValueObject
		: obj;

	// Validate each key and its value
	objectKeys.forEach((k) => {
		let outKey = null;
		let schemaConfig = fields[k];

		/**
		 * Target key is how we handle nested keys so we can give a proper error
		 * We combine via the .
		 * So an object like { parent: { nested: Schema } }
		 * Will produce the key in the errorObj: parent.nested
		 */
		const targetKey = opts?.recursiveOpts?.path
			? `${opts?.recursiveOpts?.path}.${k}`
			: k;

		/**
		 * If they use an outKey, the key won't match a schemaConfig
		 * So let's try to manually find it based on the outKey
		 */
		if (!schemaConfig) {
			// If you can't find the key config, look for the outKey
			const fieldsArr = Object.keys(fields);
			const correctKey = fieldsArr.find(
				(k) => fields[k].interface?.form?.out_key === k
			);
			if (!correctKey) {
				return;
			}
			outKey = fields[correctKey].interface?.form?.out_key;
			schemaConfig = fields[correctKey];
		}

		const value = outKey ? obj[outKey] : obj[k];

		validateFieldValue(
			/**
			 * Target key will be the name / key
			 */
			targetKey,
			/**
			 * Value from our value object
			 */
			value,
			/**
			 * Schema will be the schema config for this interface
			 */
			schemaConfig,
			/**
			 * Full value object will be used for validating dependent fields
			 * Like the emptyIfPresent etc, they need to know the full value object
			 */
			determinedFullValueObject,
			{
				/**
				 * Pass the target key and the error in
				 */
				onError: (err) => errorFn(targetKey, err),
				/**
				 * Keep the same errors object floating back and forth so we handle recursive object checks with the same obj
				 */
				recursiveOpts: {
					errorsObj: errorsReturnObject,
				},
			}
		);
	});

	if (opts?.returnErrors) {
		return errorsReturnObject;
	}
}

interface ValidateKeyConfigurationOptions {
	onError?: (err: string) => any;
	recursiveOpts?: {
		path?: string;
		errorsObj?: ErrorsReturnObject;
	};
}
/**
 *
 * Purely for checking the validity of the supplied object
 * NOT the supplied configuration
 * at this point we assume the configuration is correct
 */
export function validateFieldValue(
	key: string,
	value: any,
	config: FieldConfiguration,
	fullValueObject: Record<string, unknown>,
	opts?: ValidateKeyConfigurationOptions
) {
	// Override error function
	const error = opts?.onError || throwError;

	// Hiding the field in a form removes it from the validation cycle
	if (config?.interface?.form?.hidden) {
		return true;
	}

	// Make sure required fields have a value
	if (!config.schema.is_optional) {
		if (value === null || value === undefined || value === "") {
			error(
				`Key '${key}' is a required field, but no value was received.`
			);
		}
	}

	// Make sure value is an array if it was specified
	const expectsArray = config.schema.is_array;
	if (expectsArray) {
		if (!Array.isArray(value)) {
			error(
				`Key '${key}' was specified as an array field, but an array was not received.`
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
				error(
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
				error(
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
				error(
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
				error(
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
				error(
					`Key ${key} must have a value if none of the keys ${arr.join(
						", "
					)} are empty, received ${value}.`
				);
			}
		}

		// Make sure a key is present if some other key equals X value
		if (config.validation.ensure_present_if_key_equals) {
			const target = config.validation.ensure_present_if_key_equals;
			const targetKey = target.key;
			const targetValue = target.value;
			const actualValue = get(fullValueObject, targetKey);
			let conditionTrue = actualValue === targetValue;

			const isActualArray = Array.isArray(actualValue);
			const isTargetArray = Array.isArray(targetValue);

			// Do a deep equality to make sure arrays are equal
			if (isActualArray && isTargetArray) {
				if (arraysAreEqual(targetValue, actualValue)) {
					conditionTrue = true;
				}
			}

			// This shouldn't happen and should get caught in the schema validator first
			if (isActualArray && !isTargetArray) {
				error(
					`Invalid key configuration for key ${key} in field 'ensure_present_if_key_equals'. The returned`
				);
				// conditionTrue = true;
			}

			if (!isActualArray && isTargetArray) {
				// @ts-expect-error
				if (targetValue.includes(actualValue)) {
					conditionTrue = true;
				}
			}

			if (!isActualArray && !isTargetArray) {
				if (targetValue === actualValue) {
					conditionTrue = true;
				}
			}

			if (conditionTrue) {
				if (isEmpty(value)) {
					error(
						`${key} must have a value when ${targetKey} has a value of ${targetValue}`
					);
				}
			}
		}

		// Make sure a key is present if some other key equals X value
		if (config.validation.ensure_empty_if_key_equals) {
			const target = config.validation.ensure_empty_if_key_equals;
			const targetKey = target.key;
			const targetValue = target.value;
			const actualValue = get(fullValueObject, targetKey);
			let conditionTrue = actualValue === targetValue;

			const isActualArray = Array.isArray(actualValue);
			const isTargetArray = Array.isArray(targetValue);

			// Do a deep equality to make sure arrays are equal
			if (isActualArray && isTargetArray) {
				if (arraysAreEqual(targetValue, actualValue)) {
					conditionTrue = true;
				}
			}

			// This shouldn't happen and should get caught in the schema validator first
			if (isActualArray && !isTargetArray) {
				error(
					`Invalid key configuration for key ${key} in field 'ensure_present_if_key_equals'. The returned`
				);
				// conditionTrue = true;
			}

			if (!isActualArray && isTargetArray) {
				// @ts-expect-error
				if (targetValue.includes(actualValue)) {
					conditionTrue = true;
				}
			}

			if (!isActualArray && !isTargetArray) {
				if (targetValue === actualValue) {
					conditionTrue = true;
				}
			}

			if (conditionTrue) {
				if (!isEmpty(value)) {
					error(
						`${key} must not have a value when ${targetKey} has a value of ${targetValue}`
					);
				}
			}
		}
	}

	// If it's optional and not present, lets move on
	if (config.schema.is_optional && isEmpty(value)) {
		return true;
	}

	// Make sure value objects are configured correctly
	const validArrayType = expectsArray && Array.isArray(value);
	const type = config.schema.type;
	const schemaType = expectsArray ? "array" : config.schema.type;
	// these all qualify as string types under the hood
	if (
		type === "string" ||
		type === "date" ||
		type === "time" ||
		type === "datetime"
	) {
		if (typeof value !== "string" && !validArrayType) {
			error(
				`Key '${key}' was specified as type ${schemaType} but received ${
					Array.isArray(value) ? "array" : typeof value
				}.`
			);
		}
	} else if (type !== typeof value && !validArrayType) {
		// Handle config.schema saying array instad of object
		error(
			`Key '${key}' was specified as type ${schemaType} but received ${
				Array.isArray(value) ? "array" : typeof value
			}.`
		);
	}

	// Make sure objects and their keys obey the rules
	if (config.schema.type === "object") {
		// Exclamation point because we assume a correct configuration
		const path = opts?.recursiveOpts?.path
			? `${opts?.recursiveOpts?.path}.${key}`
			: key;
		validate(
			value,
			// object_schema is type Fields, but we do this recursively
			// This validate() function doesn't need the other fields, but feels better API-wise
			// So this cast has no real impact, but gets things working
			config.schema.object_schema as unknown as InterfaceConfiguration,
			{
				recursiveOpts: {
					path,
					errorsObj: opts?.recursiveOpts?.errorsObj,
				},
				returnErrors: true,
				fullValueObject: fullValueObject,
			}
		);
	}

	// Make sure value is part of the enum if supplied
	if (config.schema.enum) {
		const enumIsObject = typeof config.schema.enum[0] === "object";
		const enumValues = enumIsObject
			? // @ts-expect-error
			  config.schema.enum.map((v) => v.value)
			: config.schema.enum;
		if (enumValues.length === 0 && value) {
			error(
				`Key ${key} specified an enum with no values, preventing this value from being set. Please delete the enum field, add values to the enum, or make sure this key is null or undefined.`
			);
		}
		// Lets make sure all the values in the array are in the enum
		if (Array.isArray(value)) {
			value.forEach((v) => {
				// Not sure why we have to check twice
				if (enumValues) {
					if (!enumValues.includes(v)) {
						error(
							`Value '${v}' specified in array for key '${key}' is not an allowed value according to the supplied enum.`
						);
					}
					if (enumValues.length === 0 && value.length > 0) {
						error(
							`Key ${key} specified an enum with no values, preventing this value from being set. Please delete the enum field, add values to the enum, or make sure this key is null or undefined.`
						);
					}
				}
			});
		}
		if (!Array.isArray(value)) {
			if (!enumValues.includes(value)) {
				error(
					`Key '${key}' expected a specfic value from the specified enum. Instead received '${value}'.`
				);
			}
		}
	}

	// Make sure validations are valid
	if (config.validation) {
		// NUMBER validations
		if (config.schema.type === "number") {
			if (config.validation.min) {
				if (value < config.validation.min) {
					error(
						`Key '${key}' has a minimum value of '${config.validation.min}' but received '${value}'.`
					);
				}
			}
			if (config.validation.max) {
				if (value > config.validation.max) {
					error(
						`Key '${key}' has a maximum value of '${config.validation.max}' but received '${value}'.`
					);
				}
			}
		}

		// STRING and ARRAY validations
		if (config.schema.type === "string" || Array.isArray(value)) {
			if (config.validation.length) {
				if (value?.length !== config.validation.length) {
					error(
						`Key '${key}' should have an exact length of ${config.validation.length}, but received ${value.length}.`
					);
				}
			}
			// Handle friendly error if both are present
			// Let's give them a range to work with
			if (config.validation.min_length && config.validation.max_length) {
				if (
					value?.length < config.validation.min_length ||
					value?.length > config.validation.max_length
				) {
					error(
						`Key '${key}' should have a length between ${config.validation.min_length} and ${config.validation.max_length} characters, but received ${value.length} characters.`
					);
				}
			} else {
				if (config.validation.max_length) {
					if (value?.length > config.validation.max_length) {
						error(
							`Key '${key}' should not exceed a length of ${config.validation.max_length}, but received ${value.length}.`
						);
					}
				}
				if (config.validation.min_length) {
					if (value?.length < config.validation.min_length) {
						error(
							`Key '${key}' should not have a length less than ${config.validation.min_length}, but received ${value.length}.`
						);
					}
				}
			}
		}

		if (config.validation.equals) {
			if (value !== config.validation.equals) {
				error(
					`Key '${key}' should equal '${config.validation.equals}'.`
				);
			}
		}
		if (config.validation.is_not) {
			if (value === config.validation.equals) {
				error(
					`Key '${key}' should not equal '${config.validation.is_not}'.`
				);
			}
		}

		if (config.validation.is_email) {
			// Make sure there is a . and an @
			if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
				error(
					`Key '${key}' was specified to be an email but received '${value}'.`
				);
			}
			// Make sure the @ comes before the .
			if (value?.indexOf("@") > value?.indexOf(".")) {
				error(`Key '${key}' was passed an invalid email '${value}'.`);
			}
			const domain = value?.substring(
				value?.indexOf("@") + 1,
				value?.lastIndexOf(".")
			);
			const tld = value?.substring(value?.lastIndexOf(".") + 1);
			// No characters in between @ and .
			if (!domain) {
				error(`Key '${key}' was passed an invalid email '${value}'.`);
			}
			if (typeof config.validation.is_email === "object") {
				if (config.validation.is_email?.forbidden_domains) {
					if (
						config.validation.is_email?.forbidden_domains.includes(
							domain
						)
					) {
						error(
							`Key '${key}' was passed an email with a forbidden domain '${domain}'.`
						);
					}
				}
				if (config.validation.is_email?.forbidden_tlds) {
					if (
						config.validation.is_email?.forbidden_tlds.includes(tld)
					) {
						error(
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
						error(
							`Phone number must be a string consisting of numbers and a country code denoted with a '+' at the beginning, received '${value}'.`
						);
					}
				}
			} else {
				if (!/^\d+$/.test(value)) {
					error(
						`Phone number must be a string consisting only of numbers, received '${value}'.`
					);
				}
			}
		}
	}

	return true;
}
