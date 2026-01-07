<script lang="ts">
	import { useIntlayer } from 'svelte-intlayer';

	const about = useIntlayer('about');
</script>

<svelte:head>
	<title>{$about.title.value} | Local Snow</title>
	<meta name="description" content={$about.meta_description.value} />

	<!-- Open Graph -->
	<meta property="og:title" content="{$about.title.value} | Local Snow" />
	<meta property="og:description" content={$about.meta_description.value} />
	<meta property="og:url" content="https://localsnow.org/about" />
	<meta property="og:image" content="https://localsnow.org/og-image.jpg" />
	<meta property="og:type" content="website" />

	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="{$about.title.value} | Local Snow" />
	<meta name="twitter:description" content={$about.meta_description.value} />
	<meta name="twitter:image" content="https://localsnow.org/og-image.jpg" />

	<link rel="canonical" href="https://localsnow.org/about" />
</svelte:head>

<article class="prose prose-sm mx-auto max-w-2xl">
	<h1 class="title2">{$about.title.value}</h1>

	<section class="my-6">
		<h2 class="title3">{$about.who_built_title.value}</h2>
		<p>
			{m["about.about_who_built_p1"]()}
		</p>
	</section>

	<section class="my-6">
		<h2 class="title3">{$about.economic_title.value}</h2>
		<p>
			{m["about.about_economic_p1"]()}
		</p>
		<p>
			{m["about.about_economic_p2"]()}
		</p>
		<p>
			{m["about.about_economic_p3"]()}
		</p>
	</section>

	<section class="my-6">
		<h2 class="title3">{$about.visibility_title.value}</h2>
		<p>
			{m["about.about_visibility_p1"]()}
		</p>
		<p>
			{m["about.about_visibility_p2"]()}
		</p>
	</section>

	<section class="my-6">
		<h2 class="title3">{$about.risk_title.value}</h2>
		<p>
			{m["about.about_risk_p1"]()}
		</p>
		<p>
			{m["about.about_risk_p2"]()}
		</p>
	</section>

	<section class="my-6">
		<h2 class="title3">{$about.what_is_title.value}</h2>
		<p>
			{m["about.about_what_is_p1"]()}
		</p>
		<p>
			{m["about.about_what_is_p2"]()}
		</p>
		<p>{m["about.about_what_is_p3"]()}</p>
	</section>

	<section class="my-6">
		<h2 class="title3">{$about.verification_title.value}</h2>
		<p>
			{m["about.about_verification_p1"]()}
		</p>
		<p>
			{m["about.about_verification_p2"]()}
		</p>
	</section>

	<section class="my-6">
		<h2 class="title3">{$about.spain_title.value}</h2>
		<p>
			{m["about.about_spain_p1"]()}
		</p>
	</section>

	<section class="my-6">
		<h2 class="title3">{$about.goal_title.value}</h2>
		<p>
			{m["about.about_goal_p1"]()}
		</p>
		<p>
			{m["about.about_goal_p2"]()}
		</p>
	</section>

	<section class="my-6">
		<h2 class="title3">{$about.contact_title.value}</h2>
		<p>
			{@html m.about_contact_p1({
				createProfile: `<a href="/signup">${$about.contact_create_profile.value}</a>`,
				email: `<strong>${$about.contact_email.value}</strong>`
			})}
		</p>
		<p>{m["about.about_contact_p2"]()}</p>
	</section>
</article>
