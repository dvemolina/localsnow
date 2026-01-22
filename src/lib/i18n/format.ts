export function formatMessage(
	message: string,
	values?: Record<string, string | number>
): string {
	if (!values) return message;
	return Object.entries(values).reduce(
		(text, [key, value]) => text.replaceAll(`{${key}}`, String(value)),
		message
	);
}
