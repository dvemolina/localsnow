<script lang="ts">
	const lastUpdated = '2025-11-11';
</script>

<svelte:head>
	<title>Cookie Policy | Local Snow</title>
	<meta
		name="description"
		content="Learn about how Local Snow uses cookies and similar technologies. Manage your cookie preferences and understand our tracking practices."
	/>
</svelte:head>

<article class="prose prose-sm mx-auto max-w-3xl dark:prose-invert">
	<h1>Cookie Policy</h1>
	<p class="text-sm text-muted-foreground">Last updated: {lastUpdated}</p>

	<section>
		<h2>1. Introduction</h2>
		<p>
			This Cookie Policy explains how Local Snow ("we," "us," or "our") uses cookies and similar
			tracking technologies on our website at <strong>localsnow.org</strong> (the "Platform").
		</p>
		<p>
			By using our Platform, you consent to the use of cookies as described in this policy. You
			can control cookie settings through your browser or our cookie consent banner.
		</p>
	</section>

	<section>
		<h2>2. What Are Cookies?</h2>
		<p>
			Cookies are small text files stored on your device (computer, smartphone, tablet) when you
			visit a website. They help websites remember your preferences, recognize you on return
			visits, and provide a better user experience.
		</p>
		<p>Cookies can be:</p>
		<ul>
			<li>
				<strong>Session Cookies:</strong> Temporary cookies that expire when you close your browser
			</li>
			<li>
				<strong>Persistent Cookies:</strong> Cookies that remain on your device for a specified period
				or until manually deleted
			</li>
			<li>
				<strong>First-Party Cookies:</strong> Set directly by our Platform
			</li>
			<li>
				<strong>Third-Party Cookies:</strong> Set by external services we use (e.g., payment processors,
				analytics)
			</li>
		</ul>
	</section>

	<section>
		<h2>3. How We Use Cookies</h2>

		<h3>3.1 Strictly Necessary Cookies (Essential)</h3>
		<p>
			These cookies are essential for the Platform to function properly. They cannot be disabled
			without severely impacting your ability to use our services.
		</p>
		<table>
			<thead>
				<tr>
					<th>Cookie Name</th>
					<th>Purpose</th>
					<th>Duration</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td><code>auth_session</code></td>
					<td>Authentication session management; keeps you logged in</td>
					<td>30 days</td>
				</tr>
				<tr>
					<td><code>cookie_consent</code></td>
					<td>Stores your cookie consent preferences</td>
					<td>1 year</td>
				</tr>
				<tr>
					<td><code>csrf_token</code></td>
					<td>Security token to prevent cross-site request forgery attacks</td>
					<td>Session</td>
				</tr>
			</tbody>
		</table>
		<p>
			<strong>Legal Basis:</strong> These cookies are necessary for the performance of our contract
			with you (GDPR Article 6(1)(b)).
		</p>

		<h3>3.2 Functional Cookies</h3>
		<p>
			These cookies enhance functionality and personalization but are not strictly necessary. They
			remember your preferences and settings.
		</p>
		<table>
			<thead>
				<tr>
					<th>Cookie Name</th>
					<th>Purpose</th>
					<th>Duration</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td><code>theme_preference</code></td>
					<td>Remembers your light/dark mode preference</td>
					<td>1 year</td>
				</tr>
				<tr>
					<td><code>language_preference</code></td>
					<td>Stores your preferred language for the interface</td>
					<td>1 year</td>
				</tr>
				<tr>
					<td><code>search_filters</code></td>
					<td>Remembers your last used search filters for convenience</td>
					<td>30 days</td>
				</tr>
			</tbody>
		</table>
		<p>
			<strong>Legal Basis:</strong> Your consent (GDPR Article 6(1)(a)). You can withdraw consent
			at any time.
		</p>

		<h3>3.3 Analytics Cookies (Currently Not Implemented)</h3>
		<p>
			We currently do not use analytics cookies. If we implement analytics in the future (e.g.,
			Google Analytics), we will:
		</p>
		<ul>
			<li>Update this Cookie Policy</li>
			<li>Request your explicit consent via the cookie banner</li>
			<li>Allow you to opt-out at any time</li>
			<li>Anonymize IP addresses to protect privacy</li>
		</ul>

		<h3>3.4 Advertising Cookies (Not Used)</h3>
		<p>
			We do <strong>not</strong> use advertising cookies or track you for behavioral advertising purposes.
			We do not sell your data to third parties.
		</p>
	</section>

	<section>
		<h2>4. Third-Party Cookies</h2>
		<p>
			Certain third-party services we use may set their own cookies when you interact with their
			features:
		</p>

		<h3>4.1 Payment Processing (Stripe)</h3>
		<p>
			When you process payments, Stripe may set cookies for fraud prevention and secure payment
			processing. Stripe's cookie usage is governed by their own privacy policy at <a
				href="https://stripe.com/privacy"
				target="_blank"
				rel="noopener noreferrer">stripe.com/privacy</a
			>.
		</p>

		<h3>4.2 Google OAuth (Authentication)</h3>
		<p>
			If you sign in with Google, Google may set cookies for authentication purposes. Google's
			cookie practices are described at <a
				href="https://policies.google.com/technologies/cookies"
				target="_blank"
				rel="noopener noreferrer">policies.google.com/technologies/cookies</a
			>.
		</p>

		<h3>4.3 Google Calendar API</h3>
		<p>
			If you connect your Google Calendar for availability management, Google may set cookies
			related to calendar access. This requires your explicit consent during the OAuth flow.
		</p>
	</section>

	<section>
		<h2>5. How We Protect Your Privacy</h2>
		<ul>
			<li>
				<strong>Minimal Data Collection:</strong> We only use essential cookies and avoid unnecessary
				tracking
			</li>
			<li>
				<strong>HTTP-Only Cookies:</strong> Authentication cookies are HTTP-only to prevent JavaScript
				access (XSS protection)
			</li>
			<li>
				<strong>Secure Transmission:</strong> All cookies transmitted over HTTPS with Secure flag
			</li>
			<li>
				<strong>SameSite Protection:</strong> Cookies use SameSite attribute to prevent CSRF attacks
			</li>
			<li>
				<strong>IP Anonymization:</strong> Profile view tracking uses SHA-256 hashed IP addresses
			</li>
			<li>
				<strong>No Cross-Site Tracking:</strong> We do not track you across other websites
			</li>
		</ul>
	</section>

	<section>
		<h2>6. Managing Your Cookie Preferences</h2>

		<h3>6.1 Cookie Consent Banner</h3>
		<p>
			When you first visit our Platform, you'll see a cookie consent banner allowing you to:
		</p>
		<ul>
			<li><strong>Accept All:</strong> Consent to all cookies (essential and functional)</li>
			<li><strong>Reject Non-Essential:</strong> Use only strictly necessary cookies</li>
			<li>
				<strong>Customize:</strong> Choose which categories of cookies to accept (if available)
			</li>
		</ul>
		<p>You can change your preferences at any time by clicking "Cookie Settings" in the footer.</p>

		<h3>6.2 Browser Settings</h3>
		<p>You can also manage cookies through your browser settings:</p>
		<ul>
			<li>
				<strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data
			</li>
			<li>
				<strong>Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data
			</li>
			<li>
				<strong>Safari:</strong> Preferences → Privacy → Cookies and website data
			</li>
			<li>
				<strong>Edge:</strong> Settings → Cookies and site permissions → Cookies and site data
			</li>
		</ul>
		<p>
			<strong>Note:</strong> Blocking essential cookies will prevent you from logging in and using
			core Platform features.
		</p>

		<h3>6.3 Do Not Track (DNT)</h3>
		<p>
			We respect browser Do Not Track signals. If your browser sends a DNT signal, we will not set
			non-essential cookies without your explicit consent.
		</p>
	</section>

	<section>
		<h2>7. Cookie Retention and Deletion</h2>
		<p>Cookies are retained for the durations specified in the tables above. You can delete cookies:</p>
		<ul>
			<li>
				<strong>Manually:</strong> Clear cookies through your browser settings at any time
			</li>
			<li>
				<strong>Automatically:</strong> Session cookies are deleted when you close your browser
			</li>
			<li>
				<strong>On Logout:</strong> Authentication cookies are cleared when you log out
			</li>
			<li>
				<strong>On Account Deletion:</strong> We invalidate all your cookies when you delete your
				account
			</li>
		</ul>
	</section>

	<section>
		<h2>8. Cookies and GDPR Compliance</h2>
		<p>
			In compliance with the General Data Protection Regulation (GDPR) and the ePrivacy Directive
			(Cookie Law):
		</p>
		<ul>
			<li>We obtain consent before setting non-essential cookies</li>
			<li>We provide clear information about cookie purposes</li>
			<li>You can withdraw consent at any time</li>
			<li>Essential cookies are exempt from consent requirements</li>
			<li>We maintain records of your consent choices</li>
		</ul>
	</section>

	<section>
		<h2>9. Cookies on Mobile Devices</h2>
		<p>
			If you access our Platform through a mobile browser, cookies function similarly to desktop
			browsers. You can manage cookies through your mobile browser settings.
		</p>
		<p>
			<strong>Note:</strong> We do not currently have native mobile apps. If we develop apps in the
			future, they may use similar technologies (e.g., local storage) that will be disclosed in updated
			policies.
		</p>
	</section>

	<section>
		<h2>10. Changes to This Cookie Policy</h2>
		<p>
			We may update this Cookie Policy periodically to reflect changes in our practices or legal
			requirements. We will notify you of material changes by:
		</p>
		<ul>
			<li>Updating the "Last Updated" date at the top of this page</li>
			<li>Displaying a notice on the Platform</li>
			<li>Sending an email to registered users for significant changes</li>
		</ul>
		<p>
			Your continued use of the Platform after changes indicates acceptance of the updated Cookie
			Policy.
		</p>
	</section>

	<section>
		<h2>11. Contact Us</h2>
		<p>If you have questions about our use of cookies, please contact us:</p>
		<p>
			<strong>Email:</strong> privacy@localsnow.org<br />
			<strong>Subject Line:</strong> Cookie Policy Inquiry<br />
			<strong>Website:</strong> <a href="https://localsnow.org">https://localsnow.org</a>
		</p>
	</section>

	<section class="mt-8 rounded-lg border border-border bg-muted p-4">
		<h3 class="mb-2 text-sm font-semibold">Cookie Policy Summary</h3>
		<ul class="text-sm">
			<li><strong>Essential Cookies:</strong> Authentication, security, session management (always active)</li>
			<li><strong>Functional Cookies:</strong> Preferences, settings (requires consent)</li>
			<li><strong>Analytics:</strong> Not currently used; will require consent if implemented</li>
			<li><strong>Advertising:</strong> Not used at all; we don't track for ads</li>
			<li>
				<strong>Third Parties:</strong> Only Stripe (payments) and Google (OAuth/Calendar) with their
				own policies
			</li>
			<li><strong>Control:</strong> Manage via cookie banner or browser settings</li>
			<li><strong>Compliance:</strong> GDPR and ePrivacy Directive compliant</li>
		</ul>
	</section>
</article>
