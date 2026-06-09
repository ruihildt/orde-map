<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import {
		PUBLIC_UMAMI,
		PUBLIC_UMAMI_SCRIPT_URL,
		PUBLIC_UMAMI_WEBSITE_ID
	} from '$env/static/public';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	{#if PUBLIC_UMAMI !== '0' && PUBLIC_UMAMI !== 'false'}
		<script defer src={PUBLIC_UMAMI_SCRIPT_URL} data-website-id={PUBLIC_UMAMI_WEBSITE_ID}></script>
	{/if}
</svelte:head>

{@render children()}
