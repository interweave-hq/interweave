import { type InterfaceConfiguration } from "./interfaces";
import { validateConfiguration } from "./validateConfig";

const API_URL = "https://api.interwv.com";
const BUILD_INTERFACE_URL = ({
	projectId,
	apiUrl = API_URL,
}: {
	projectId: string;
	apiUrl?: string;
}) => `${apiUrl}/api/v1/projects/${projectId}/interfaces`;

/**
 * id - Project ID
 * token - Project API Token from Interweave
 */
interface BuildInterfaceProjectProps {
	/**
	 * Interweave Project ID
	 */
	id: string;
	/**
	 * Interweave API Token for this project
	 */
	token: string;
}

/**
 * This will upload your schema configuration to the Studio
 */
export async function buildInterface(
	/**
	 * Configuration object
	 */
	config: InterfaceConfiguration,
	/**
	 * id - Project ID
	 * token - Project API Token from Interweave
	 * { id, token }
	 */
	project: BuildInterfaceProjectProps,
	/**
	 * Additional options
	 */
	options?: {
		apiUrl?: string;
	}
) {
	const { id, token } = project;
	const apiUrl = options?.apiUrl;

	// Validate configuration
	validateConfiguration(config);

	// Push to API
	try {
		console.log("\n");
		console.log(`⌛ Updating interface ${config.key}...`);
		const res = await fetch(
			BUILD_INTERFACE_URL({ projectId: id, apiUrl }),
			{
				method: "POST",
				body: JSON.stringify({
					schema_config: config,
				}),
				headers: {
					"Content-Type": "application/json",
					authorization: `Bearer ${token}`,
				},
			}
		);
		const data = await res.json();
		if (res.status < 399) {
			console.log(
				`✅ Update responded with a status of ${data.http_status}.`
			);
		} else {
			console.log(
				`❌ ${config.key} update responded with a status of ${data.http_status}.`
			);
			if (data.error.user_facing_message) {
				console.log(
					`${config.key} - ${data.error.user_facing_message}`
				);
			}
			if (data.error.technical_message) {
				console.log(`${config.key} - ${data.error.technical_message}`);
			}
			console.log("\n");
		}
	} catch (err) {
		console.log(err);
	}
}
