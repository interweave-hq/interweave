import {
	type Schema,
	type KeyConfiguration,
	type Request,
	type Error,
	type SchemaKeys,
	type Permissions,
	type PermissionValue,
	type Users,
	type DataSource,
	type Parameter,
	type StaticDataSource,
	type FieldType,
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
	type Permissions,
	type PermissionValue,
	type Users,
	type DataSource,
	type Parameter,
	// From validate()
	type ValidateOptions,
	type ErrorsReturnObject,
	type StaticDataSource,
	type FieldType,
};
export { buildInterface, validate, validateSchema };
