<script lang="ts">
	import * as m from '$lib/paraglide/messages';
</script>

<svelte:head>
	<title>{m.seo_meta_how_it_works_title()}</title>
	<meta
		name="description"
		content={m.seo_meta_how_it_works_description()}
	/>
</svelte:head>

<article class="prose prose-sm mx-auto max-w-3xl dark:prose-invert">
	<h1 class="title2">{m.how_it_works_page_title()}</h1>

	<p class="text-lg text-muted-foreground">
		{m.how_it_works_page_intro()}
	</p>

	<!-- For Clients Section -->
	<section class="mt-12 rounded-lg border border-border bg-card p-6 shadow-sm">
		<h2 class="title3 mb-6">{m.how_it_works_page_clients_title()}</h2>

		<div class="space-y-6">
			<div class="flex gap-4">
				<div
					class="bg-primary/10 text-primary flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-lg font-bold"
				>
					1
				</div>
				<div>
					<h3 class="title4 mb-2">{m.how_it_works_page_clients_step1_title()}</h3>
					<p>
						{m.how_it_works_page_clients_step1_desc()}
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
					<h3 class="title4 mb-2">{m.how_it_works_page_clients_step2_title()}</h3>
					<p>
						{m.how_it_works_page_clients_step2_desc()}
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
					<h3 class="title4 mb-2">{m.how_it_works_page_clients_step3_title()}</h3>
					<p>
						{m.how_it_works_page_clients_step3_desc()}
					</p>
					<p class="text-sm text-muted-foreground">
						<strong>{m.how_it_works_page_clients_step3_note()}</strong>
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
					<h3 class="title4 mb-2">{m.how_it_works_page_clients_step4_title()}</h3>
					<p>
						{m.how_it_works_page_clients_step4_desc()}
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
					<h3 class="title4 mb-2">{m.how_it_works_page_clients_step5_title()}</h3>
					<p>
						{m.how_it_works_page_clients_step5_desc()}
					</p>
				</div>
			</div>

			<div class="flex gap-4">
				<div
					class="bg-primary/10 text-primary flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-lg font-bold"
				>
					6
				</div>
				<div>
					<h3 class="title4 mb-2">{m.how_it_works_page_clients_step6_title()}</h3>
					<p>
						{m.how_it_works_page_clients_step6_desc()}
					</p>
				</div>
			</div>
		</div>

		<div class="mt-6 rounded-md bg-muted p-4">
			<h4 class="font-semibold">{m.how_it_works_page_clients_cost_title()}</h4>
			<ul class="my-2 space-y-1 text-sm">
				<li> <strong>{m.how_it_works_page_clients_cost_no_fees()}</strong></li>
				<li>
					 <strong>{m.how_it_works_page_clients_cost_deposit()}</strong>
				</li>
				<li> <strong>{m.how_it_works_page_clients_cost_unlimited()}</strong></li>
			</ul>
		</div>
	</section>

	<!-- For Instructors Section -->
	<section class="mt-12 rounded-lg border border-border bg-card p-6 shadow-sm">
		<h2 class="title3 mb-6">{m.how_it_works_page_instructors_title()}</h2>

		<div class="space-y-6">
			<div class="flex gap-4">
				<div
					class="bg-primary/10 text-primary flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-lg font-bold"
				>
					1
				</div>
				<div>
					<h3 class="title4 mb-2">{m.how_it_works_page_instructors_step1_title()}</h3>
					<p>
						{m.how_it_works_page_instructors_step1_desc()}
					</p>
					<p class="text-sm text-muted-foreground">
						<strong>{m.how_it_works_page_instructors_step1_note()}</strong>
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
					<h3 class="title4 mb-2">{m.how_it_works_page_instructors_step2_title()}</h3>
					<p>
						{m.how_it_works_page_instructors_step2_desc()}
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
					<h3 class="title4 mb-2">{m.how_it_works_page_instructors_step3_title()}</h3>
					<p>
						{m.how_it_works_page_instructors_step3_desc()}
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
					<h3 class="title4 mb-2">{m.how_it_works_page_instructors_step4_title()}</h3>
					<p>
						{m.how_it_works_page_instructors_step4_desc()}
					</p>
					<p class="text-sm text-muted-foreground">
						{m.how_it_works_page_instructors_step4_note()}
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
					<h3 class="title4 mb-2">{m.how_it_works_page_instructors_step5_title()}</h3>
					<p>
						{m.how_it_works_page_instructors_step5_desc()}
					</p>
				</div>
			</div>

			<div class="flex gap-4">
				<div
					class="bg-primary/10 text-primary flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-lg font-bold"
				>
					6
				</div>
				<div>
					<h3 class="title4 mb-2">{m.how_it_works_page_instructors_step6_title()}</h3>
					<p>
						{m.how_it_works_page_instructors_step6_desc()}
					</p>
					<p class="text-sm text-muted-foreground">
						{m.how_it_works_page_instructors_step6_note()}
					</p>
				</div>
			</div>
		</div>

		<div class="mt-6 rounded-md bg-muted p-4">
			<h4 class="font-semibold">{m.how_it_works_page_instructors_cost_title()}</h4>
			<ul class="my-2 space-y-1 text-sm">
				<li> <strong>{m.how_it_works_page_instructors_cost_free()}</strong></li>
				<li>
					 <strong>{m.how_it_works_page_instructors_cost_lead()}</strong>
				</li>
				<li> <strong>{m.how_it_works_page_instructors_cost_no_commission()}</strong></li>
				<li> <strong>{m.how_it_works_page_instructors_cost_no_monthly()}</strong></li>
			</ul>
		</div>
	</section>

	<!-- FAQ Section -->
	<section class="mt-12">
		<h2 class="title3">{m.how_it_works_page_faq_title()}</h2>

		<div class="space-y-4">
			<div>
				<h3 class="title4">{m.how_it_works_page_faq_deposit_q()}</h3>
				<p>
					{m.how_it_works_page_faq_deposit_a()}
				</p>
			</div>

			<div>
				<h3 class="title4">{m.how_it_works_page_faq_lead_fee_q()}</h3>
				<p>
					{m.how_it_works_page_faq_lead_fee_a()}
				</p>
			</div>

			<div>
				<h3 class="title4">{m.how_it_works_page_faq_payments_q()}</h3>
				<p>
					{m.how_it_works_page_faq_payments_a()}
				</p>
			</div>

			<div>
				<h3 class="title4">{m.how_it_works_page_faq_no_response_q()}</h3>
				<p>
					{m.how_it_works_page_faq_no_response_a()}
				</p>
			</div>

			<div>
				<h3 class="title4">{m.how_it_works_page_faq_contact_q()}</h3>
				<p>
					{m.how_it_works_page_faq_contact_a()}
				</p>
			</div>
		</div>
	</section>

	<section class="mt-12 text-center ">
		<h2 class="title3 mb-6">{m.how_it_works_page_cta_title()}</h2>
		<div class="flex flex-col gap-4 sm:flex-row sm:justify-center">
			<a href="/" class="bg-primary inline-block rounded-md px-6 py-3 font-medium text-white">
				{m.how_it_works_page_cta_find_instructor()}
			</a>
			<a
				href="/signup"
				class="inline-block rounded-md border border-border bg-card px-6 py-3 font-medium"
			>
				{m.how_it_works_page_cta_list_instructor()}
			</a>
		</div>
	</section>
</article>
