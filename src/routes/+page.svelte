<script lang="ts">
	import {
		Map,
		GeoJSONSource,
		CircleLayer,
		SymbolLayer,
		Popup,
		NavigationControl
	} from 'svelte-maplibre-gl';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import type { LeagueFeatureCollection } from '$lib/types';

	let { data }: { data: { geojson: LeagueFeatureCollection } } = $props();

	let popupCoords: [number, number] | undefined = $state(undefined);
	let popupName: string = $state('');
	let popupCity: string = $state('');
	let popupCountry: string = $state('');

	function handleMouseEnter(
		e: maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] }
	) {
		if (e.features && e.features.length > 0) {
			const feature = e.features[0];
			const coords = (feature.geometry as { coordinates: [number, number] }).coordinates;
			popupCoords = [coords[0], coords[1]];
			popupName = feature.properties?.name ?? '';
			popupCity = feature.properties?.city ?? '';
			popupCountry = feature.properties?.country ?? '';
		}
	}

	function handleMouseLeave() {
		popupCoords = undefined;
	}
</script>

<h1 class="title">ORDE Map</h1>

<div class="map-container">
	<Map
		style="https://demotiles.maplibre.org/style.json"
		center={{ lng: 10, lat: 48 }}
		zoom={3}
		class="map"
	>
		<NavigationControl position="top-right" />
		<GeoJSONSource id="leagues" data={data.geojson}>
			<CircleLayer
				id="league-circles"
				source="leagues"
				paint={{
					'circle-radius': 6,
					'circle-color': '#e63946',
					'circle-stroke-width': 2,
					'circle-stroke-color': '#ffffff'
				}}
				onmouseenter={handleMouseEnter}
				onmouseleave={handleMouseLeave}
			/>
			<SymbolLayer
				id="league-labels"
				source="leagues"
				layout={{
					'text-field': ['get', 'name'],
					'text-size': 11,
					'text-offset': [0, 1.5],
					'text-anchor': 'top',
					'text-optional': true
				}}
				paint={{
					'text-color': '#1d3557',
					'text-halo-color': '#ffffff',
					'text-halo-width': 1
				}}
			/>
		</GeoJSONSource>
		{#if popupCoords}
			<Popup lnglat={popupCoords} onclose={() => (popupCoords = undefined)}>
				<div class="popup-content">
					<strong>{popupName}</strong>
					{#if popupCity}
						<br />{popupCity}
					{/if}
					{#if popupCountry}
						<br />{popupCountry}
					{/if}
				</div>
			</Popup>
		{/if}
	</Map>
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	}

	.title {
		position: absolute;
		top: 10px;
		left: 50px;
		z-index: 10;
		background: rgba(255, 255, 255, 0.9);
		padding: 8px 16px;
		border-radius: 4px;
		font-size: 18px;
		margin: 0;
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
		pointer-events: none;
	}

	.map-container {
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

	.popup-content {
		font-size: 13px;
		line-height: 1.4;
	}
</style>
