import { type InterfaceConfiguration } from "../interfaces";

export const config: InterfaceConfiguration = {
	key: "interface-key",
	fields: {
		phone: {
			schema: {
				is_optional: true,
				type: "string",
			},
			validation: {
				is_phone: true,
			},
		},
		first_name: {
			schema: {
				type: "string",
				default_value: "hi",
			},
			validation: {
				min_length: 3,
				max_length: 30,
			},
		},
		last_name: {
			schema: {
				is_optional: true,
				type: "string",
			},
			validation: {
				min_length: 3,
				max_length: 30,
				ensure_present_if_all_present: ["first_name"],
			},
		},
		favorite_drink: {
			schema: {
				type: "string",
				enum: ["beer", "wine", "soda", "water"],
				default_value: "wine",
			},
		},
		is_building: {
			schema: {
				type: "boolean",
			},
			validation: {},
		},
		email: {
			schema: {
				type: "string",
				is_optional: true,
			},
			validation: {
				is_email: {
					forbidden_domains: ["gail"],
				},
			},
		},
		age: {
			schema: {
				type: "number",
			},
			validation: {
				min: 0,
				max: 120,
			},
		},
		address: {
			schema: {
				type: "object",
				object_schema: {
					street_line_1: {
						schema: {
							type: "string",
						},
					},
					street_line_2: {
						schema: {
							type: "string",
							is_optional: true,
						},
						validation: {
							ensure_present_if_any_present: [
								"address.street_line_1",
							],
						},
					},
					zip: {
						schema: {
							type: "number",
						},
					},
				},
			},
			validation: {},
		},
	},
};
