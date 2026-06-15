import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { error } from '@sveltejs/kit';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * Wraps `fetch` so that network-level failures (backend down, DNS issues,
 * connection refused, etc.) are converted into a user-friendly SvelteKit
 * 503 error instead of bubbling up as an opaque `TypeError: fetch failed`.
 *
 * Pass the `fetch` provided by SvelteKit's `load` function so that relative
 * URLs and request headers are handled correctly.
 */
export async function safeFetch(
	fetch: typeof globalThis.fetch,
	input: URL | RequestInfo,
	init?: RequestInit
): Promise<Response> {
	try {
		return await fetch(input, init);
	} catch {
		// Network failure – the request never completed.
		throw error(
			503,
			'We could not reach the data server. The service may be down or your connection may have dropped. Please try again in a moment.'
		);
	}
}

export function slugify(text: string): string {
	return text
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, '')
		.replace(/[\s_]+/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-+|-+$/g, '');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, 'child'> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, 'children'> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };
