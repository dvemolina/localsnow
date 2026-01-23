/**
 * Reusable email components
 * All components return HTML strings with inline styles for email client compatibility
 */

import { baseStyles } from './base';

export interface HeaderOptions {
	text: string;
	emoji: string;
	color?: string;
	backgroundColor?: string;
}

/**
 * Colored header box with emoji and text
 */
export function header(options: HeaderOptions): string {
	const { text, emoji, color = baseStyles.white, backgroundColor = baseStyles.primary } = options;

	return `
		<tr>
			<td style="background-color: ${backgroundColor}; padding: ${baseStyles.spacing.xl} ${baseStyles.spacing.lg}; text-align: center;">
				<div style="font-size: 48px; margin-bottom: ${baseStyles.spacing.md};">${emoji}</div>
				<h1 style="margin: 0; color: ${color}; font-size: 28px; font-weight: 700; line-height: 1.2;">${text}</h1>
			</td>
		</tr>
	`;
}

export interface InfoBoxOptions {
	title: string;
	content: string;
	borderColor?: string;
	backgroundColor?: string;
}

/**
 * Information box with border and background
 */
export function infoBox(options: InfoBoxOptions): string {
	const {
		title,
		content,
		borderColor = baseStyles.primary,
		backgroundColor = baseStyles.gray50
	} = options;

	return `
		<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: ${baseStyles.spacing.md} 0; border: 2px solid ${borderColor}; border-radius: 6px; background-color: ${backgroundColor}; overflow: hidden;">
			<tr>
				<td style="padding: ${baseStyles.spacing.lg};">
					<h3 style="margin: 0 0 ${baseStyles.spacing.md}; color: ${baseStyles.textPrimary}; font-size: 18px; font-weight: 600;">${title}</h3>
					<div style="color: ${baseStyles.textPrimary}; font-size: 15px; line-height: 1.6;">${content}</div>
				</td>
			</tr>
		</table>
	`;
}

/**
 * Yellow-bordered message box for user messages
 */
export function messageBox(message: string): string {
	return `
		<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: ${baseStyles.spacing.md} 0; border-left: 4px solid ${baseStyles.warning}; background-color: #fffbeb; border-radius: 4px;">
			<tr>
				<td style="padding: ${baseStyles.spacing.lg};">
					<p style="margin: 0; color: ${baseStyles.textPrimary}; font-size: 15px; line-height: 1.6; font-style: italic;">"${message}"</p>
				</td>
			</tr>
		</table>
	`;
}

export interface Button {
	label: string;
	url: string;
	color?: string;
	backgroundColor?: string;
}

/**
 * Action buttons (primary, secondary, etc.)
 */
export function actionButtons(buttons: Button[]): string {
	const buttonHtml = buttons
		.map((button) => {
			const bgColor = button.backgroundColor || baseStyles.primary;
			const textColor = button.color || baseStyles.white;

			return `
				<td style="padding: ${baseStyles.spacing.sm};">
					<!--[if mso]>
					<v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${button.url}" style="height:48px;v-text-anchor:middle;width:200px;" arcsize="10%" stroke="f" fillcolor="${bgColor}">
						<w:anchorlock/>
						<center style="color:${textColor};font-family:sans-serif;font-size:16px;font-weight:bold;">${button.label}</center>
					</v:roundrect>
					<![endif]-->
					<!--[if !mso]><!-->
					<a href="${button.url}" style="display: inline-block; padding: 14px 28px; background-color: ${bgColor}; color: ${textColor}; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; text-align: center; min-width: 160px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">${button.label}</a>
					<!--<![endif]-->
				</td>
			`;
		})
		.join('');

	return `
		<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: ${baseStyles.spacing.lg} 0;">
			<tr>
				<td style="text-align: center;">
					<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
						<tr>
							${buttonHtml}
						</tr>
					</table>
				</td>
			</tr>
		</table>
	`;
}

/**
 * Content section with padding
 */
export function contentSection(content: string): string {
	return `
		<tr>
			<td style="padding: ${baseStyles.spacing.lg};">
				${content}
			</td>
		</tr>
	`;
}

/**
 * Divider line
 */
export function divider(): string {
	return `
		<tr>
			<td style="padding: 0 ${baseStyles.spacing.lg};">
				<div style="border-top: 1px solid ${baseStyles.border}; margin: ${baseStyles.spacing.lg} 0;"></div>
			</td>
		</tr>
	`;
}

export interface DetailRow {
	label: string;
	value: string | number;
	highlight?: boolean;
}

/**
 * Details table with label-value pairs
 */
export function detailsTable(rows: DetailRow[]): string {
	const rowsHtml = rows
		.map((row) => {
			const valueStyle = row.highlight
				? `font-weight: 600; color: ${baseStyles.primary};`
				: `color: ${baseStyles.textPrimary};`;

			return `
				<tr>
					<td style="padding: ${baseStyles.spacing.sm} 0; color: ${baseStyles.textSecondary}; font-size: 14px; vertical-align: top; width: 40%;">${row.label}:</td>
					<td style="padding: ${baseStyles.spacing.sm} 0; ${valueStyle} font-size: 15px; vertical-align: top;">${row.value}</td>
				</tr>
			`;
		})
		.join('');

	return `
		<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: ${baseStyles.spacing.md} 0;">
			${rowsHtml}
		</table>
	`;
}

/**
 * Heading (h2 equivalent)
 */
export function heading(text: string): string {
	return `<h2 style="margin: ${baseStyles.spacing.lg} 0 ${baseStyles.spacing.md}; color: ${baseStyles.textPrimary}; font-size: 22px; font-weight: 600; line-height: 1.3;">${text}</h2>`;
}

/**
 * Paragraph with proper spacing
 */
export function paragraph(text: string): string {
	return `<p style="margin: 0 0 ${baseStyles.spacing.md}; color: ${baseStyles.textPrimary}; font-size: 15px; line-height: 1.6;">${text}</p>`;
}

/**
 * Alert/Notice box (warning, info, success, danger)
 */
export function alert(text: string, type: 'info' | 'warning' | 'success' | 'danger' = 'info'): string {
	const colors = {
		info: { bg: '#eff6ff', border: baseStyles.info, icon: 'ℹ️' },
		warning: { bg: '#fffbeb', border: baseStyles.warning, icon: '⚠️' },
		success: { bg: '#f0fdf4', border: baseStyles.success, icon: '✅' },
		danger: { bg: '#fef2f2', border: baseStyles.danger, icon: '❌' }
	};

	const style = colors[type];

	return `
		<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: ${baseStyles.spacing.md} 0; border-left: 4px solid ${style.border}; background-color: ${style.bg}; border-radius: 4px;">
			<tr>
				<td style="padding: ${baseStyles.spacing.lg};">
					<div style="font-size: 20px; margin-bottom: ${baseStyles.spacing.sm};">${style.icon}</div>
					<p style="margin: 0; color: ${baseStyles.textPrimary}; font-size: 15px; line-height: 1.6;">${text}</p>
				</td>
			</tr>
		</table>
	`;
}
