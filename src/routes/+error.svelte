<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import { CloudOff, RefreshCw, Home } from '@lucide/svelte';

	const status = $derived(page.status);
	const message = $derived(page.error?.message ?? 'Something went wrong.');

	// Map HTTP-like statuses to a friendly title + description.
	const content = $derived.by(() => {
		if (status === 503) {
			return {
				title: 'Data unavailable',
				description:
					message ??
					'We could not reach the data server. It may be temporarily down or your connection may have dropped.'
			};
		}
		if (status === 404) {
			return {
				title: 'Not found',
				description: 'We could not find what you were looking for.'
			};
		}
		if (status && status >= 500) {
			return {
				title: 'Server error',
				description: 'Something went wrong on our end. Please try again shortly.'
			};
		}
		return {
			title: 'Something went wrong',
			description: message || 'An unexpected error occurred. Please try again.'
		};
	});

	function reload() {
		window.location.reload();
	}
</script>

<svelte:head>
	<title>{content.title} – Open Roller Derby Europe</title>
</svelte:head>

<div class="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
	<div class="flex flex-col items-center gap-4">
		<div
			class="flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive"
		>
			<CloudOff class="size-8" />
		</div>
		<div class="space-y-2">
			<h1 class="text-2xl font-semibold tracking-tight">{content.title}</h1>
			<p class="max-w-md text-balance text-muted-foreground">{content.description}</p>
		</div>
		{#if status}
			<span class="text-xs font-medium text-muted-foreground/70">Error {status}</span>
		{/if}
	</div>
	<div class="flex flex-wrap items-center justify-center gap-3">
		<Button onclick={reload}>
			<RefreshCw class="size-4" />
			Try again
		</Button>
		<Button href="/" variant="outline">
			<Home class="size-4" />
			Go home
		</Button>
	</div>
</div>
