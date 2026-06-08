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
		id: string;
		name: string;
		city: string | null;
		country: string | null;
		address: string | null;
	};
}

export interface Team {
	id: string;
	team_name: string;
	team_league: string;
	age_category: string | null;
	team_type: string | null;
	affiliation: {
		id: number;
		team_id: string;
		organization_id: string;
	}[];
}

export interface Organization {
	id: string;
	organization_name: string;
}

export interface Game {
	id: string;
	date: string;
	home_team_score: number;
	away_team_score: number;
	home_team: string;
	away_team: string;
}

export interface LeagueContact {
	id: number;
	league: string;
	Type: string;
	name: string | null;
	email: string;
}

export interface LeagueFeatureCollection {
	type: 'FeatureCollection';
	features: LeagueFeature[];
}
