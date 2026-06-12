<script lang="ts">
	import '../app.css';
	import {
		PUBLIC_UMAMI,
		PUBLIC_UMAMI_SCRIPT_URL,
		PUBLIC_UMAMI_WEBSITE_ID
	} from '$env/static/public';
	import { SidebarProvider, SidebarInset } from '$lib/components/ui/sidebar';
	import AppSidebar from '$lib/components/AppSidebar.svelte';
	import TitleBar from '$lib/components/TitleBar.svelte';
	import { selectedLeague } from '$lib/stores';
	import { page } from '$app/state';

	let { children } = $props();

	const pageTitles: Record<string, string> = {
		'/leagues': 'Leagues',
		'/license': 'License',
		'/about': 'About'
	};

	let pageTitle = $derived(
		page.url.pathname === '/leagues' && $selectedLeague
			? `${$selectedLeague.name} – Open Roller Derby Europe`
			: page.url.pathname === '/'
				? 'Open Roller Derby Europe'
				: `${pageTitles[page.url.pathname] ?? ''} – Open Roller Derby Europe`
	);
</script>

<svelte:head>
	<title>{pageTitle}</title>
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
