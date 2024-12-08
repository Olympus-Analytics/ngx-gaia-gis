import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
      favicon: '/favicon.svg',
      logo:{

        src: './src/assets/logo.webp',
      },
			title: 'Gaia GIS Documentation',
			social: {
				github: 'https://github.com/Olympus-Analytics/ngx-gaia-gis.git',
			},
			sidebar: [
				{
					label: 'Installation',
					items: [
						// Each item here is one entry in the navigation menu.
						{ label: 'Installation', slug: 'installation/installation' },
					],
				},
				{
					label: 'Getting Started',
					items: [
						// Each item here is one entry in the navigation menu.
						{ label: 'Getting started', slug: 'getting-started/getting-started' },
            { label: 'Configuration', slug: 'getting-started/configurations' },
					],
				},
        {
          label: 'Advanced functions',
          items:[
            {label: 'Angular gaia-gis Service', slug: 'advanced-usage/gaia-gis-service'},
            {label: "Methods", slug: 'advanced-usage/methods'},
          ]
        }
			],
		}),
	],
});
