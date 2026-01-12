<script lang="ts">
	import { t } from '$lib/i18n/i18n';</script>

<svelte:head>
	<title>{$t('about_title')} | Local Snow</title>
	<meta name="description" content={$t('about_meta_description')} />

	<!-- Open Graph -->
	<meta property="og:title" content="{$t('about_title')} | Local Snow" />
	<meta property="og:description" content={$t('about_meta_description')} />
	<meta property="og:url" content="https://localsnow.org/about" />
	<meta property="og:image" content="https://localsnow.org/og-image.jpg" />
	<meta property="og:type" content="website" />

	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="{$t('about_title')} | Local Snow" />
	<meta name="twitter:description" content={$t('about_meta_description')} />
	<meta name="twitter:image" content="https://localsnow.org/og-image.jpg" />

	<link rel="canonical" href="https://localsnow.org/about" />
</svelte:head>

<article class="prose prose-sm mx-auto max-w-2xl">
	<h1 class="title2">{$t('about_title')}</h1>

	<section class="my-6">
		<h2 class="title3">{$t('about_who_built_title')}</h2>
		<p>
			{$t('about_about_who_built_p1')}
		</p>
	</section>

	<section class="my-6">
		<h2 class="title3">{$t('about_economic_title')}</h2>
		<p>
			{$t('about_about_economic_p1')}
		</p>
		<p>
			{$t('about_about_economic_p2')}
		</p>
		<p>
			{$t('about_about_economic_p3')}
		</p>
	</section>

	<section class="my-6">
		<h2 class="title3">{$t('about_visibility_title')}</h2>
		<p>
			{$t('about_about_visibility_p1')}
		</p>
		<p>
			{$t('about_about_visibility_p2')}
		</p>
	</section>

	<section class="my-6">
		<h2 class="title3">{$t('about_risk_title')}</h2>
		<p>
			{$t('about_about_risk_p1')}
		</p>
		<p>
			{$t('about_about_risk_p2')}
		</p>
	</section>

	<section class="my-6">
		<h2 class="title3">{$t('about_what_is_title')}</h2>
		<p>
			{$t('about_about_what_is_p1')}
		</p>
		<p>
			{$t('about_about_what_is_p2')}
		</p>
		<p>{$t('about_about_what_is_p3')}</p>
	</section>

	<section class="my-6">
		<h2 class="title3">{$t('about_verification_title')}</h2>
		<p>
			{$t('about_about_verification_p1')}
		</p>
		<p>
			{$t('about_about_verification_p2')}
		</p>
	</section>

	<section class="my-6">
		<h2 class="title3">{$t('about_spain_title')}</h2>
		<p>
			{$t('about_about_spain_p1')}
		</p>
	</section>

	<section class="my-6">
		<h2 class="title3">{$t('about_goal_title')}</h2>
		<p>
			{$t('about_about_goal_p1')}
		</p>
		<p>
			{$t('about_about_goal_p2')}
		</p>
	</section>

	<section class="my-6">
		<h2 class="title3">{$t('about_contact_title')}</h2>
		<p>
			{@html $t('about_contact_p1', {
				values: {
					createProfile: `<a href="/signup">${$t('about_contact_create_profile')}</a>`,
					email: `<strong>${$t('about_contact_email')}</strong>`
				}
			})}
		</p>
		<p>{$t('about_about_contact_p2')}</p>
	</section>
</article>
