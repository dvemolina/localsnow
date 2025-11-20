<script lang="ts">
	import * as m from '$lib/paraglide/messages';
</script>

<svelte:head>
	<title>{m.about_title()} | Local Snow</title>
	<meta
		name="description"
		content={m.about_meta_description()}
	/>
</svelte:head>

<article class="prose prose-sm mx-auto max-w-2xl">
	<h1 class="title2">{m.about_title()}</h1>

	<section class="my-6">
		<h2 class="title3">{m.about_who_built_title()}</h2>
		<p>
			{m.about_who_built_p1()}
		</p>
	</section>

	<section class="my-6">
		<h2 class="title3">{m.about_economic_title()}</h2>
		<p>
			{m.about_economic_p1()}
		</p>
		<p>
			{m.about_economic_p2()}
		</p>
		<p>
			{m.about_economic_p3()}
		</p>
	</section>

	<section class="my-6">
		<h2 class="title3">{m.about_visibility_title()}</h2>
		<p>
			{m.about_visibility_p1()}
		</p>
		<p>
			{m.about_visibility_p2()}
		</p>
	</section>

	<section class="my-6">
		<h2 class="title3">{m.about_risk_title()}</h2>
		<p>
			{m.about_risk_p1()}
		</p>
		<p>
			{m.about_risk_p2()}
		</p>
	</section>

	<section class="my-6">
		<h2 class="title3">{m.about_what_is_title()}</h2>
		<p>
			{m.about_what_is_p1()}
		</p>
		<p>
			{m.about_what_is_p2()}
		</p>
		<p>{m.about_what_is_p3()}</p>
	</section>

	<section class="my-6">
		<h2 class="title3">{m.about_verification_title()}</h2>
		<p>
			{m.about_verification_p1()}
		</p>
		<p>
			{m.about_verification_p2()}
		</p>
	</section>

	<section class="my-6">
		<h2 class="title3">{m.about_spain_title()}</h2>
		<p>
			{m.about_spain_p1()}
		</p>
	</section>

	<section class="my-6">
		<h2 class="title3">{m.about_goal_title()}</h2>
		<p>
			{m.about_goal_p1()}
		</p>
		<p>
			{m.about_goal_p2()}
		</p>
	</section>

	<section class="my-6">
		<h2 class="title3">{m.about_contact_title()}</h2>
		<p>
			{@html m.about_contact_p1()
				.replace('{createProfile}', `<a href="/signup">${m.about_contact_create_profile()}</a>`)
				.replace('{email}', `<strong>${m.about_contact_email()}</strong>`)}
		</p>
		<p>{m.about_contact_p2()}</p>
	</section>
</article>
