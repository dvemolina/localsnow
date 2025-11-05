import { env } from "$env/dynamic/private";

const N8N_BASE_URL = 'https://automation.personalflow.net/webhook'; //Delete the "-test" for production
const EMAIL_SECRET = env.EMAIL_HEADER_SECRET;

export async function sendSignupEmail(name: string, email: string) {
	try {
		const response = await fetch(`${N8N_BASE_URL}/797b1c35-f0fd-4b8c-a0a2-014d07e396ae`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
                'x-n8n-secret': EMAIL_SECRET
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

export async function sendBookingNotificationToInstructor(data: {
	instructorEmail: string;
	instructorName: string;
	bookingRequestId: number;
	clientName: string;
	numberOfStudents: number;
	startDate: string;
	endDate?: string;
	hoursPerDay: number;
	estimatedPrice?: number;
	currency?: string;
	leadPrice: number;
	paymentUrl: string;
	dashboardUrl?: string;
}) {
	try {
		const response = await fetch(`${N8N_BASE_URL}/booking-notification-instructor`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-n8n-secret': EMAIL_SECRET
			},
			body: JSON.stringify({
				type: 'instructor_notification',
				...data,
				dashboardUrl: data.dashboardUrl || 'https://localsnow.org/dashboard'
			})
		});

		if (!response.ok) {
			console.error('Failed to send instructor notification', await response.text());
		}
	} catch (err) {
		console.error('Error sending instructor notification:', err);
	}
}

export async function sendBookingConfirmationToClient(data: {
	clientEmail: string;
	clientName: string;
	instructorName: string;
	numberOfStudents: number;
	startDate: string;
	endDate?: string;
	hoursPerDay: number;
	estimatedPrice?: number;
	currency?: string;
}) {
	try {
		const response = await fetch(`${N8N_BASE_URL}/booking-confirmation-client`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-n8n-secret': EMAIL_SECRET
			},
			body: JSON.stringify({
				type: 'client_confirmation',
				...data
			})
		});

		if (!response.ok) {
			console.error('Failed to send client confirmation', await response.text());
		}
	} catch (err) {
		console.error('Error sending client confirmation:', err);
	}
}

export async function sendContactInfoToInstructor(data: {
	instructorEmail: string;
	instructorName: string;
	clientName: string;
	clientEmail: string;
	clientPhone: string;
	clientCountryCode: string;
	numberOfStudents: number;
	startDate: string;
	endDate?: string;
	hoursPerDay: number;
	sports: string[];
	skillLevel: string;
	message?: string;
	estimatedPrice?: number;
	currency?: string;
}) {
	try {
		const response = await fetch(`${N8N_BASE_URL}/booking-contact-info`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-n8n-secret': EMAIL_SECRET
			},
			body: JSON.stringify({
				type: 'contact_info',
				...data
			})
		});

		if (!response.ok) {
			console.error('Failed to send contact info to instructor', await response.text());
		}
	} catch (err) {
		console.error('Error sending contact info:', err);
	}
}