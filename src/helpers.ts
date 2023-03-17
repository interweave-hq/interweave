import empty from "is-empty";

export const isEmpty = (value: any) => {
	return empty(value);
};

export function get(object: object, path: string, defaultValue = null): any {
	// Convert dot notation to bracket notation
	path = path.replace(/\[(\w+)\]/g, ".$1");
	path = path.replace(/^\./, "");

	// Split path into an array of keys
	const keys = path.split(".");

	// Iterate over the keys to retrieve the value
	let result = object;
	for (const key of keys) {
		if (
			result != null &&
			Object.prototype.hasOwnProperty.call(result, key)
		) {
			result = result[key as keyof typeof result];
		} else {
			return defaultValue;
		}
	}

	return result === undefined ? defaultValue : result;
}

export const isValuePresent = (fullObject: object, target: string) => {
	// Deep parse
	const value = get(fullObject, target);
	return !isEmpty(value);
};
