import {
	type Schema,
	type KeyConfiguration,
	type Request,
	type Error,
	type SchemaKeys,
} from "./interfaces";
import {
	validate,
	type ExternalValidateOptions as ValidateOptions,
	type ErrorsReturnObject,
} from "./validate";
import { validateSchema } from "./validateSchema";
import { buildInterface } from "./sync";

export {
	// From interfaces
	type Schema,
	type KeyConfiguration,
	type Request,
	type Error,
	type SchemaKeys,
	// From validate()
	type ValidateOptions,
	type ErrorsReturnObject,
};
export { buildInterface, validate, validateSchema };
