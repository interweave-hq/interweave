import empty from "is-empty";

export const isEmpty = (value: any) => {
	// 0 isn't empty, can be a legitimate value for a submitted number
	if (value === 0) return false;
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

export function arraysAreEqual(a: any[], b: any[]) {
	if (a === b) return true;
	if (a == null || b == null) return false;
	if (a.length !== b.length) return false;

	// If you don't care about the order of the elements inside
	// the array, you should sort both arrays here.
	// Please note that calling sort on an array will modify that array.
	// you might want to clone your array first.

	for (var i = 0; i < a.length; ++i) {
		if (a[i] !== b[i]) return false;
	}
	return true;
}
