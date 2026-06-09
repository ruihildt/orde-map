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
		Team,
		Organization,
		Game,
		LeagueContact,
		LeagueFeatureCollection
	} from '$lib/types';
	import { SvelteSet } from 'svelte/reactivity';
	import { onMount } from 'svelte';

	let {
		data
	}: {
		data: {
			geojson: LeagueFeatureCollection;
			teams: Team[];
			contacts: LeagueContact[];
			organizations: Organization[];
			games: Game[];
		};
	} = $props();

	let selectedLeague: {
		id: string;
		name: string;
		city: string | null;
		country: string | null;
		address: string | null;
	} | null = $state(null);

	let mapInstance: maplibregl.Map | undefined = $state(undefined);
	let pinImage: HTMLImageElement | undefined = $state(undefined);

	let leagueTeams = $derived(data.teams?.filter((t) => t.team_league === selectedLeague?.id) ?? []);
	let leagueContacts = $derived(
		data.contacts?.filter((c) => c.league === selectedLeague?.id) ?? []
	);
	let orgMap = $derived(new Map(data.organizations?.map((o) => [o.id, o.organization_name]) ?? []));
	let teamNameMap = $derived(new Map(data.teams?.map((t) => [t.id, t.team_name]) ?? []));
	let leagueTeamIds = $derived(new Set(leagueTeams.map((t) => t.id)));
	let leagueGames = $derived(
		data.games
			?.filter((g) => leagueTeamIds.has(g.home_team) || leagueTeamIds.has(g.away_team))
			.sort((a, b) => b.date.localeCompare(a.date)) ?? []
	);
	let showAllGames = new SvelteSet<string>();
	let gamesByTeam = $derived(
		leagueTeams.map((team) => ({
			team,
			games: leagueGames.filter((g) => g.home_team === team.id || g.away_team === team.id)
		}))
	);

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
			showAllGames.clear();
			const feature = e.features[0];
			selectedLeague = {
				id: feature.properties?.id ?? '',
				name: feature.properties?.name ?? '',
				city: feature.properties?.city ?? null,
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

	function handleClosePanel() {
		selectedLeague = null;
		showAllGames.clear();
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

<h1 class="title">Open Roller Derby Europe</h1>

{#if selectedLeague}
	<div class="side-panel">
		<button class="close-btn" onclick={handleClosePanel} aria-label="Close panel">
			<svg
				width="20"
				height="20"
				viewBox="0 0 20 20"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
			>
				<line x1="4" y1="4" x2="16" y2="16" />
				<line x1="16" y1="4" x2="4" y2="16" />
			</svg>
		</button>
		<h2 class="panel-title">{selectedLeague.name}</h2>
		<div class="panel-details">
			{#if selectedLeague.city || selectedLeague.country}
				<div class="detail-row">
					<span class="detail-label">Location</span>
					<span class="detail-value"
						>{[selectedLeague.city, selectedLeague.country].filter(Boolean).join(', ')}</span
					>
				</div>
			{/if}
		</div>

		{#if leagueContacts.length > 0}
			<h3 class="section-title">Contacts</h3>
			<div class="panel-details">
				{#each leagueContacts as contact (contact.id)}
					<div class="contact-card">
						<div class="contact-type">{contact.Type}</div>
						{#if contact.name}
							<div class="contact-name">{contact.name}</div>
						{/if}
						<a class="contact-email" href="mailto:{contact.email}">{contact.email}</a>
					</div>
				{/each}
			</div>
		{/if}

		{#if gamesByTeam.length > 0}
			{#each gamesByTeam as { team, games } (team.id)}
				<h3 class="section-title">{team.team_name}</h3>
				<div class="team-meta" style="margin-bottom: 12px;">
					{#if team.age_category}
						<span class="team-badge">{team.age_category}</span>
					{/if}
					{#if team.team_type}
						<span class="team-badge">{team.team_type}</span>
					{/if}
					{#if team.affiliation && team.affiliation.length > 0}
						{#each team.affiliation as aff (aff.id)}
							{#if orgMap.get(aff.organization_id)}
								<span class="org-badge">{orgMap.get(aff.organization_id)}</span>
							{/if}
						{/each}
					{/if}
				</div>
				{#if games.length > 0}
					<div class="panel-details">
						{#each showAllGames.has(team.id) ? games : games.slice(0, 5) as game (game.id)}
							<div class="game-card">
								<div class="game-date">
									{new Date(game.date).toLocaleDateString('en-GB', {
										day: 'numeric',
										month: 'short',
										year: 'numeric'
									})}
								</div>
								<div class="game-teams">
									<span class="game-team" class:winner={game.home_team_score > game.away_team_score}
										>{teamNameMap.get(game.home_team) ?? 'Unknown'}</span
									>
									<span class="game-score">{game.home_team_score} - {game.away_team_score}</span>
									<span class="game-team" class:winner={game.away_team_score > game.home_team_score}
										>{teamNameMap.get(game.away_team) ?? 'Unknown'}</span
									>
								</div>
							</div>
						{/each}
						{#if games.length > 5}
							<button
								class="show-more-btn"
								onclick={() => {
									if (showAllGames.has(team.id)) {
										showAllGames.delete(team.id);
									} else {
										showAllGames.add(team.id);
									}
								}}
							>
								{showAllGames.has(team.id) ? 'Show less' : `Show all ${games.length} games`}
							</button>
						{/if}
					</div>
				{/if}
			{/each}
		{/if}
	</div>
{/if}

<div class="map-container">
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
					'text-size': 11,
					'text-offset': [0, 0.2],
					'text-anchor': 'top',
					'text-optional': true,
					'text-allow-overlap': false
				}}
				paint={{
					'text-color': '#1d3557',
					'text-halo-color': '#ffffff',
					'text-halo-width': 1
				}}
			/>
		</GeoJSONSource>
	</MapLibreMap>
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

	.side-panel {
		position: absolute;
		top: 0;
		left: 0;
		width: 360px;
		height: 100%;
		background: rgba(255, 255, 255, 0.95);
		z-index: 10;
		box-shadow: 4px 0 12px rgba(0, 0, 0, 0.15);
		padding: 24px;
		box-sizing: border-box;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
	}

	.close-btn {
		position: absolute;
		top: 12px;
		right: 12px;
		background: none;
		border: none;
		cursor: pointer;
		color: #666;
		padding: 4px;
		border-radius: 4px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.close-btn:hover {
		background: #f0f0f0;
		color: #333;
	}

	.panel-title {
		margin: 0 0 20px 0;
		font-size: 22px;
		color: #1d3557;
		padding-right: 30px;
		border-bottom: 2px solid #e63946;
		padding-bottom: 12px;
	}

	.panel-details {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.detail-row {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.detail-label {
		font-size: 11px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		color: #888;
	}

	.detail-value {
		font-size: 15px;
		color: #333;
	}

	.section-title {
		margin: 20px 0 12px 0;
		font-size: 14px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		color: #1d3557;
		border-bottom: 1px solid #ddd;
		padding-bottom: 8px;
	}

	.team-meta {
		display: flex;
		gap: 6px;
	}

	.team-badge {
		font-size: 11px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.3px;
		color: #fff;
		background: #457b9d;
		padding: 2px 8px;
		border-radius: 10px;
	}

	.org-badge {
		font-size: 11px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.3px;
		color: #fff;
		background: #e63946;
		padding: 2px 8px;
		border-radius: 10px;
	}

	.contact-card {
		background: #f8f8f8;
		border-radius: 6px;
		padding: 10px 12px;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.contact-type {
		font-size: 14px;
		font-weight: 600;
		color: #333;
	}

	.contact-name {
		font-size: 13px;
		color: #666;
	}

	.contact-email {
		font-size: 13px;
		color: #457b9d;
		text-decoration: none;
		word-break: break-all;
	}

	.contact-email:hover {
		text-decoration: underline;
	}

	.game-card {
		background: #f8f8f8;
		border-radius: 6px;
		padding: 10px 12px;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.game-date {
		font-size: 11px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.3px;
		color: #888;
	}

	.game-teams {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 13px;
	}

	.game-team {
		flex: 1;
		color: #666;
		white-space: normal;
		word-break: break-word;
	}

	.game-team.winner {
		color: #333;
		font-weight: 700;
	}

	.game-team:last-child {
		text-align: right;
	}

	.game-score {
		font-weight: 700;
		color: #1d3557;
		white-space: nowrap;
	}

	.show-more-btn {
		background: none;
		border: 1px solid #457b9d;
		color: #457b9d;
		padding: 6px 12px;
		border-radius: 4px;
		cursor: pointer;
		font-size: 12px;
		font-weight: 600;
		text-align: center;
	}

	.show-more-btn:hover {
		background: #457b9d;
		color: #fff;
	}
</style>
