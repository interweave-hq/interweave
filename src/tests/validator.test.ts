import { test, expect, describe } from "@jest/globals";
import { validateConfiguration } from "../validateConfig";
import { config } from "./testSchema";

describe("Schema validator works correctly", () => {
	describe("Required configs have no empty ensures", () => {
		test("ensure field is not optional", () => {
			expect(!!config.fields.first_name.schema.is_optional).toBe(false);
		});
		test("ensure_empty_if_any_present", () => {
			const newSchema = structuredClone(config);
			newSchema.fields.first_name.validation!.ensure_empty_if_any_present =
				["string"];
			expect(() => validateConfiguration(newSchema)).toThrowError();
		});
		test("ensure_empty_if_all_present", () => {
			const newSchema = structuredClone(config);
			newSchema.fields.first_name.validation!.ensure_empty_if_all_present =
				["string"];
			expect(() => validateConfiguration(newSchema)).toThrowError();
		});
		test("ensure_empty_if_all_empty", () => {
			const newSchema = structuredClone(config);
			newSchema.fields.first_name.validation!.ensure_empty_if_all_empty =
				["string"];
			expect(() => validateConfiguration(newSchema)).toThrowError();
		});
		test("ensure_empty_if_any_empty", () => {
			const newSchema = structuredClone(config);
			newSchema.fields.first_name.validation!.ensure_empty_if_any_empty =
				["string"];
			expect(() => validateConfiguration(newSchema)).toThrowError();
		});
		test("ensure_empty_if_none_empty", () => {
			const newSchema = structuredClone(config);
			newSchema.fields.first_name.validation!.ensure_empty_if_none_empty =
				["string"];
			expect(() => validateConfiguration(newSchema)).toThrowError();
		});
		// describe("ensure_present_if_key_equals", () => {
		// 	test("value is array & target is array", () => {
		// 		const newSchema = structuredClone(config);
		// 		newSchema.fields.first_name.validation!.ensure_empty_if_none_empty =
		// 			["string"];
		// 		expect(() => validateConfiguration(newSchema)).toThrowError();
		// 	});
		// 	test("value is string & target is string", () => {
		// 		const newSchema = structuredClone(config);
		// 		newSchema.fields.first_name.validation!.ensure_empty_if_none_empty =
		// 			["string"];
		// 		expect(() => validateConfiguration(newSchema)).toThrowError();
		// 	});
		// 	test("value is string & target is array", () => {
		// 		const newSchema = structuredClone(config);
		// 		newSchema.fields.first_name.validation!.ensure_empty_if_none_empty =
		// 			["string"];
		// 		expect(() => validateConfiguration(newSchema)).toThrowError();
		// 	});
		// 	test("value is array & target is array", () => {
		// 		// Should be invalid
		// 		const newSchema = structuredClone(config);
		// 		newSchema.fields.first_name.validation!.ensure_empty_if_none_empty =
		// 			["string"];
		// 		expect(() => validateConfiguration(newSchema)).toThrowError();
		// 	});
		// });
	});
	describe("validate string operations", () => {
		test("validation.min fails", () => {
			const newSchema = structuredClone(config);
			newSchema.fields.first_name.validation!.min = 10;
			expect(() => validateConfiguration(newSchema)).toThrowError();
		});
		test("validation.max fails", () => {
			const newSchema = structuredClone(config);
			newSchema.fields.first_name.validation!.max = 10;
			expect(() => validateConfiguration(newSchema)).toThrowError();
		});
	});
	describe("validate number operations", () => {
		test("validation.is_email fails", () => {
			const newSchema = structuredClone(config);
			newSchema.fields.age.validation!.is_email = true;
			expect(() => validateConfiguration(newSchema)).toThrowError();
		});
		test("validation.is_phone fails", () => {
			const newSchema = structuredClone(config);
			newSchema.fields.age.validation!.is_phone = true;
			expect(() => validateConfiguration(newSchema)).toThrowError();
		});
		test("validation.is_phone fails if include_country_code is true", () => {
			const newSchema = structuredClone(config);
			newSchema.fields.age.validation!.is_phone = {};
			newSchema.fields.age.validation!.is_phone.include_country_code =
				true;
			expect(() => validateConfiguration(newSchema)).toThrowError();
		});
	});
	describe("validate object operations", () => {
		test("config.enum fails", () => {
			const newSchema = structuredClone(config);
			newSchema.fields.address.schema!.enum = ["a", "b"];
			expect(() => validateConfiguration(newSchema)).toThrowError();
		});
		test("validation.min fails", () => {
			const newSchema = structuredClone(config);
			newSchema.fields.address.validation!.min = 10;
			expect(() => validateConfiguration(newSchema)).toThrowError();
		});
		test("validation.max fails", () => {
			const newSchema = structuredClone(config);
			newSchema.fields.address.validation!.max = 10;
			expect(() => validateConfiguration(newSchema)).toThrowError();
		});
		test("validation.max fails", () => {
			const newSchema = structuredClone(config);
			newSchema.fields.address.validation!.is_email = true;
			expect(() => validateConfiguration(newSchema)).toThrowError();
		});
		test("validation.max fails", () => {
			const newSchema = structuredClone(config);
			newSchema.fields.address.validation!.is_phone = true;
			expect(() => validateConfiguration(newSchema)).toThrowError();
		});
	});
	describe("validate boolean operations", () => {
		test("config.enum fails", () => {
			const newSchema = structuredClone(config);
			newSchema.fields.is_building.schema!.enum = ["a", "b"];
			expect(() => validateConfiguration(newSchema)).toThrowError();
		});
		test("validation.min fails", () => {
			const newSchema = structuredClone(config);
			newSchema.fields.is_building.validation!.min = 10;
			expect(() => validateConfiguration(newSchema)).toThrowError();
		});
		test("validation.max fails", () => {
			const newSchema = structuredClone(config);
			newSchema.fields.is_building.validation!.max = 10;
			expect(() => validateConfiguration(newSchema)).toThrowError();
		});
		test("validation.is_email fails", () => {
			const newSchema = structuredClone(config);
			newSchema.fields.is_building.validation!.is_email = true;
			expect(() => validateConfiguration(newSchema)).toThrowError();
		});
		test("validation.is_phone fails", () => {
			const newSchema = structuredClone(config);
			newSchema.fields.is_building.validation!.is_phone = true;
			expect(() => validateConfiguration(newSchema)).toThrowError();
		});
	});
	describe("defaultValue obeys rules", () => {
		test("number on string type fails", () => {
			const newSchema = structuredClone(config);
			newSchema.fields.first_name.schema!.default_value = 5;
			expect(() => validateConfiguration(newSchema)).toThrowError();
		});
		test("non-enum value fails", () => {
			const newSchema = structuredClone(config);
			newSchema.fields.favorite_drink.schema!.default_value = "blagg";
			expect(() => validateConfiguration(newSchema)).toThrowError();
		});
	});
	describe("length, min_length, and max_length only available on strings and arrays", () => {
		test("number cant have length", () => {
			const newSchema = structuredClone(config);
			newSchema.fields.age.validation!.length = 5;
			expect(() => validateConfiguration(newSchema)).toThrowError();
		});
		test("number cant have min length", () => {
			const newSchema = structuredClone(config);
			newSchema.fields.age.validation!.min_length = 5;
			expect(() => validateConfiguration(newSchema)).toThrowError();
		});
		test("number cant have max length", () => {
			const newSchema = structuredClone(config);
			newSchema.fields.age.validation!.max_length = 5;
			expect(() => validateConfiguration(newSchema)).toThrowError();
		});
	});
	describe("default config succeeds validation", () => {
		test("returns true if succeeds", () => {
			const result = validateConfiguration(config);
			expect(result).toBe(true);
		});
	});
});
