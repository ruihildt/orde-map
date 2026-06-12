<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import {
		PUBLIC_UMAMI,
		PUBLIC_UMAMI_SCRIPT_URL,
		PUBLIC_UMAMI_WEBSITE_ID
	} from '$env/static/public';
	import { SidebarProvider, SidebarInset } from '$lib/components/ui/sidebar';
	import AppSidebar from '$lib/components/AppSidebar.svelte';
	import TitleBar from '$lib/components/TitleBar.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	{#if PUBLIC_UMAMI !== '0' && PUBLIC_UMAMI !== 'false'}
		<script defer src={PUBLIC_UMAMI_SCRIPT_URL} data-website-id={PUBLIC_UMAMI_WEBSITE_ID}></script>
	{/if}
</svelte:head>

<SidebarProvider>
	<AppSidebar />
	<SidebarInset>
		<TitleBar />
		{@render children()}
	</SidebarInset>
</SidebarProvider>
