import type { League, LeagueFeatureCollection } from '$lib/types';

export async function load({ fetch }) {
	const response = await fetch('https://orde.rollerderby.click/items/league');
	const { data }: { data: League[] } = await response.json();

	const geojson: LeagueFeatureCollection = {
		type: 'FeatureCollection',
		features: data
			.filter((league) => league.location !== null)
			.map((league) => ({
				type: 'Feature' as const,
				geometry: {
					type: 'Point' as const,
					coordinates: league.location!.coordinates
				},
				properties: {
					name: league.name,
					city: league.city,
					country: league.country,
					address: league.address
				}
			}))
	};

	return { geojson };
}
