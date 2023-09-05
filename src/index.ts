import {
	type InterfaceConfiguration,
	type FieldConfiguration,
	type Request,
	type Error,
	type Fields,
	type Permissions,
	type PermissionValue,
	type Users,
	type DataSource,
	type Parameter,
	type StaticDataSource,
	type FieldType,
	type PrivacySetting,
} from "./interfaces";
import {
	validate,
	type ExternalValidateOptions as ValidateOptions,
	type ErrorsReturnObject,
} from "./validate";
import { validateConfiguration, validateFields } from "./validateConfig";
import { buildInterface } from "./sync";

export {
	// From interfaces
	type InterfaceConfiguration,
	type FieldConfiguration,
	type Request,
	type Error,
	type Fields,
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
	type PrivacySetting,
};
export { buildInterface, validate, validateConfiguration, validateFields };
