export interface Error {
	for_developer: string;
	for_user: string;
	remedy_instructions?: string;
	// can make this HttpStatusCodes
	status?: number;
}

type ValidationOption<T> =
	| T
	| {
			error: string | Error;
			value: T;
	  };

export interface KeyConfiguration {
	schema: {
		// We need to expand this to support more DB types
		// Coordinates, DateTime, Time, Float, Integer
		type: "string" | "number" | "boolean" | "object";
		is_optional?: boolean;
		is_array?: boolean;
		object_schema?: Schema;
		// These can be done by hand for now
		// extend?: KeyConfiguration;
		// omit?: string[];
		// partial?: string[];
		enum?: string[] | number[];
		default_value?: any;
	};
	validation?: {
		/**
		 * Minimum number value
		 */
		min?: ValidationOption<number>;
		/**
		 * Maximum number value
		 */
		max?: ValidationOption<number>;
		/**
		 * Maximum number value
		 */
		equals?: ValidationOption<number | string | boolean>;
		/**
		 * Maximum number value
		 */
		is_not?: ValidationOption<number | string | boolean>;
		/**
		 * The length this string or array must equal
		 */
		length?: ValidationOption<number>;
		/**
		 * Minimum length of array or string
		 */
		min_length?: ValidationOption<number>;
		/**
		 * Maximum length of array or string
		 */
		max_length?: ValidationOption<number>;
		/**
		 * String must be email format
		 */
		is_email?:
			| true
			| {
					/**
					 * Domains to forbid from passing validation
					 */
					forbidden_domains?: string[];
					/**
					 * TLDs to forbid from passing validation
					 * e.g. ['com', 'io', 'af']
					 */
					forbidden_tlds?: string[];
			  };
		/**
		 * String must be phone format
		 */
		is_phone?:
			| true
			| {
					/**
					 * Whether country code should be included "+1"
					 */
					include_country_code?: boolean;
			  };
		/**
		 * dot notation strings
		 */
		ensure_present_if_all_present?: string[];
		ensure_present_if_any_present?: string[];
		ensure_present_if_any_empty?: string[];
		ensure_present_if_all_empty?: string[];
		ensure_present_if_none_empty?: string[];
		ensure_empty_if_any_present?: string[];
		ensure_empty_if_all_present?: string[];
		ensure_empty_if_all_empty?: string[];
		ensure_empty_if_any_empty?: string[];
		ensure_empty_if_none_empty?: string[];
	};
	/**
	 * Define the user interface for this data
	 */
	interface?: {
		/**
		 * Pre-defined interface elements
		 * Can we expand to allow interface element type here?
		 */
		// component?: string;
		/**
		 * Attributes to spread onto the element
		 * Do we want this...?
		 */
		form?: {
			/**
			 * Key to use in the body of the sent request
			 * Overrides the default key
			 */
			out_key?: string;
			/**
			 * Helper text to render near the input element
			 */
			description?: string;
			/**
			 * User-friendly name for the key
			 * Will render on the form and the table's column
			 */
			label?: string;
			/**
			 * Placeholder text to render on the element
			 */
			placeholder?: string;
			/**
			 * Icon to render with this component, if it can
			 * Type should be an enum of our supported icons
			 */
			// icon?: string;
			/**
			 * Whether to hide this element from the interface
			 * Hiding the element in the form will skip its validation client-side
			 * Useful for fields that get set server-side like `id`
			 */
			hidden?: boolean;
			/**
			 * Whether a user can interact with this element or not
			 */
			disabled?: boolean;
			/**
			 * Initial data to populate the component with
			 * for dropdowns, selects, mutliselects, etc
			 * NOT default value for the input
			 * Used for populating dropdowns with result of a request
			 * Value from request and data_path should be an array
			 * if the possible values is a small enough dataset, consider using schema.enum
			 */
			options?: {
				/**
				 * The source of the data
				 */
				data: any[] | Request;
				/**
				 * The unique identifier per entry
				 * Useful if the data is an array of objects
				 */
				value_path?: string;
				/**
				 * The label to display in a dropdown
				 * Useful if the data is an array of objects
				 */
				label_path?: string;
			};
		};
		/**
		 * Settings to render the table
		 */
		table?: {
			/**
			 * Whether to hide this column
			 */
			hidden?: boolean;
			/**
			 * Column width, in pixels
			 */
			column_width?: number;
			/**
			 * How to render this field in the table
			 */
			// rendered_as?: "image";
		};
	};
	plugins?: {
		[key: string]: string | boolean | Record<string, unknown>;
	};
}

export interface Request {
	uri: string;
	http_method: "GET" | "POST" | "DELETE" | "PATCH" | "PUT";
	headers?: {
		[key: string]: string;
	};
	body?: {
		[key: string]: string;
	};
	/**
	 * Where we want to pull data from
	 * This uses lodash.get, will be path to the object as string
	 * https://lodash.com/docs/4.17.15#get
	 */
	data_path?: string;
	/**
	 * If the request status returns >399, we parse this field
	 * This uses lodash.get, will be path to the object as string
	 * https://lodash.com/docs/4.17.15#get
	 */
	error_path?: string;

	/**
	 * If the request fails and error_path is empty, use this as the message
	 */
	default_error?: string;
}

export interface SchemaKeys {
	[key: string]: KeyConfiguration;
}

export interface Schema {
	keys: SchemaKeys;
	/**
	 * Instructions for utilizing this data via the API
	 */
	requests?: {
		get?: Request;
		create?: Request;
		delete?: Request;
		update?: Request;
	};
	access?: {
		/**
		 * Privacy of this interface.
		 * Below is who has access with each setting:
		 * Private - only the creator
		 * Unlisted - anyone with the link
		 * Public - anyone
		 * DomainRestricted - anyone with the same organizational domain as you plus anyone inside users array
		 * InviteRestricted - anyone inside users array
		 */
		privacy?:
			| "Private"
			| "Unlisted"
			| "Public"
			| "DomainRestricted"
			| "InviteRestricted";
		/**
		 * Default permissions to those who have access
		 */
		default_permissions?: Permissions;
		/**
		 * Users you want to have access
		 */
		users?: Users;
	};
}
export type Users = {
	email: string;
	permissions?: Permissions;
}[];
export type PermissionValue = "Create" | "Read" | "Update" | "Delete" | "All";
export type Permissions = PermissionValue[];
