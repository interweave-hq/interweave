import { type Schema } from "./interfaces";
import { validateSchema } from "./validateSchema";

const API_URL = "https://api.interweave.studio/api/v1/projects";
const BUILD_INTERFACE_URL = ({ projectId }: { projectId: string }) =>
	`${API_URL}/${projectId}/interfaces`;

/**
 * This will upload your schema configuration to the Studio
 */
export async function buildInterface(
	key: string,
	schema: Schema,
	projectId: string
) {
	// Validate configuration
	validateSchema(schema);

	// Push to API
	try {
		const res = await fetch(BUILD_INTERFACE_URL({ projectId }), {
			method: "POST",
			body: JSON.stringify({
				key,
				schema_config: schema,
			}),
			headers: {
				"Content-Type": "application/json",
			},
		});
		const data = await res.json();
		console.log(`Update responded with a status of ${data.http_status}.`);
	} catch (err) {
		console.log(err);
	}
}
