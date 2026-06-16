<script lang="ts">
	import {
		Map as MapLibreMap,
		GeoJSONSource,
		SymbolLayer,
		Image as MapImage,
		NavigationControl,
		Popup
	} from 'svelte-maplibre-gl';
	import maplibregl from 'maplibre-gl';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import type {
		LeagueFeatureCollection,
		LeagueProperties,
		Team,
		LeagueContact,
		Organization,
		Game
	} from '$lib/types';
	import LeaguePopupContent from '$lib/components/LeaguePopupContent.svelte';
	import { page } from '$app/state';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { filterLeagues } from '$lib/utils';

	type PageData = {
		geojson: LeagueFeatureCollection;
		teams: Team[];
		contacts: LeagueContact[];
		organizations: Organization[];
		games: Game[];
	};

	let { data }: { data: PageData } = $props();

	let mapInstance: maplibregl.Map | undefined = $state(undefined);
	let pinImage: HTMLImageElement | undefined = $state(undefined);

	let selectedLeague: LeagueProperties | null = $state(null);
	let selectedLngLat: maplibregl.LngLatLike | null = $state(null);
	let popupOpen = $state(false);

	const pinSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="40" viewBox="0 0 30 40">
		<path d="M15 0C6.716 0 0 6.716 0 15c0 11.25 15 25 15 25s15-13.75 15-25C30 6.716 23.284 0 15 0z" fill="#e63946" stroke="#fff" stroke-width="1.5"/>
		<circle cx="15" cy="14" r="6" fill="#fff"/>
	</svg>`;

	const greyPinSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="40" viewBox="0 0 30 40">
		<path d="M15 0C6.716 0 0 6.716 0 15c0 11.25 15 25 15 25s15-13.75 15-25C30 6.716 23.284 0 15 0z" fill="#9ca3af" stroke="#fff" stroke-width="1.5"/>
		<circle cx="15" cy="14" r="6" fill="#fff"/>
	</svg>`;

	onMount(() => {
		const img = document.createElement('img');
		img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(pinSvg);
		img.onload = () => {
			pinImage = img;
		};

		// Also load grey pin image
		const greyImg = document.createElement('img');
		greyImg.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(greyPinSvg);
		greyImg.onload = () => {
			if (mapInstance) {
				mapInstance.addImage('pin-marker-grey', greyImg, { sdf: false });
			}
		};
	});

	function handleClick(
		e: maplibregl.MapMouseEvent & {
			features?: maplibregl.MapGeoJSONFeature[];
		}
	) {
		if (e.features && e.features.length > 0) {
			const feature = e.features[0];
			const id = feature.properties?.id ?? '';
			// Toggle: if clicking the already-selected pin, close the popup
			if (selectedLeague?.id === id) {
				selectedLeague = null;
				selectedLngLat = null;
				popupOpen = false;
				return;
			}
			const leagueFeature = filteredGeojson.features.find((f) => f.properties.id === id);
			if (leagueFeature) {
				selectedLeague = {
					id: leagueFeature.properties.id,
					name: leagueFeature.properties.name,
					country: leagueFeature.properties.country,
					address: leagueFeature.properties.address
				};
				selectedLngLat = leagueFeature.geometry.coordinates as [number, number];
				popupOpen = true;
			}
		}
	}

	function handlePopupClose() {
		selectedLeague = null;
		selectedLngLat = null;
		popupOpen = false;
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
		if (!mapInstance || !filteredGeojson.features.length) return;
		const bounds = new maplibregl.LngLatBounds();
		for (const feature of filteredGeojson.features) {
			const [lng, lat] = feature.geometry.coordinates;
			bounds.extend([lng, lat]);
		}
		mapInstance.fitBounds(bounds, { padding: 100, maxZoom: 12 });
	}

	// Dynamic icon-image: use grey pin for non-selected when a league is selected
	let pinIconExpression = $derived.by(() => {
		const sel = selectedLeague;
		return sel
			? ['case', ['==', ['get', 'id'], sel.id], 'pin-marker', 'pin-marker-grey']
			: 'pin-marker';
	});

	let pinLabelOpacityExpression = $derived.by(() => {
		const sel = selectedLeague;
		return sel ? ['case', ['==', ['get', 'id'], sel.id], 1, 0.4] : 1;
	});

	// --- Filtering based on URL params ---
	let selectedCountries = $derived(browser ? page.url.searchParams.getAll('country') : []);
	let selectedOrgs = $derived(browser ? page.url.searchParams.getAll('organization') : []);
	let selectedTeamTypes = $derived(browser ? page.url.searchParams.getAll('team_type') : []);

	let filteredGeojson = $derived(
		filterLeagues(data.geojson, data.teams, {
			countries: selectedCountries,
			organizations: selectedOrgs,
			teamTypes: selectedTeamTypes
		})
	);

	// Close the popup if the selected league is no longer in the filtered set.
	$effect(() => {
		const fg = filteredGeojson;
		const sel = selectedLeague;
		if (sel && !fg.features.some((f) => f.properties.id === sel.id)) {
			handlePopupClose();
		}
	});

	// Recompute map bounds when the filtered set changes.
	$effect(() => {
		const fg = filteredGeojson;
		if (!mapInstance || !fg.features.length) return;
		const bounds = new maplibregl.LngLatBounds();
		for (const feature of fg.features) {
			const [lng, lat] = feature.geometry.coordinates;
			bounds.extend([lng, lat]);
		}
		mapInstance.fitBounds(bounds, { padding: 100, maxZoom: 12 });
	});
</script>

<div class="relative flex-1 h-[calc(100svh-3rem)]">
	<MapLibreMap
		autoloadGlobalCss={false}
		style="https://tiles.openfreemap.org/styles/liberty"
		center={{ lng: 10, lat: 48 }}
		zoom={3}
		dragRotate={false}
		attributionControl={{ compact: true }}
		class="map"
		bind:map={mapInstance}
		onload={handleMapLoad}
	>
		<NavigationControl position="top-right" showCompass={false} />
		{#if pinImage}
			<MapImage id="pin-marker" image={pinImage} options={{ sdf: false }} />
		{/if}
		<GeoJSONSource id="leagues" data={filteredGeojson}>
			<SymbolLayer
				id="league-pins"
				source="leagues"
				layout={{
					'icon-image': pinIconExpression as unknown as string,
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
					'text-halo-width': 1.5,
					'text-opacity': pinLabelOpacityExpression as unknown as number
				}}
				onclick={handleClick}
				onmouseenter={handlePinMouseEnter}
				onmouseleave={handlePinMouseLeave}
			/>
		</GeoJSONSource>
		{#if selectedLeague && selectedLngLat}
			<Popup
				lnglat={selectedLngLat}
				bind:open={popupOpen}
				closeButton={false}
				closeOnClick={true}
				closeOnMove={false}
				offset={20}
				maxWidth="320px"
				class="league-popup"
				onclose={handlePopupClose}
			>
				<LeaguePopupContent
					league={selectedLeague}
					teams={data.teams}
					contacts={data.contacts}
					organizations={data.organizations}
					onClose={handlePopupClose}
				/>
			</Popup>
		{/if}
	</MapLibreMap>
</div>

<style>
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

	:global(.league-popup .maplibregl-popup-content) {
		padding: 0;
		border-radius: var(--radius-lg);
		background: var(--popover);
		color: var(--popover-foreground);
		box-shadow:
			0 10px 15px -3px rgb(0 0 0 / 0.1),
			0 4px 6px -4px rgb(0 0 0 / 0.1);
	}
</style>
