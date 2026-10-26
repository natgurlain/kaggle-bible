import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { satteri } from '@astrojs/markdown-satteri';
import claimReferenceLinks from './src/markdown/claim-reference-links.js';

export default defineConfig({
	site: 'https://kaggle-bible.vercel.app',
	markdown: {
		processor: satteri({ mdastPlugins: [claimReferenceLinks] }),
	},
	integrations: [
		starlight({
			title: 'Kaggle Bible',
			components: { Header: './src/components/DocsHeader.astro' },
			favicon: 'https://www.kaggle.com/static/images/favicon.ico',
			head: [
				{ tag: 'meta', attrs: { property: 'og:image', content: 'https://kaggle-bible.vercel.app/og-image.png' } },
				{ tag: 'meta', attrs: { property: 'og:image:width', content: '1200' } },
				{ tag: 'meta', attrs: { property: 'og:image:height', content: '630' } },
				{ tag: 'meta', attrs: { property: 'og:image:alt', content: 'Kaggle Bible: learn from what Kaggle competitors actually tried.' } },
				{ tag: 'meta', attrs: { name: 'twitter:image', content: 'https://kaggle-bible.vercel.app/og-image.png' } },
				{ tag: 'meta', attrs: { name: 'twitter:image:alt', content: 'Kaggle Bible: learn from what Kaggle competitors actually tried.' } },
			],
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
