<script lang="ts">
	import { useSidebar } from '$lib/components/ui/sidebar';
	import { Menu, X } from '@lucide/svelte';
	import { selectedLeague } from '$lib/stores';
	import logo from '$lib/assets/skate.png';
	import { page } from '$app/stores';

	const sidebar = useSidebar();

	const pageTitles: Record<string, string> = {
		'/leagues': 'Leagues',
		'/license': 'License',
		'/about': 'About'
	};

	let title = $derived(
		$page.url.pathname === '/leagues' && $selectedLeague
			? $selectedLeague.name
			: (pageTitles[$page.url.pathname] ?? 'Open Roller Derby Europe')
	);

	let breadcrumbs = $derived(
		$page.url.pathname === '/leagues' && $selectedLeague
			? [{ label: 'Leagues', href: '/leagues' }, { label: $selectedLeague.name }]
			: null
	);
</script>

<header
	class="flex h-12 items-center gap-2 border-b px-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
>
	<div class="flex items-center gap-2">
		<img src={logo} alt="ORDE" class="size-7 rounded md:hidden" />
	</div>
	<h1 class="flex-1 text-sm font-medium text-foreground truncate">
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
	{#if sidebar.isMobile}
		<button
			class="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
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
