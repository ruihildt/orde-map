<script lang="ts">
	import {
		Map as MapLibreMap,
		GeoJSONSource,
		SymbolLayer,
		Image as MapImage,
		NavigationControl
	} from 'svelte-maplibre-gl';
	import maplibregl from 'maplibre-gl';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import type {
		LeagueFeatureCollection,
		Team,
		LeagueContact,
		Organization,
		Game
	} from '$lib/types';

	type PageData = {
		geojson: LeagueFeatureCollection;
		teams: Team[];
		contacts: LeagueContact[];
		organizations: Organization[];
		games: Game[];
	};
	import { onMount } from 'svelte';
	import { SidebarProvider, SidebarInset } from '$lib/components/ui/sidebar';
	import AppSidebar from '$lib/components/AppSidebar.svelte';
	import TitleBar from '$lib/components/TitleBar.svelte';
	import { selectedLeague, leagueData } from '$lib/stores';

	let { data }: { data: PageData } = $props();

	$effect(() => {
		leagueData.set({
			teams: data.teams,
			contacts: data.contacts,
			organizations: data.organizations,
			games: data.games
		});
	});

	let mapInstance: maplibregl.Map | undefined = $state(undefined);
	let pinImage: HTMLImageElement | undefined = $state(undefined);

	const pinSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="40" viewBox="0 0 30 40">
		<path d="M15 0C6.716 0 0 6.716 0 15c0 11.25 15 25 15 25s15-13.75 15-25C30 6.716 23.284 0 15 0z" fill="#e63946" stroke="#fff" stroke-width="1.5"/>
		<circle cx="15" cy="14" r="6" fill="#fff"/>
	</svg>`;

	onMount(() => {
		const img = document.createElement('img');
		img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(pinSvg);
		img.onload = () => {
			pinImage = img;
		};
	});

	function handleClick(
		e: maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] }
	) {
		if (e.features && e.features.length > 0) {
			const feature = e.features[0];
			$selectedLeague = {
				id: feature.properties?.id ?? '',
				name: feature.properties?.name ?? '',
				country: feature.properties?.country ?? null,
				address: feature.properties?.address ?? null
			};
		}
	}

	function handlePinMouseEnter(e: maplibregl.MapMouseEvent & { target?: maplibregl.Map }) {
		if (e.target) {
			e.target.getCanvas().style.cursor = 'pointer';
		}
	}

	function handlePinMouseLeave(e: maplibregl.MapMouseEvent & { target?: maplibregl.Map }) {
		if (e.target) {
			e.target.getCanvas().style.cursor = '';
		}
	}

	function handleMapLoad() {
		if (!mapInstance || !data.geojson.features.length) return;
		const bounds = new maplibregl.LngLatBounds();
		for (const feature of data.geojson.features) {
			const [lng, lat] = feature.geometry.coordinates;
			bounds.extend([lng, lat]);
		}
		mapInstance.fitBounds(bounds, { padding: 100, maxZoom: 12 });
	}
</script>

<SidebarProvider>
	<AppSidebar />
	<SidebarInset>
		<TitleBar />
		<div class="relative flex-1 h-[calc(100svh-3rem)]">
			<MapLibreMap
				autoloadGlobalCss={false}
				style="https://tiles.openfreemap.org/styles/liberty"
				center={{ lng: 10, lat: 48 }}
				zoom={3}
				dragRotate={false}
				class="map"
				bind:map={mapInstance}
				onload={handleMapLoad}
			>
				<NavigationControl position="top-right" showCompass={false} />
				{#if pinImage}
					<MapImage id="pin-marker" image={pinImage} options={{ sdf: false }} />
				{/if}
				<GeoJSONSource id="leagues" data={data.geojson}>
					<SymbolLayer
						id="league-pins"
						source="leagues"
						layout={{
							'icon-image': 'pin-marker',
							'icon-size': 0.9,
							'icon-anchor': 'bottom',
							'icon-allow-overlap': true
						}}
						onclick={handleClick}
						onmouseenter={handlePinMouseEnter}
						onmouseleave={handlePinMouseLeave}
					/>
					<SymbolLayer
						id="league-labels"
						source="leagues"
						layout={{
							'text-field': ['get', 'name'],
							'text-size': 13,
							'text-offset': [0, 0.2],
							'text-anchor': 'top',
							'text-optional': true,
							'text-allow-overlap': false
						}}
						paint={{
							'text-color': '#000000',
							'text-halo-color': '#ffffff',
							'text-halo-width': 1.5
						}}
						onclick={handleClick}
						onmouseenter={handlePinMouseEnter}
						onmouseleave={handlePinMouseLeave}
					/>
				</GeoJSONSource>
			</MapLibreMap>
		</div>
	</SidebarInset>
</SidebarProvider>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	}

	:global(.map) {
		position: absolute;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
	}

	:global(.maplibregl-map) {
		width: 100%;
		height: 100%;
	}
</style>
