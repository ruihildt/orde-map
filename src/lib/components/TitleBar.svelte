<script lang="ts">
	import { useSidebar } from '$lib/components/ui/sidebar';
	import { Menu, X, Link } from '@lucide/svelte';
	import logo from '$lib/assets/skate.png';
	import { page } from '$app/state';

	const sidebar = useSidebar();

	const pageTitles: Record<string, string> = {
		'/leagues/': 'Leagues',
		'/tournaments/': 'Tournaments',
		'/license/': 'License',
		'/about/': 'About'
	};

	let title = $derived.by(() => {
		if (page.url.pathname.startsWith('/tournaments/') && page.url.pathname !== '/tournaments/') {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			return (page.data as any)?.tournament?.tournament_name ?? 'Tournament';
		}
		if (page.url.pathname.startsWith('/leagues/') && page.url.pathname !== '/leagues/') {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			return (page.data as any)?.league?.name ?? 'League';
		}
		return pageTitles[page.url.pathname] ?? 'Open Roller Derby Europe';
	});

	let breadcrumbs = $derived.by(() => {
		if (page.url.pathname.startsWith('/tournaments/') && page.url.pathname !== '/tournaments/') {
			return [{ label: 'Tournaments', href: '/tournaments/' }, { label: title }];
		}
		if (page.url.pathname.startsWith('/leagues/') && page.url.pathname !== '/leagues/') {
			return [{ label: 'Leagues', href: '/leagues/' }, { label: title }];
		}
		return null;
	});

	let copied = $state(false);

	function copyLink() {
		navigator.clipboard.writeText(page.url.href);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}
</script>

<header
	class="relative z-50 flex h-12 items-center gap-2 border-b px-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
>
	<div class="flex items-center gap-2">
		<img src={logo} alt="ORDE" class="size-7 rounded md:hidden" />
	</div>
	<h1 class="text-sm font-medium text-foreground truncate">
		{#if breadcrumbs}
			{#each breadcrumbs as crumb, i (crumb.label)}
				{#if i > 0}
					<span class="mx-1.5 text-muted-foreground">/</span>
				{/if}
				{#if crumb.href}
					<span class="text-muted-foreground">{crumb.label}</span>
				{:else}
					<span>{crumb.label}</span>
				{/if}
			{/each}
		{:else}
			<span>{title}</span>
		{/if}
	</h1>
	{#if breadcrumbs && !sidebar.isMobile}
		<button
			class="flex items-center gap-1.5 rounded-md border bg-muted/50 px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
			onclick={copyLink}
		>
			{#if copied}
				Copied!
			{:else}
				<Link class="size-3.5" />
				Copy link
			{/if}
		</button>
	{/if}
	<div class="flex-1"></div>
	{#if sidebar.isMobile}
		<button
			class="relative z-50 flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
			onclick={() => sidebar.toggle()}
			aria-label="Toggle menu"
		>
			{#if sidebar.openMobile}
				<X class="size-5" />
			{:else}
				<Menu class="size-5" />
			{/if}
		</button>
	{/if}
</header>
