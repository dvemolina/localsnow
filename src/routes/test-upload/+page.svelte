<script lang="ts">
	let uploading = false;
	let result: any = null;

	async function handleSubmit(e: Event) {
		e.preventDefault();
		uploading = true;
		result = null;

		const form = e.target as HTMLFormElement;
		const formData = new FormData(form);

		console.log('[Test Upload Page] Starting upload...');
		const startTime = Date.now();

		try {
			const response = await fetch('/api/test-upload', {
				method: 'POST',
				body: formData
			});

			const elapsed = Date.now() - startTime;
			console.log('[Test Upload Page] Response received in', elapsed, 'ms');

			result = await response.json();
			result.elapsed = elapsed;
			console.log('[Test Upload Page] Result:', result);
		} catch (error) {
			const elapsed = Date.now() - startTime;
			console.error('[Test Upload Page] Error after', elapsed, 'ms:', error);
			result = {
				success: false,
				error: error instanceof Error ? error.message : String(error),
				elapsed
			};
		} finally {
			uploading = false;
		}
	}
</script>

<div style="max-width: 600px; margin: 50px auto; padding: 20px; font-family: system-ui;">
	<h1>File Upload Test</h1>
	<p>This page tests if file uploads work through the entire stack (browser → Traefik → SvelteKit).</p>

	<form on:submit={handleSubmit} enctype="multipart/form-data">
		<div style="margin: 20px 0;">
			<label>
				<strong>Test File:</strong><br />
				<input type="file" name="testfile" required />
			</label>
		</div>

		<button type="submit" disabled={uploading} style="padding: 10px 20px; font-size: 16px;">
			{uploading ? 'Uploading...' : 'Test Upload'}
		</button>
	</form>

	{#if result}
		<div
			style="margin-top: 30px; padding: 15px; border-radius: 5px; background: {result.success
				? '#d4edda'
				: '#f8d7da'}; border: 1px solid {result.success ? '#c3e6cb' : '#f5c6cb'};"
		>
			<h3>{result.success ? '✅ Success!' : '❌ Failed'}</h3>
			<pre style="background: white; padding: 10px; overflow: auto; font-size: 12px;">{JSON.stringify(
					result,
					null,
					2
				)}</pre>

			{#if result.success}
				<p>
					<strong>Files received:</strong>
					{result.filesReceived}
				</p>
				<p><strong>Total size:</strong> {(result.totalSize / 1024 / 1024).toFixed(2)} MB</p>
				<p><strong>Upload time:</strong> {result.elapsed} ms</p>
			{:else}
				<p><strong>Error:</strong> {result.error || result.message}</p>
				<p><strong>Time before failure:</strong> {result.elapsed} ms</p>
			{/if}
		</div>
	{/if}

	<div style="margin-top: 40px; padding: 15px; background: #f8f9fa; border-radius: 5px;">
		<h3>How to use:</h3>
		<ol>
			<li>Select a file (try different sizes: 100KB, 1MB, 5MB, 10MB, 20MB)</li>
			<li>Click "Test Upload"</li>
			<li>Watch browser console and check server logs</li>
			<li>See if the upload completes and shows success</li>
		</ol>

		<h3>What to check:</h3>
		<ul>
			<li><strong>Browser Console:</strong> Should show upload progress</li>
			<li>
				<strong>Server Logs:</strong>
				<code>docker service logs localsnow_app --tail 50 --follow</code>
			</li>
			<li><strong>Network Tab:</strong> Check request status and size</li>
		</ul>

		<h3>Expected behavior:</h3>
		<ul>
			<li>Small files (&lt;1MB) should upload instantly</li>
			<li>Large files (10-20MB) should upload in a few seconds</li>
			<li>If it hangs for &gt;30 seconds, there's a timeout issue</li>
			<li>If it fails immediately, there's a size limit</li>
		</ul>
	</div>
</div>
