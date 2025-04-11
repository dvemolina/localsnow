import { env } from "$env/dynamic/private";

export async function sendSignupEmail(name: string, email: string) {
	try {
		const response = await fetch('https://automation.personalflow.net/webhook/797b1c35-f0fd-4b8c-a0a2-014d07e396ae', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
                'x-n8n-secret': env.EMAIL_HEADER_SECRET
			},
			body: JSON.stringify({ name: name, email: email })
		});

		if (!response.ok) {
			console.error('Failed to send email via n8n', await response.text());
		}
	} catch (err) {
		console.error('Error calling n8n webhook:', err);
	}
}
