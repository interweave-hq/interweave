import { type Schema } from "./interfaces";
import { validateSchema } from "./validateSchema";

const API_URL = "https://api.interwv.com/api/v1/projects";
const BUILD_INTERFACE_URL = ({ projectId }: { projectId: string }) =>
	`${API_URL}/${projectId}/interfaces`;

interface BuildInterfaceProps {
	/**
	 * Unique key to identify this interface
	 */
	key: string;
	/**
	 * Configuration object
	 */
	schema: Schema;
	/**
	 * Interweave Project ID
	 */
	projectId: string;
	/**
	 * Interweave API Token
	 */
	apiToken: string;
	/**
	 * Title for this interface
	 */
	title?: string;
	/**
	 * Description for this interface
	 */
	description?: string;
}

/**
 * This will upload your schema configuration to the Studio
 */
export async function buildInterface({
	key,
	schema,
	projectId,
	apiToken,
	title,
	description,
}: BuildInterfaceProps) {
	// Validate configuration
	validateSchema(schema);

	// Push to API
	try {
		const res = await fetch(BUILD_INTERFACE_URL({ projectId }), {
			method: "POST",
			body: JSON.stringify({
				key,
				schema_config: schema,
				title,
				description,
			}),
			headers: {
				"Content-Type": "application/json",
				authorization: `Bearer ${apiToken}`,
			},
		});
		const data = await res.json();
		console.log(`Update responded with a status of ${data.http_status}.`);
	} catch (err) {
		console.log(err);
	}
}
