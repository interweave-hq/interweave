import { type InterfaceConfiguration } from "./interfaces";
import { validateConfiguration } from "./validateConfig";

const API_URL = "https://api.interwv.com/api/v1/projects";
const BUILD_INTERFACE_URL = ({ projectId }: { projectId: string }) =>
	`${API_URL}/${projectId}/interfaces`;

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
	project: BuildInterfaceProjectProps
) {
	const { id, token } = project;

	// Validate configuration
	validateConfiguration(config);

	// Push to API
	try {
		const res = await fetch(BUILD_INTERFACE_URL({ projectId: id }), {
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
				`❌ Update responded with a status of ${data.http_status}.`
			);
		}
	} catch (err) {
		console.log(err);
	}
}
