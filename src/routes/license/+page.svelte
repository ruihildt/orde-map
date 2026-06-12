<script lang="ts">
	import { Scale, Database, Code, FileText } from '@lucide/svelte';
</script>

<div class="mx-auto max-w-3xl px-6 py-12">
	<div class="mb-10 flex items-center gap-3">
		<div
			class="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground"
		>
			<Scale class="size-5" />
		</div>
		<h1 class="text-2xl font-bold">License</h1>
	</div>

	<p class="mb-10 text-muted-foreground">
		Open Roller Derby Europe is an open project. All data, code, and content are freely available
		under the following licenses.
	</p>

	<div class="space-y-8">
		<!-- Data License -->
		<div class="rounded-xl border bg-card p-6">
			<div class="mb-4 flex items-center gap-3">
				<div
					class="flex size-9 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
				>
					<Database class="size-4" />
				</div>
				<div>
					<h2 class="text-lg font-semibold">Data</h2>
					<p class="text-sm text-muted-foreground">League information, teams, games, contacts</p>
				</div>
			</div>
			<div class="rounded-lg bg-muted/50 p-4">
				<p class="font-medium">ODbL — Open Database License</p>
				<p class="mt-2 text-sm text-muted-foreground">
					All data is available under the
					<a
						href="https://opendatacommons.org/licenses/odbl/"
						class="text-primary hover:underline"
						target="_blank"
						rel="noopener noreferrer">Open Database License (ODbL) v1.0</a
					>. You are free to share, create, and adapt the data as long as you attribute the source
					and share any derivative works under the same license.
				</p>
			</div>
		</div>

		<!-- Code License -->
		<div class="rounded-xl border bg-card p-6">
			<div class="mb-4 flex items-center gap-3">
				<div
					class="flex size-9 items-center justify-center rounded-lg bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
				>
					<Code class="size-4" />
				</div>
				<div>
					<h2 class="text-lg font-semibold">Code</h2>
					<p class="text-sm text-muted-foreground">Website source code and infrastructure</p>
				</div>
			</div>
			<div class="rounded-lg bg-muted/50 p-4">
				<p class="font-medium">AGPL-3.0 — GNU Affero General Public License v3</p>
				<p class="mt-2 text-sm text-muted-foreground">
					All source code is available under the
					<a
						href="https://www.gnu.org/licenses/agpl-3.0.en.html"
						class="text-primary hover:underline"
						target="_blank"
						rel="noopener noreferrer">GNU Affero General Public License v3.0</a
					>. You are free to run, study, share, and modify the software. Any derivative works must
					also be licensed under AGPL-3.0, including when used over a network.
				</p>
			</div>
		</div>

		<!-- Content License -->
		<div class="rounded-xl border bg-card p-6">
			<div class="mb-4 flex items-center gap-3">
				<div
					class="flex size-9 items-center justify-center rounded-lg bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
				>
					<FileText class="size-4" />
				</div>
				<div>
					<h2 class="text-lg font-semibold">Content</h2>
					<p class="text-sm text-muted-foreground">Text, images, and other creative content</p>
				</div>
			</div>
			<div class="rounded-lg bg-muted/50 p-4">
				<p class="font-medium">CC BY-SA 4.0 — Creative Commons Attribution-ShareAlike 4.0</p>
				<p class="mt-2 text-sm text-muted-foreground">
					All content is available under
					<a
						href="https://creativecommons.org/licenses/by-sa/4.0/"
						class="text-primary hover:underline"
						target="_blank"
						rel="noopener noreferrer">Creative Commons Attribution-ShareAlike 4.0 International</a
					>. You are free to share and adapt the material as long as you give appropriate credit and
					distribute your contributions under the same license.
				</p>
			</div>
		</div>
	</div>
</div>
