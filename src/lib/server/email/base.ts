/**
 * Base email styles and wrapper functions
 * All colors and styles extracted for consistency across all email templates
 */

export const baseStyles = {
	// Brand colors
	primary: '#2563eb', // Blue
	primaryDark: '#1e40af',
	success: '#10b981', // Green
	successDark: '#059669',
	warning: '#f59e0b', // Orange
	warningDark: '#d97706',
	danger: '#ef4444', // Red
	dangerDark: '#dc2626',
	info: '#06b6d4', // Cyan
	infoDark: '#0891b2',

	// Neutral colors
	white: '#ffffff',
	black: '#000000',
	gray50: '#f9fafb',
	gray100: '#f3f4f6',
	gray200: '#e5e7eb',
	gray300: '#d1d5db',
	gray400: '#9ca3af',
	gray500: '#6b7280',
	gray600: '#4b5563',
	gray700: '#374151',
	gray800: '#1f2937',
	gray900: '#111827',

	// Semantic colors
	background: '#f9fafb',
	cardBackground: '#ffffff',
	textPrimary: '#111827',
	textSecondary: '#6b7280',
	border: '#e5e7eb',

	// Typography
	fontFamily:
		'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
	fontSize: '16px',
	lineHeight: '1.5',

	// Spacing
	spacing: {
		xs: '4px',
		sm: '8px',
		md: '16px',
		lg: '24px',
		xl: '32px',
		xxl: '48px'
	}
} as const;

/**
 * Wraps email content with proper HTML structure and base styles
 */
export function wrapEmail(content: string, options?: { preheader?: string }): string {
	const { preheader } = options || {};

	return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="x-apple-disable-message-reformatting">
	<meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no">
	<title>Local Snow</title>
	<!--[if mso]>
	<style>
		* { font-family: Arial, sans-serif !important; }
		table { border-collapse: collapse; }
		a { text-decoration: none; }
	</style>
	<![endif]-->
</head>
<body style="margin: 0; padding: 0; width: 100%; background-color: ${baseStyles.background}; font-family: ${baseStyles.fontFamily}; font-size: ${baseStyles.fontSize}; line-height: ${baseStyles.lineHeight}; color: ${baseStyles.textPrimary}; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
	${preheader ? `<div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">${preheader}</div>` : ''}

	<!-- Outer container -->
	<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: ${baseStyles.background};">
		<tr>
			<td style="padding: ${baseStyles.spacing.xl} ${baseStyles.spacing.md};">
				<!-- Main content container -->
				<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: ${baseStyles.cardBackground}; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);">
					${content}
				</table>

				<!-- Footer -->
				<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; margin: ${baseStyles.spacing.lg} auto 0;">
					<tr>
						<td style="padding: 0 ${baseStyles.spacing.md}; text-align: center; color: ${baseStyles.textSecondary}; font-size: 14px;">
							<p style="margin: 0 0 ${baseStyles.spacing.sm};">
								<a href="https://localsnow.org" style="color: ${baseStyles.primary}; text-decoration: none;">Local Snow</a> -
								Connect with local snow sports instructors
							</p>
							<p style="margin: 0 0 ${baseStyles.spacing.sm};">
								<a href="https://localsnow.org/about" style="color: ${baseStyles.textSecondary}; text-decoration: none; margin: 0 ${baseStyles.spacing.sm};">About</a>
								<a href="https://localsnow.org/contact" style="color: ${baseStyles.textSecondary}; text-decoration: none; margin: 0 ${baseStyles.spacing.sm};">Contact</a>
								<a href="https://localsnow.org/terms" style="color: ${baseStyles.textSecondary}; text-decoration: none; margin: 0 ${baseStyles.spacing.sm};">Terms</a>
								<a href="https://localsnow.org/privacy" style="color: ${baseStyles.textSecondary}; text-decoration: none; margin: 0 ${baseStyles.spacing.sm};">Privacy</a>
							</p>
							<p style="margin: 0; font-size: 12px; color: ${baseStyles.gray400};">
								You received this email because you have an account with Local Snow or requested information.
							</p>
						</td>
					</tr>
				</table>
			</td>
		</tr>
	</table>
</body>
</html>`;
}
