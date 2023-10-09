import { type InterfaceConfiguration } from "./interfaces";
import { validateConfiguration } from "./validateConfig";

const API_URL = "https://api.interwv.com";
const BUILD_INTERFACE_URL = ({
	projectId,
	apiDomain = API_URL,
}: {
	projectId: string;
	apiDomain?: string;
}) => `${apiDomain}/api/v1/projects/${projectId}/interfaces`;

/**
 * id - Project ID
 * token - Project API Token from Interweave
 */
export interface BuildInterfaceProject {
	/**
	 * Interweave Project ID
	 */
	projectId: string;
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
	project: BuildInterfaceProject,
	/**
	 * Additional options
	 */
	options?: {
		apiDomain?: string;
	}
) {
	const { projectId, token } = project;
	const apiDomain = options?.apiDomain;

	// Validate configuration
	validateConfiguration(config);

	// Push to API
	try {
		console.log("\n");
		console.log(`⌛ Updating interface ${config.key}...`);
		const res = await fetch(BUILD_INTERFACE_URL({ projectId, apiDomain }), {
			method: "POST",
			body: JSON.stringify({
				schema_config: config,
			}),
			headers: {
				"Content-Type": "application/json",
				authorization: `Bearer ${token}`,
			},
		});
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
