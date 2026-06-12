<script lang="ts">
	import { Heart } from '@lucide/svelte';
	import logo from '$lib/assets/skate.png';
</script>

<div class="mx-auto max-w-3xl px-6 py-12">
	<div class="mb-10 flex items-center gap-3">
		<div
			class="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground"
		>
			<Heart class="size-5" />
		</div>
		<h1 class="text-2xl font-bold">About</h1>
	</div>

	<p class="text-muted-foreground">
		Open Roller Derby Europe's mission is to grow and showcase open gender roller derby in Europe.
	</p>

	<div class="mt-10 rounded-xl border bg-card p-6">
		<div class="flex flex-col items-center gap-4">
			<img src={logo} alt="Open Roller Derby Europe logo" class="size-32 rounded-xl" />
			<p class="text-center text-sm text-muted-foreground">
				The logo features an open skate, representing the spirit of roller derby and the open
				community driving the project forward.
			</p>
		</div>
	</div>
</div>
