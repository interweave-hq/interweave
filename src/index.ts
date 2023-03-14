import {
	type Schema,
	type KeyConfiguration,
	type Request,
	type Error,
} from "./interfaces";
import { validate, validateSchema } from "./validate";
import { buildInterface } from "./sync";

export { type Schema, type KeyConfiguration, type Request, type Error };
export { buildInterface, validate, validateSchema };
