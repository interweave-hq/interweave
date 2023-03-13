import { test, expect, describe } from "@jest/globals";
import { validateSchema } from "../validate";
import { schema } from "./testSchema";

describe("Schema validator works correctly", () => {
	describe("Required schemas have no empty ensures", () => {
		test("ensure field is not optional", () => {
			expect(!!schema.keys.first_name.schema.is_optional).toBe(false);
		});
		test("ensure_empty_if_any_present", () => {
			const newSchema = structuredClone(schema);
			newSchema.keys.first_name.validation!.ensure_empty_if_any_present =
				["string"];
			expect(() => validateSchema(newSchema)).toThrowError();
		});
		test("ensure_empty_if_all_present", () => {
			const newSchema = structuredClone(schema);
			newSchema.keys.first_name.validation!.ensure_empty_if_all_present =
				["string"];
			expect(() => validateSchema(newSchema)).toThrowError();
		});
		test("ensure_empty_if_all_empty", () => {
			const newSchema = structuredClone(schema);
			newSchema.keys.first_name.validation!.ensure_empty_if_all_empty = [
				"string",
			];
			expect(() => validateSchema(newSchema)).toThrowError();
		});
		test("ensure_empty_if_any_empty", () => {
			const newSchema = structuredClone(schema);
			newSchema.keys.first_name.validation!.ensure_empty_if_any_empty = [
				"string",
			];
			expect(() => validateSchema(newSchema)).toThrowError();
		});
		test("ensure_empty_if_none_empty", () => {
			const newSchema = structuredClone(schema);
			newSchema.keys.first_name.validation!.ensure_empty_if_none_empty = [
				"string",
			];
			expect(() => validateSchema(newSchema)).toThrowError();
		});
	});
	describe("validate string operations", () => {
		test("validation.min fails", () => {
			const newSchema = structuredClone(schema);
			newSchema.keys.first_name.validation!.min = 10;
			expect(() => validateSchema(newSchema)).toThrowError();
		});
		test("validation.max fails", () => {
			const newSchema = structuredClone(schema);
			newSchema.keys.first_name.validation!.max = 10;
			expect(() => validateSchema(newSchema)).toThrowError();
		});
	});
	describe("validate number operations", () => {
		test("validation.is_email fails", () => {
			const newSchema = structuredClone(schema);
			newSchema.keys.age.validation!.is_email = true;
			expect(() => validateSchema(newSchema)).toThrowError();
		});
		test("validation.is_phone fails", () => {
			const newSchema = structuredClone(schema);
			newSchema.keys.age.validation!.is_phone = true;
			expect(() => validateSchema(newSchema)).toThrowError();
		});
		test("validation.is_phone fails if include_country_code is true", () => {
			const newSchema = structuredClone(schema);
			newSchema.keys.age.validation!.is_phone = {};
			newSchema.keys.age.validation!.is_phone.include_country_code = true;
			expect(() => validateSchema(newSchema)).toThrowError();
		});
	});
	describe("validate object operations", () => {
		test("schema.enum fails", () => {
			const newSchema = structuredClone(schema);
			newSchema.keys.address.schema!.enum = ["a", "b"];
			expect(() => validateSchema(newSchema)).toThrowError();
		});
		test("validation.min fails", () => {
			const newSchema = structuredClone(schema);
			newSchema.keys.address.validation!.min = 10;
			expect(() => validateSchema(newSchema)).toThrowError();
		});
		test("validation.max fails", () => {
			const newSchema = structuredClone(schema);
			newSchema.keys.address.validation!.max = 10;
			expect(() => validateSchema(newSchema)).toThrowError();
		});
		test("validation.max fails", () => {
			const newSchema = structuredClone(schema);
			newSchema.keys.address.validation!.is_email = true;
			expect(() => validateSchema(newSchema)).toThrowError();
		});
		test("validation.max fails", () => {
			const newSchema = structuredClone(schema);
			newSchema.keys.address.validation!.is_phone = true;
			expect(() => validateSchema(newSchema)).toThrowError();
		});
	});
	describe("validate boolean operations", () => {
		test("schema.enum fails", () => {
			const newSchema = structuredClone(schema);
			newSchema.keys.is_building.schema!.enum = ["a", "b"];
			expect(() => validateSchema(newSchema)).toThrowError();
		});
		test("validation.min fails", () => {
			const newSchema = structuredClone(schema);
			newSchema.keys.is_building.validation!.min = 10;
			expect(() => validateSchema(newSchema)).toThrowError();
		});
		test("validation.max fails", () => {
			const newSchema = structuredClone(schema);
			newSchema.keys.is_building.validation!.max = 10;
			expect(() => validateSchema(newSchema)).toThrowError();
		});
		test("validation.is_email fails", () => {
			const newSchema = structuredClone(schema);
			newSchema.keys.is_building.validation!.is_email = true;
			expect(() => validateSchema(newSchema)).toThrowError();
		});
		test("validation.is_phone fails", () => {
			const newSchema = structuredClone(schema);
			newSchema.keys.is_building.validation!.is_phone = true;
			expect(() => validateSchema(newSchema)).toThrowError();
		});
	});
	describe("defaultValue obeys rules", () => {
		test("number on string type fails", () => {
			const newSchema = structuredClone(schema);
			newSchema.keys.first_name.schema!.default_value = 5;
			expect(() => validateSchema(newSchema)).toThrowError();
		});
		test("non-enum value fails", () => {
			const newSchema = structuredClone(schema);
			newSchema.keys.favorite_drink.schema!.default_value = "blagg";
			expect(() => validateSchema(newSchema)).toThrowError();
		});
	});
	describe("length, min_length, and max_length only available on strings and arrays", () => {
		test("number cant have length", () => {
			const newSchema = structuredClone(schema);
			newSchema.keys.age.validation!.length = 5;
			expect(() => validateSchema(newSchema)).toThrowError();
		});
		test("number cant have min length", () => {
			const newSchema = structuredClone(schema);
			newSchema.keys.age.validation!.min_length = 5;
			expect(() => validateSchema(newSchema)).toThrowError();
		});
		test("number cant have max length", () => {
			const newSchema = structuredClone(schema);
			newSchema.keys.age.validation!.max_length = 5;
			expect(() => validateSchema(newSchema)).toThrowError();
		});
	});
	describe("default schema succeeds validation", () => {
		test("returns true if succeeds", () => {
			const result = validateSchema(schema);
			expect(result).toBe(true);
		});
	});
});
