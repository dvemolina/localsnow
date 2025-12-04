<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import { route } from '$lib/i18n/routeHelpers';

	// FAQ Schema for SEO
	const faqSchema = {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: [
			{
				'@type': 'Question',
				name: 'Is LocalSnow really 100% free?',
				acceptedAnswer: {
					'@type': 'Answer',
					text: 'Yes! LocalSnow is completely free for both students and instructors. No booking fees, no commissions, no hidden costs. We connect you directly—you handle payment and scheduling yourselves.'
				}
			},
			{
				'@type': 'Question',
				name: 'How do you make money if everything is free?',
				acceptedAnswer: {
					'@type': 'Answer',
					text: 'Currently, we don\'t. LocalSnow is open-source and community-driven. While we\'re growing the platform, we\'re keeping it completely free. In the future, we may need to introduce minimal fees to cover costs, but we\'ll give plenty of notice and keep them far below what other platforms charge.'
				}
			},
			{
				'@type': 'Question',
				name: 'Do instructors pay anything to receive booking requests?',
				acceptedAnswer: {
					'@type': 'Answer',
					text: 'No. Instructors receive all contact information immediately and for free. No lead fees, no subscriptions, no payment required.'
				}
			},
			{
				'@type': 'Question',
				name: 'How do students pay for lessons?',
				acceptedAnswer: {
					'@type': 'Answer',
					text: 'Students contact instructors directly through the platform, then arrange payment and lesson details outside LocalSnow. We don\'t process any payments—instructors keep 100% of their lesson fees.'
				}
			}
		]
	};
</script>

<svelte:head>
	<title>How It Works - 100% Free Ski Instructor Directory | LocalSnow</title>
	<meta
		name="description"
		content="LocalSnow is a free platform connecting ski instructors and students. No booking fees, no commissions, no hidden costs. See how our free directory works."
	/>

	<!-- Open Graph -->
	<meta property="og:title" content="How LocalSnow Works - 100% Free Directory" />
	<meta
		property="og:description"
		content="Completely free platform for finding ski instructors. No fees, no commissions, direct contact."
	/>
	<meta property="og:url" content="https://localsnow.org/how-it-works" />
	<meta property="og:image" content="https://localsnow.org/og-image.jpg" />
	<meta property="og:type" content="website" />

	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="How LocalSnow Works - 100% Free Directory" />
	<meta
		name="twitter:description"
		content="Completely free platform for finding ski instructors. No fees, no commissions, direct contact."
	/>
	<meta name="twitter:image" content="https://localsnow.org/og-image.jpg" />

	<!-- FAQ Schema -->
	<script type="application/ld+json">
		{JSON.stringify(faqSchema)}
	</script>

	<link rel="canonical" href="https://localsnow.org/how-it-works" />
</svelte:head>

<article class="prose prose-sm mx-auto max-w-3xl">
	<h1 class="title2">How LocalSnow Works</h1>

	<p class="text-lg text-muted-foreground">
		LocalSnow is a <strong>100% free directory</strong> connecting ski and snowboard instructors
		with students. No booking fees, no commissions, no deposits. Just direct contact.
	</p>

	<!-- Free Highlight -->
	<div
		class="my-8 rounded-lg border-2 border-green-500 bg-gradient-to-r from-green-50 to-blue-50 p-6 not-prose"
	>
		<div class="flex items-center gap-3 mb-3">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				class="text-green-600"
				><polyline points="20 6 9 17 4 12"></polyline></svg
			>
			<h3 class="text-xl font-bold text-green-900 m-0">100% Free Right Now.</h3>
		</div>
		<p class="text-gray-700 m-0">
			No "trial periods." No "premium plans." No catch. LocalSnow is open-source and
			community-driven. We're keeping it free while we build and grow the platform—no commissions, no fees.
		</p>
	</div>

	<!-- For Students Section -->
	<section class="mt-12 rounded-lg border border-border bg-card p-6 shadow-sm not-prose">
		<h2 class="title3 mb-6">For Students</h2>

		<div class="space-y-6">
			<div class="flex gap-4">
				<div
					class="bg-primary/10 text-primary flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-lg font-bold"
				>
					1
				</div>
				<div>
					<h3 class="title4 mb-2">Search for Instructors</h3>
					<p class="text-sm text-gray-600">
						Browse our directory of certified ski and snowboard instructors. Filter by resort,
						sport, language, and experience level. All profiles are free to view.
					</p>
				</div>
			</div>

			<div class="flex gap-4">
				<div
					class="bg-primary/10 text-primary flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-lg font-bold"
				>
					2
				</div>
				<div>
					<h3 class="title4 mb-2">Send a Booking Request</h3>
					<p class="text-sm text-gray-600">
						Found the perfect instructor? Send them a booking request with your preferred dates,
						times, and lesson details. <strong>No payment required</strong>—just fill out the
						form and submit.
					</p>
				</div>
			</div>

			<div class="flex gap-4">
				<div
					class="bg-primary/10 text-primary flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-lg font-bold"
				>
					3
				</div>
				<div>
					<h3 class="title4 mb-2">Get Contact Info Immediately</h3>
					<p class="text-sm text-gray-600">
						The instructor receives your contact information instantly. They'll reach out to you
						directly to confirm availability, discuss lesson details, and arrange payment.
					</p>
				</div>
			</div>

			<div class="flex gap-4">
				<div
					class="bg-primary/10 text-primary flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-lg font-bold"
				>
					4
				</div>
				<div>
					<h3 class="title4 mb-2">Arrange Your Lesson</h3>
					<p class="text-sm text-gray-600">
						Work directly with your instructor to finalize dates, times, meeting location, and
						payment. LocalSnow doesn't process payments—you pay the instructor directly using
						their preferred method.
					</p>
				</div>
			</div>

			<div class="flex gap-4">
				<div
					class="bg-primary/10 text-primary flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-lg font-bold"
				>
					5
				</div>
				<div>
					<h3 class="title4 mb-2">Enjoy Your Lesson!</h3>
					<p class="text-sm text-gray-600">
						Hit the slopes with your instructor and have an amazing time. After your lesson,
						consider leaving a review to help future students.
					</p>
				</div>
			</div>
		</div>

		<div class="mt-6 rounded-md bg-green-50 border border-green-200 p-4">
			<h4 class="font-semibold text-green-900 mb-2">Students Pay:</h4>
			<ul class="space-y-1 text-sm text-green-800 mb-0">
				<li>✅ <strong>€0 booking fees</strong></li>
				<li>✅ <strong>Unlimited requests</strong> - contact as many instructors as you want</li>
				<li>✅ <strong>No deposits</strong> - we don't hold any money</li>
				<li>
					✅ <strong>Direct payment</strong> - negotiate rates and pay your instructor directly
				</li>
			</ul>
		</div>
	</section>

	<!-- For Instructors Section -->
	<section class="mt-12 rounded-lg border border-border bg-card p-6 shadow-sm not-prose">
		<h2 class="title3 mb-6">For Instructors</h2>

		<div class="space-y-6">
			<div class="flex gap-4">
				<div
					class="bg-primary/10 text-primary flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-lg font-bold"
				>
					1
				</div>
				<div>
					<h3 class="title4 mb-2">Create Your Free Profile</h3>
					<p class="text-sm text-gray-600">
						Sign up and build your instructor profile with your certifications, experience,
						languages, and pricing. Add photos and set your availability. <strong
							>100% free—no subscriptions, no setup fees.</strong
						>
					</p>
				</div>
			</div>

			<div class="flex gap-4">
				<div
					class="bg-primary/10 text-primary flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-lg font-bold"
				>
					2
				</div>
				<div>
					<h3 class="title4 mb-2">Receive Booking Requests</h3>
					<p class="text-sm text-gray-600">
						When a student sends you a booking request, you'll get an instant email notification
						with all their details: dates, times, skill level, and full contact information.
					</p>
				</div>
			</div>

			<div class="flex gap-4">
				<div
					class="bg-primary/10 text-primary flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-lg font-bold"
				>
					3
				</div>
				<div>
					<h3 class="title4 mb-2">View Contact Info For Free</h3>
					<p class="text-sm text-gray-600">
						<strong>No lead fees!</strong> See the student's email and phone number immediately in
						your dashboard. No payment required to unlock contact information.
					</p>
				</div>
			</div>

			<div class="flex gap-4">
				<div
					class="bg-primary/10 text-primary flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-lg font-bold"
				>
					4
				</div>
				<div>
					<h3 class="title4 mb-2">Contact Students Directly</h3>
					<p class="text-sm text-gray-600">
						Reach out to the student via email or phone to confirm your availability, discuss
						lesson details, and arrange payment. You're in control of your schedule and rates.
					</p>
				</div>
			</div>

			<div class="flex gap-4">
				<div
					class="bg-primary/10 text-primary flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-lg font-bold"
				>
					5
				</div>
				<div>
					<h3 class="title4 mb-2">Teach & Get Paid Directly</h3>
					<p class="text-sm text-gray-600">
						Conduct the lesson and receive payment directly from the student using your preferred
						method (cash, bank transfer, payment app). <strong
							>LocalSnow takes 0% commission</strong
						>—you keep every euro you earn.
					</p>
				</div>
			</div>
		</div>

		<div class="mt-6 rounded-md bg-green-50 border border-green-200 p-4">
			<h4 class="font-semibold text-green-900 mb-2">Instructors Pay:</h4>
			<ul class="space-y-1 text-sm text-green-800 mb-0">
				<li>✅ <strong>€0 listing fees</strong> - create your profile for free</li>
				<li>✅ <strong>€0 per booking request</strong> - no lead fees or unlock fees</li>
				<li>✅ <strong>0% commission</strong> - keep 100% of your lesson fees</li>
				<li>✅ <strong>No monthly subscriptions</strong> - completely free while we grow</li>
			</ul>
		</div>
	</section>

	<!-- FAQ Section -->
	<section class="mt-12 not-prose">
		<h2 class="title3">Frequently Asked Questions</h2>

		<div class="space-y-6 mt-6">
			<div class="rounded-lg border border-border p-5">
				<h3 class="title4 mb-2">Is LocalSnow really 100% free?</h3>
				<p class="text-sm text-gray-600 mb-0">
					<strong>Yes!</strong> LocalSnow is completely free for both students and instructors. No booking
					fees, no commissions, no hidden costs. We connect you directly—you handle payment and scheduling
					yourselves.
				</p>
			</div>

			<div class="rounded-lg border border-border p-5">
				<h3 class="title4 mb-2">How do you make money if everything is free?</h3>
				<p class="text-sm text-gray-600 mb-0">
					Currently, we don't. LocalSnow is <strong>open-source and community-driven</strong>. While we're growing the platform, we're keeping it completely free. In
					the future, we may need to introduce minimal fees to cover costs, but we'll give plenty of notice and keep them far below what other platforms charge. We're building the platform we wish existed—not maximizing
					profit.
				</p>
			</div>

			<div class="rounded-lg border border-border p-5">
				<h3 class="title4 mb-2">Do instructors pay anything to receive booking requests?</h3>
				<p class="text-sm text-gray-600 mb-0">
					<strong>No.</strong> Instructors receive all contact information immediately and for free.
					No lead fees, no subscriptions, no payment required. Just direct access to potential students.
				</p>
			</div>

			<div class="rounded-lg border border-border p-5">
				<h3 class="title4 mb-2">How do students pay for lessons?</h3>
				<p class="text-sm text-gray-600 mb-0">
					Students contact instructors directly through the platform, then arrange payment and
					lesson details <strong>outside LocalSnow</strong>. We don't process any payments—instructors
					keep 100% of their lesson fees. Common methods include cash, bank transfer, or payment apps
					like Bizum.
				</p>
			</div>

			<div class="rounded-lg border border-border p-5">
				<h3 class="title4 mb-2">What if an instructor doesn't respond to my request?</h3>
				<p class="text-sm text-gray-600 mb-0">
					Instructors manage their own schedules and availability. If you don't hear back within 24-48
					hours, try contacting another instructor. You can send <strong
						>unlimited booking requests</strong
					> at no cost.
				</p>
			</div>

			<div class="rounded-lg border border-border p-5">
				<h3 class="title4 mb-2">Is LocalSnow safe?</h3>
				<p class="text-sm text-gray-600 mb-0">
					We verify instructor certifications when possible, but ultimately you're responsible for
					vetting your instructor. Read reviews, ask for credentials, and trust your instincts.
					Since LocalSnow doesn't process payments, there's no financial risk using our platform.
				</p>
			</div>
		</div>
	</section>

	<!-- Why We're Different Section -->
	<section class="mt-12 rounded-lg bg-gray-50 border-2 border-gray-200 p-8 not-prose">
		<h2 class="title3 text-center mb-6">Why LocalSnow is Different</h2>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			<div class="bg-white rounded-lg p-5 border border-gray-200">
				<h3 class="font-bold text-red-700 mb-2">❌ Traditional Booking Platforms</h3>
				<ul class="text-sm text-gray-600 space-y-1.5 pl-5 mb-0">
					<li>15-30% commission per lesson</li>
					<li>Booking fees for students</li>
					<li>Mandatory payment processing</li>
					<li>Profit-driven, VC-funded</li>
					<li>Complex pricing tiers</li>
				</ul>
			</div>

			<div class="bg-white rounded-lg p-5 border border-green-500">
				<h3 class="font-bold text-green-700 mb-2">✅ LocalSnow</h3>
				<ul class="text-sm text-gray-600 space-y-1.5 pl-5 mb-0">
					<li><strong>0% commission</strong> - instructors keep everything</li>
					<li><strong>€0 booking fees</strong> - completely free</li>
					<li><strong>Direct contact</strong> - you arrange payment</li>
					<li><strong>Community-driven</strong> - open-source</li>
					<li><strong>Simple & transparent</strong> - no hidden costs</li>
				</ul>
			</div>
		</div>

		<div class="mt-6 text-center">
			<p class="text-gray-700 mb-0">
				<strong>Sound too good to be true?</strong> Check our
				<a
					href="https://github.com/dvemolina/localsnow"
					target="_blank"
					rel="noopener"
					class="text-primary underline font-medium">open-source code</a
				> or read our <a href={route('/')} class="text-primary underline font-medium"
					>mission statement</a
				>.
			</p>
		</div>
	</section>

	<!-- CTA Section -->
	<section class="mt-12 text-center not-prose">
		<h2 class="title3 mb-6">Ready to Get Started?</h2>
		<div class="flex flex-col gap-4 sm:flex-row sm:justify-center">
			<a
				href={route('/')}
				class="bg-primary inline-block rounded-md px-6 py-3 font-medium text-white"
			>
				Find an Instructor
			</a>
			<a
				href={route('/signup')}
				class="inline-block rounded-md border border-border bg-card px-6 py-3 font-medium"
			>
				List as an Instructor
			</a>
		</div>
		<p class="mt-4 text-sm text-gray-600">
			100% free. No credit card required. No hidden fees.
		</p>
	</section>
</article>
