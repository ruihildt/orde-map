<script lang="ts">
	import {
		Sidebar,
		SidebarContent,
		SidebarGroup,
		SidebarGroupContent,
		SidebarHeader,
		SidebarMenu,
		SidebarMenuButton,
		SidebarMenuItem
	} from '$lib/components/ui/sidebar';
	import { MapPin, Info, ScrollText, Trophy } from '@lucide/svelte';
	import logo from '$lib/assets/skate.png';
	import { page } from '$app/state';

	let currentPath = $derived(page.url.pathname);

	const navMenuItems = [
		{ label: 'Leagues', icon: MapPin, href: '/leagues/' },
		{ label: 'Tournaments', icon: Trophy, href: '/tournaments/' }
	];

	const secondaryMenuItems = [
		{ label: 'About', icon: Info, href: '/about/' },
		{ label: 'License', icon: ScrollText, href: '/license/' }
	];
</script>

<Sidebar collapsible="icon">
	<SidebarHeader>
		<SidebarMenu>
			<SidebarMenuItem>
				<SidebarMenuButton size="lg" tooltipContent="Open Roller Derby Europe">
					<img src={logo} alt="ORDE" class="size-8 rounded-lg" />
					<div class="grid flex-1 text-left text-sm leading-tight">
						<span class="truncate font-semibold">Open Roller Derby Europe</span>
					</div>
				</SidebarMenuButton>
			</SidebarMenuItem>
		</SidebarMenu>
	</SidebarHeader>

	<SidebarContent class="overflow-x-hidden">
		<!-- Main Navigation -->
		<SidebarGroup>
			<SidebarGroupContent>
				<SidebarMenu>
					{#each navMenuItems as item (item.label)}
						<SidebarMenuItem>
							<!-- eslint-disable-next-line -->
							<a href={item.href} class="block cursor-pointer">
								<SidebarMenuButton
									tooltipContent={item.label}
									size="lg"
									isActive={currentPath === item.href}
								>
									<item.icon class="size-5" />
									<span class="text-base">{item.label}</span>
								</SidebarMenuButton>
							</a>
						</SidebarMenuItem>
					{/each}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>

		<!-- Spacer to push secondary items to bottom -->
		<div class="flex-1"></div>

		<!-- Secondary Menu -->
		<SidebarGroup>
			<SidebarGroupContent>
				<SidebarMenu>
					{#each secondaryMenuItems as item (item.label)}
						<SidebarMenuItem>
							<!-- eslint-disable-next-line -->
							<a href={item.href} class="block cursor-pointer">
								<SidebarMenuButton
									tooltipContent={item.label}
									size="lg"
									isActive={currentPath === item.href}
								>
									<item.icon class="size-5" />
									<span class="text-base">{item.label}</span>
								</SidebarMenuButton>
							</a>
						</SidebarMenuItem>
					{/each}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	</SidebarContent>
</Sidebar>
