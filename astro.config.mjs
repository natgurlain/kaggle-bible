import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
	integrations: [
		starlight({
			title: 'Kaggle Bible',
			social: [
				{
					icon: 'github',
					label: 'GitHub',
					href: 'https://github.com/natgurlain/kaggle-bible',
				},
			],
			editLink: {
				baseUrl: 'https://github.com/natgurlain/kaggle-bible/edit/main/',
			},
			sidebar: [
				{
					label: 'Start here',
					items: [
						{ label: 'Start here', slug: 'start' },
						{ label: 'Beginner → advanced path', slug: 'path' },
					],
				},
				{
					label: 'Browse',
					items: [
						{ label: 'Competition catalog', link: '/competitions/' },
						{ label: 'Best practices', slug: 'practices' },
					],
				},
				{
					label: 'Project',
					items: [
						{ label: 'About the project', slug: 'about' },
						{ label: 'Contribute', slug: 'contribute' },
					],
				},
			],
		}),
	],
});
