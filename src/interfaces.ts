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

export type FieldType =
	| "string"
	| "number"
	| "boolean"
	| "object"
	| "date"
	| "datetime"
	| "time";

export interface FieldConfiguration {
	schema: {
		// We need to expand this to support more DB types
		// Coordinates, DateTime, Time, Float, Integer
		type: FieldType;
		is_optional?: boolean;
		is_array?: boolean;
		object_schema?: Fields;
		// These can be done by hand for now
		// extend?: KeyConfiguration;
		// omit?: string[];
		// partial?: string[];
		enum?: StaticDataSource;
		/**
		 * A dynamic enum allows a request to be made to populate a Select or MultiSelect element
		 */
		dynamic_enum?: Request;
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
		/**
		 * Make sure this key is present if some other key equals X value
		 * If key is an array value and array is supplied, it'll check equality of the arrays
		 * If key is a non-array value and array is supplied, it'll check each of the values in the array
		 * If key is an array value and a non-array value is supplied, invalid configuration
		 * If key is a non-array value and a non-array is supplied, it'll check type and value equality
		 */
		ensure_present_if_key_equals?: {
			key: string;
			value?: string | number | boolean | string[] | number[];
		};
		/**
		 * Make sure this key is empty if some other key equals X value
		 * If key is an array value and array is supplied, it'll check equality of the arrays
		 * If key is a non-array value and array is supplied, it'll check each of the values in the array
		 * If key is an array value and a non-array value is supplied, invalid configuration
		 * If key is a non-array value and a non-array is supplied, it'll check type and value equality
		 */
		ensure_empty_if_key_equals?: {
			key: string;
			value: string | number | boolean | string[] | number[];
		};
	};
	/**
	 * Define the user interface for this data
	 */
	interface?: {
		/**
		 * User-friendly name for the key
		 * Will render on the form and the table's column
		 */
		label?: string;
		/**
		 * Pre-defined interface elements
		 * Can we expand to allow interface element type here?
		 */
		// component?: "richtexteditor";
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

/**
 * We'll automatically send the formData as the request body unless dontSendFormDataAsBody is false
 */
export interface Request {
	/**
	 * Filled with variable state
	 */
	uri: string;
	/**
	 * HTTP Method to use with the request
	 */
	http_method: "GET" | "POST" | "DELETE" | "PATCH" | "PUT";
	/**
	 * Headers to attach to the request. Variables are accessible in this object.
	 */
	headers?: {
		[key: string]: string | number | boolean;
	};
	/**
	 * Body to send with the request. Variables are accessible in this object.
	 */
	body?: {
		[key: string]: string | number | boolean;
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
	/**
	 * If the url accepts a parameter
	 */
	parameters?: {
		/**
		 * Keys _not_ specified in the URL will be appended as query parameters
		 * for example, a key of location will be appended as ?location=value
		 */
		[key: string]: Parameter;
	};
	/**
	 * If a Request requires authentication, specify a key from the interface authentication object
	 * If the key is not found in this interfaces' authentication object, it'll look for another the key
	 * within another interface within this same project
	 */
	authentication_key?: string;
	/**
	 * This will prevent the form data from sending with POST, PATCH, and PUT requests
	 */
	skip_body_attachment?: boolean;
	/**
	 * If this is to dynamically fill an enum at run-time, this will be the option's value populated in the
	 * Select or MultiSelect component.
	 *
	 * This find operation will occur on every entry within the returned array. If the Request and `data_path` parse doesn't return
	 * an array, the procedure will fail.
	 *
	 * Here is an example: your request returns an object `{ status: 200, results: [{ title: 'Example 1', id: 1 }, { title: 'Example 1', id: 1 }] }`.
	 * In your request, you'd specify a `data_path` of  `results` to return the array: `[{ title: 'Example 1', id: 1 }, { title: 'Example 1', id: 1 }]`.
	 * Then to populate a Select, element, you specify `id` as the `value_path` and `title` as the label path.
	 * This will produce a Select dropdown with two options, "Example 1" and "Example 2", each with their corresponding ids underneath.
	 * https://lodash.com/docs/4.17.15#get
	 */
	value_path?: string;
	/**
	 * If this is to dynamically fill an enum at run-time, this will be the option's label populated in the
	 * Select or MultiSelect component.
	 *
	 * This find operation will occur on every entry within the returned array. If the Request and `data_path` parse doesn't return
	 * an array, the procedure will fail.
	 *
	 * Here is an example: your request returns an object `{ status: 200, results: [{ title: 'Example 1', id: 1 }, { title: 'Example 1', id: 1 }] }`.
	 * In your request, you'd specify a `data_path` of  `results` to return the array: `[{ title: 'Example 1', id: 1 }, { title: 'Example 1', id: 1 }]`.
	 * Then to populate a Select, element, you specify `id` as the `value_path` and `title` as the label path.
	 * This will produce a Select dropdown with two options, "Example 1" and "Example 2", each with their corresponding ids underneath.
	 * https://lodash.com/docs/4.17.15#get
	 */
	label_path?: string;
}

export interface Parameter {
	schema: {
		type: "string" | "number" | "boolean";
		is_optional?: boolean;
		is_array?: boolean;
		enum?: StaticDataSource;
		dynamic_enum?: Request;
		default_value?: any;
	};

	interface?: {
		form?: {
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
			 * Text that will render near the input to provide context.
			 */
			description?: string;
			/**
			 * Whether a user can interact with this element or not
			 */
			disabled?: boolean;
		};
	};
}

export interface Fields {
	[key: string]: FieldConfiguration;
}

export interface InterfaceConfiguration {
	/**
	 * Unique identifier for this interface
	 * Will render as the slug
	 * Must be lowercase-kebab-slug-style
	 * CANNOT BE CHANGED AFTER CREATION
	 */
	key: string;
	/**
	 * Display name for this interface
	 */
	title?: string;
	/**
	 * Slug for this interface
	 */
	slug?: string;
	/**
	 * Additional information to describe this interface
	 */
	description?: string;
	/**
	 * How usage of this interface should be billed. Default: "Individual"
	 */
	billing_strategy?: "InterfaceOwner" | "Individual";
	/**
	 * Properties from your data model
	 */
	fields: Fields;
	/**
	 * Instructions for utilizing this data via the API
	 */
	requests?: {
		get?: Request;
		create?: Request;
		delete?: Request;
		update?: Request;
	};
	/**
	 * Control who has access to this interface
	 */
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
		privacy?: PrivacySetting;
		/**
		 * Default permissions to those who have access
		 */
		default_permissions?: Permissions;
		/**
		 * Users you want to have access
		 */
		users?: Users;
	};
	/**
	 * Specify authorization flows required to access your API
	 */
	authentication?: {
		/**
		 * Keys are project scoped.
		 * Any interfaces within the project that specify this key will refer to the first saved token found for a given user
		 */
		[key: string]: {
			/**
			 * Trigger a modal asking for the token
			 */
			type: "token";
			/**
			 * Headers object to modify a Request that uses this authorization key
			 */
			headers?: {
				/**
				 * Token variable is accessible in the value by wrapping the word token in braces.
				 * So a key:value pair here of `'authorization': 'Bearer {token}'` will produce the expected result of `Bearer xzy123`.
				 */
				[headerName: string]: string;
			};
			/**
			 * Customize what gets rendered in the modal
			 */
			interface?: {
				/**
				 * Title in the modal
				 */
				title?: string;
				/**
				 * Label for the input
				 */
				label?: string;
				/**
				 * Placeholder text for the input
				 */
				placeholder?: string;
				/**
				 * Text to add context about what is needed here
				 */
				description?: string;
				/**
				 * Link to provide more instructions about obtaining this key
				 */
				instructions_link?: string;
			};
		};
	};
}
export type Users = {
	email: string;
	permissions?: Permissions;
}[];
export type PermissionValue = "Create" | "Read" | "Update" | "Delete" | "All";
export type Permissions = PermissionValue[];

export type PrivacySetting =
	| "Private"
	| "Unlisted"
	| "Public"
	| "DomainRestricted"
	| "InviteRestricted";

export type StaticDataSource =
	| string[]
	| number[]
	| { value: string | number; label?: string | number }[];

export type DataSource = Request | StaticDataSource;
