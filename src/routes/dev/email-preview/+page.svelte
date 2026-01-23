<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;

	let selectedEmailId = data.emailPreviews[0].id;
	let showRawHtml = false;

	$: selectedEmail = data.emailPreviews.find((e) => e.id === selectedEmailId);
</script>

<svelte:head>
	<title>Email Preview - Local Snow Dev Tools</title>
</svelte:head>

<div class="container">
	<header>
		<h1>📧 Email Template Preview</h1>
		<p class="subtitle">Development tool for viewing email templates</p>
	</header>

	<div class="controls">
		<div class="control-group">
			<label for="email-select">Select Email Template:</label>
			<select id="email-select" bind:value={selectedEmailId}>
				{#each data.emailPreviews as email}
					<option value={email.id}>{email.name}</option>
				{/each}
			</select>
		</div>

		<div class="control-group">
			<label>
				<input type="checkbox" bind:checked={showRawHtml} />
				Show Raw HTML
			</label>
		</div>
	</div>

	{#if selectedEmail}
		<div class="email-info">
			<h2>{selectedEmail.name}</h2>
			<div class="subject-line">
				<strong>Subject:</strong> {selectedEmail.subject}
			</div>
		</div>

		{#if showRawHtml}
			<div class="raw-html">
				<h3>Raw HTML</h3>
				<pre><code>{selectedEmail.html}</code></pre>
			</div>
		{:else}
			<div class="email-preview">
				<h3>Preview</h3>
				<div class="iframe-container">
					<iframe
						title="Email Preview"
						srcdoc={selectedEmail.html}
						sandbox="allow-same-origin"
					/>
				</div>
			</div>
		{/if}
	{/if}
</div>

<style>
	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
		font-family: system-ui, -apple-system, sans-serif;
	}

	header {
		margin-bottom: 2rem;
		border-bottom: 2px solid #e5e7eb;
		padding-bottom: 1rem;
	}

	h1 {
		margin: 0;
		font-size: 2rem;
		color: #111827;
	}

	.subtitle {
		margin: 0.5rem 0 0;
		color: #6b7280;
		font-size: 0.95rem;
	}

	.controls {
		display: flex;
		gap: 2rem;
		align-items: center;
		margin-bottom: 2rem;
		padding: 1rem;
		background: #f9fafb;
		border-radius: 8px;
	}

	.control-group {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	label {
		font-weight: 500;
		color: #374151;
		font-size: 0.9rem;
	}

	select {
		padding: 0.5rem 1rem;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 0.95rem;
		background: white;
		min-width: 300px;
	}

	input[type='checkbox'] {
		width: 18px;
		height: 18px;
		cursor: pointer;
	}

	.email-info {
		margin-bottom: 2rem;
		padding: 1.5rem;
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.email-info h2 {
		margin: 0 0 1rem;
		font-size: 1.5rem;
		color: #111827;
	}

	.subject-line {
		font-size: 0.95rem;
		color: #4b5563;
		padding: 0.75rem;
		background: #f9fafb;
		border-radius: 6px;
		border-left: 3px solid #2563eb;
	}

	.subject-line strong {
		color: #111827;
	}

	.email-preview {
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		padding: 1.5rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.email-preview h3 {
		margin: 0 0 1rem;
		font-size: 1.25rem;
		color: #111827;
	}

	.iframe-container {
		border: 1px solid #d1d5db;
		border-radius: 6px;
		overflow: hidden;
		background: #f9fafb;
	}

	iframe {
		width: 100%;
		height: 800px;
		border: none;
		background: white;
	}

	.raw-html {
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		padding: 1.5rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.raw-html h3 {
		margin: 0 0 1rem;
		font-size: 1.25rem;
		color: #111827;
	}

	pre {
		background: #1f2937;
		color: #f9fafb;
		padding: 1.5rem;
		border-radius: 6px;
		overflow-x: auto;
		font-size: 0.85rem;
		line-height: 1.5;
		margin: 0;
	}

	code {
		font-family: 'Courier New', monospace;
	}
</style>
