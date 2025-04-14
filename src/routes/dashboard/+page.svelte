<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '$src/lib/components/ui/button/button.svelte';

	let { data } = $props();
	let user = $state(data.user.user);
</script>

{#if !user.role}
	<p class="title3">Hey {user.name}, Let's Choose Your Account Type</p>
	<Button onclick={() => goto('/dashboard/choose-role')} class="w-full">Choose Account Type</Button>
{:else if user.role}
	<p class="title2">Dashboard HomePage</p>
{/if}
