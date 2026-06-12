import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	build: {
		chunkSizeWarningLimit: 1100,
		rollupOptions: {
			output: {
				manualChunks(id) {
					if (id.includes('node_modules/maplibre-gl')) {
						return 'maplibre-gl';
					}
				}
			}
		}
	}
});
