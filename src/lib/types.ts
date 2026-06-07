export interface League {
	id: string;
	name: string;
	city: string | null;
	country: string | null;
	location: {
		type: 'Point';
		coordinates: [number, number];
	} | null;
	address: string | null;
}

export interface LeagueFeature {
	type: 'Feature';
	geometry: {
		type: 'Point';
		coordinates: [number, number];
	};
	properties: {
		name: string;
		city: string | null;
		country: string | null;
		address: string | null;
	};
}

export interface LeagueFeatureCollection {
	type: 'FeatureCollection';
	features: LeagueFeature[];
}
