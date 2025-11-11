<script lang="ts">
	import { page } from '$app/state';
	const lastUpdated = '2025-11-11';
</script>

<svelte:head>
	<title>Privacy Policy | Local Snow</title>
	<meta
		name="description"
		content="Learn how Local Snow collects, uses, and protects your personal data. GDPR compliant privacy policy for our ski and snowboard instructor marketplace."
	/>
</svelte:head>

<article class="prose prose-sm mx-auto max-w-3xl dark:prose-invert">
	<h1 class="title-2">Privacy Policy</h1>
	<p class="text-sm text-muted-foreground">Last updated: {lastUpdated}</p>

	<section>
		<h2 class="title-3">1. Introduction</h2>
		<p>
			Local Snow ("we," "our," or "us") operates a marketplace platform connecting ski and
			snowboard instructors with clients worldwide. We are committed to protecting your personal
			data and respecting your privacy rights in compliance with the General Data Protection
			Regulation (GDPR), the California Consumer Privacy Act (CCPA), and other applicable data
			protection laws.
		</p>
		<p>
			This Privacy Policy explains how we collect, use, share, and protect your personal
			information when you use our website at <strong>localsnow.org</strong> (the "Platform").
		</p>
	</section>

	<section>
		<h2 class="title-3">2. Data Controller</h2>
		<p>
			Local Snow is the data controller responsible for your personal data. For privacy-related
			inquiries, please contact us at:
		</p>
		<p>
			<strong>Email:</strong> privacy@localsnow.org<br />
		</p>
	</section>

	<section>
		<h2 class="title-3">3. Information We Collect</h2>

		<h3 class="title-4">3.1 Information You Provide</h3>
		<ul>
			<li>
				<strong>Account Information:</strong> Name, email address, username, password (hashed), profile
				photo
			</li>
			<li>
				<strong>Instructor Profiles:</strong> Professional qualifications, certifications, spoken languages,
				teaching experience, sports specializations, resort affiliations, photos, biography
			</li>
			<li>
				<strong>Contact Information:</strong> Phone number (with country code), professional address
			</li>
			<li>
				<strong>Booking Information:</strong> Client name, email, phone number, lesson dates, number of
				students, skill levels, special requests, estimated pricing
			</li>
			<li>
				<strong>Payment Information:</strong> Processed securely by Stripe (we do not store full payment
				card details)
			</li>
			<li>
				<strong>Communications:</strong> Messages sent through our platform, email correspondence, booking
				requests
			</li>
		</ul>

		<h3 class="title-4">3.2 Information Collected Automatically</h3>
		<ul>
			<li>
				<strong>Usage Data:</strong> IP address, browser type, device information, pages visited, time
				spent on pages, referring URLs
			</li>
			<li>
				<strong>Cookies and Similar Technologies:</strong> Session cookies, authentication tokens, preference
				settings (see Cookie Policy for details)
			</li>
			<li>
				<strong>Profile Analytics:</strong> Profile views, search appearances, booking request counts (anonymized
				visitor IP addresses using SHA-256 hashing)
			</li>
		</ul>

		<h3 class="title-4">3.3 Information from Third Parties</h3>
		<ul>
			<li>
				<strong>Google OAuth:</strong> If you sign in with Google, we receive your name, email, profile
				picture, and Google account ID
			</li>
			<li>
				<strong>Google Calendar:</strong> If you connect your calendar, we access availability data to
				help manage bookings (requires explicit consent)
			</li>
			<li>
				<strong>Stripe:</strong> Payment processing data, transaction status, payout information for instructors
			</li>
		</ul>
	</section>

	<section>
		<h2 class="title-3">4. How We Use Your Information</h2>

		<h3 class="title-4">4.1 Legal Bases for Processing (GDPR)</h3>
		<p>We process your personal data based on the following legal grounds:</p>
		<ul>
			<li>
				<strong>Contract Performance:</strong> To provide our marketplace services, process bookings,
				and facilitate payments
			</li>
			<li>
				<strong>Legitimate Interests:</strong> To improve our platform, prevent fraud, ensure security,
				and provide customer support
			</li>
			<li>
				<strong>Consent:</strong> For marketing communications, optional features (like calendar integration),
				and non-essential cookies
			</li>
			<li>
				<strong>Legal Obligations:</strong> To comply with tax laws, financial regulations, and respond
				to legal requests
			</li>
		</ul>

		<h3 class="title-4">4.2 Specific Purposes</h3>
		<ul>
			<li>
				<strong>Account Management:</strong> Create and maintain your account, authenticate users, manage
				sessions
			</li>
			<li>
				<strong>Marketplace Operations:</strong> Display instructor profiles, enable search and filtering,
				match clients with instructors
			</li>
			<li>
				<strong>Booking Processing:</strong> Handle booking requests, process deposits (€15), manage
				lead fees (€5), send notifications
			</li>
			<li>
				<strong>Payment Processing:</strong> Process payments securely through Stripe, manage payouts
				to instructors, maintain transaction records
			</li>
			<li>
				<strong>Communications:</strong> Send booking confirmations, payment notifications, platform
				updates, respond to inquiries
			</li>
			<li>
				<strong>Analytics and Improvement:</strong> Track profile views, analyze search patterns, improve
				matching algorithms, enhance user experience
			</li>
			<li>
				<strong>Security and Fraud Prevention:</strong> Monitor for suspicious activity, implement rate
				limiting, prevent abuse
			</li>
			<li>
				<strong>Legal Compliance:</strong> Maintain records for tax purposes, respond to legal requests,
				enforce terms of service
			</li>
		</ul>
	</section>

	<section>
		<h2 class="title-3">5. How We Share Your Information</h2>

		<h3 class="title-4">5.1 With Other Users</h3>
		<ul>
			<li>
				<strong>Instructor Profiles:</strong> Publicly visible information (name, photo, biography,
				qualifications, languages, sports, resorts, reviews, base lesson pricing)
			</li>
			<li>
				<strong>Booking Requests:</strong> Your contact information is shared with instructors when
				you submit a booking request
			</li>
		</ul>

		<h3 class="title-4">5.2 Service Providers</h3>
		<ul>
			<li>
				<strong>Stripe:</strong> Payment processing and payout management
			</li>
			<li>
				<strong>n8n (Self-hosted):</strong> Email notification system for booking confirmations and
				instructor alerts
			</li>
			<li>
				<strong>Cloudflare R2:</strong> File storage for profile photos, qualification documents, and
				other uploads
			</li>
			<li>
				<strong>Google Calendar API:</strong> Optional calendar integration for availability management
			</li>
			<li>
				<strong>Database Hosting:</strong> PostgreSQL database hosted on secure servers
			</li>
		</ul>

		<h3 class="title-4">5.3 Legal Requirements</h3>
		<p>We may disclose your information when required to:</p>
		<ul>
			<li>Comply with legal obligations, court orders, or regulatory requirements</li>
			<li>Enforce our Terms of Service and protect our rights</li>
			<li>Prevent fraud, security threats, or illegal activities</li>
			<li>Protect the safety of users or the public</li>
		</ul>

		<h3 class="title-4">5.4 Business Transfers</h3>
		<p>
			In the event of a merger, acquisition, or sale of assets, your personal data may be
			transferred to the new entity. We will notify you of any such change and your options.
		</p>
	</section>

	<section>
		<h2 class="title-3">6. International Data Transfers</h2>
		<p>
			Local Snow operates globally. Your personal data may be transferred to and processed in
			countries outside your residence, including countries that may not have the same data
			protection laws as your jurisdiction.
		</p>
		<p>
			For transfers outside the European Economic Area (EEA), we ensure adequate protection
			through:
		</p>
		<ul>
			<li>Standard Contractual Clauses approved by the European Commission</li>
			<li>Service providers certified under applicable data protection frameworks</li>
			<li>Explicit consent where required by law</li>
		</ul>
	</section>

	<section>
		<h2 class="title-3">7. Data Retention</h2>
		<p>We retain your personal data for as long as necessary to fulfill the purposes outlined in this policy:</p>
		<ul>
			<li>
				<strong>Active Accounts:</strong> Data retained while your account remains active
			</li>
			<li>
				<strong>Deleted Accounts:</strong> Most personal data deleted within 30 days; financial records
				retained for 7 years (tax/legal requirements)
			</li>
			<li>
				<strong>Booking Records:</strong> Retained for 7 years to comply with financial regulations
			</li>
			<li>
				<strong>Communications:</strong> Retained for 2 years for support and legal purposes
			</li>
			<li>
				<strong>Analytics Data:</strong> Anonymized and aggregated data may be retained indefinitely
			</li>
		</ul>
	</section>

	<section>
		<h2 class="title-3">8. Your Rights and Choices</h2>

		<h3 class="title-4">8.1 GDPR Rights (for EEA Residents)</h3>
		<ul>
			<li>
				<strong>Right to Access:</strong> Request a copy of your personal data we hold
			</li>
			<li>
				<strong>Right to Rectification:</strong> Correct inaccurate or incomplete data
			</li>
			<li>
				<strong>Right to Erasure:</strong> Request deletion of your data ("right to be forgotten")
			</li>
			<li>
				<strong>Right to Restriction:</strong> Limit how we use your data
			</li>
			<li>
				<strong>Right to Data Portability:</strong> Receive your data in a machine-readable format
			</li>
			<li>
				<strong>Right to Object:</strong> Object to processing based on legitimate interests or direct
				marketing
			</li>
			<li>
				<strong>Right to Withdraw Consent:</strong> Withdraw consent for processing at any time
			</li>
			<li>
				<strong>Right to Lodge a Complaint:</strong> File a complaint with your local data protection
				authority
			</li>
		</ul>

		<h3 class="title-4">8.2 CCPA Rights (for California Residents)</h3>
		<ul>
			<li>
				<strong>Right to Know:</strong> Request disclosure of personal information collected, used,
				or shared
			</li>
			<li>
				<strong>Right to Delete:</strong> Request deletion of personal information
			</li>
			<li>
				<strong>Right to Opt-Out:</strong> Opt-out of the sale of personal information (note: we do
				not sell personal data)
			</li>
			<li>
				<strong>Right to Non-Discrimination:</strong> Equal service regardless of privacy choices
			</li>
		</ul>

		<h3 class="title-4">8.3 How to Exercise Your Rights</h3>
		<p>To exercise any of these rights, please contact us at:</p>
		<p>
			<strong>Email:</strong> privacy@localsnow.org<br />
		</p>
		<p>
			We will respond to your request within 30 days (GDPR) or 45 days (CCPA). We may require
			identity verification before processing your request.
		</p>
	</section>

	<section>
		<h2 class="title-3">9. Data Security</h2>
		<p>We implement industry-standard security measures to protect your personal data:</p>
		<ul>
			<li>
				<strong>Encryption:</strong> All data transmitted over HTTPS/TLS; passwords hashed with SHA-256
			</li>
			<li>
				<strong>Authentication:</strong> Secure session management with HTTP-only cookies
			</li>
			<li>
				<strong>Access Controls:</strong> Role-based permissions, rate limiting, and authentication
				requirements
			</li>
			<li>
				<strong>Monitoring:</strong> Automated security monitoring and anomaly detection
			</li>
			<li>
				<strong>Regular Audits:</strong> Periodic security assessments and vulnerability scanning
			</li>
		</ul>
		<p>
			However, no system is completely secure. We cannot guarantee absolute security of your data
			transmitted through the internet.
		</p>
	</section>

	<section>
		<h2 class="title-3">10. Children's Privacy</h2>
		<p>
			Our Platform is not intended for children under 16 years of age. We do not knowingly collect
			personal data from children under 16. If you believe a child has provided us with personal
			information, please contact us immediately, and we will delete such information.
		</p>
	</section>

	<section>
		<h2 class="title-3">11. Cookies and Tracking</h2>
		<p>
			We use cookies and similar technologies to provide and improve our services. For detailed
			information about our cookie practices, please see our <a href="/legal/cookies"
				>Cookie Policy</a
			>.
		</p>
		<p>You can control cookie preferences through your browser settings or our cookie consent banner.</p>
	</section>

	<section>
		<h2 class="title-3">12. Third-Party Links</h2>
		<p>
			Our Platform may contain links to third-party websites, including instructor personal
			websites and social media profiles. We are not responsible for the privacy practices of
			these external sites. We encourage you to review their privacy policies.
		</p>
	</section>

	<section>
		<h2 class="title-3">13. Changes to This Privacy Policy</h2>
		<p>
			We may update this Privacy Policy periodically to reflect changes in our practices or legal
			requirements. We will notify you of material changes by:
		</p>
		<ul>
			<li>Posting a notice on our Platform</li>
			<li>Sending an email to registered users</li>
			<li>Updating the "Last Updated" date at the top of this policy</li>
		</ul>
		<p>
			Your continued use of the Platform after changes indicates acceptance of the updated policy.
		</p>
	</section>

	<section>
		<h2 class="title-3">14. Contact Us</h2>
		<p>For questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact us:</p>
		<p>
			<strong>Email:</strong> privacy@localsnow.org<br />
			<strong>Website:</strong> <a href="https://localsnow.org">https://localsnow.org</a>
		</p>
		<p>
			<strong>Data Protection Officer:</strong> For GDPR-related inquiries, you may also contact our Data
			Protection Officer at dpo@localsnow.org
		</p>
	</section>

	<section class="mt-8 rounded-lg border border-border bg-muted p-4">
		<h3 class="title-4" class="mb-2 text-sm font-semibold">Summary of Key Points</h3>
		<ul class="text-sm">
			<li>We collect information you provide, usage data, and data from third parties</li>
			<li>We use your data to operate our marketplace, process bookings, and improve services</li>
			<li>We share data with instructors, service providers, and when legally required</li>
			<li>You have rights to access, correct, delete, and control your personal data</li>
			<li>We retain data as long as necessary; financial records kept 7 years for compliance</li>
			<li>We implement strong security measures but cannot guarantee absolute security</li>
			<li>Contact privacy@localsnow.org for privacy-related requests or questions</li>
		</ul>
	</section>
</article>
