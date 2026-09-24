import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { satteri } from '@astrojs/markdown-satteri';
import claimReferenceLinks from './src/markdown/claim-reference-links.js';

export default defineConfig({
	markdown: {
		processor: satteri({ mdastPlugins: [claimReferenceLinks] }),
	},
	integrations: [
		starlight({
			title: 'Kaggle Bible',
			favicon: 'https://www.kaggle.com/static/images/favicon.ico',
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
