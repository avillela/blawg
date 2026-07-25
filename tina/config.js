import { defineConfig } from "tinacms";

// Your hosting provider likely exposes this as an environment variable
const branch = process.env.HEAD || "main";

export default defineConfig({
	branch,
	clientId: process.env.TINACLIENTID, // Get this from tina.io
	token: process.env.TINATOKEN, // Get this from tina.io

	build: {
		outputFolder: "admin",
		publicFolder: "public",
	},
	media: {
		tina: {
			mediaRoot: "images/posts",
			publicFolder: "public",
		},
	},
	schema: {
		collections: [
			{
				label: "Site Settings",
				name: "settings",
				path: "src/settings",
				format: "json",
				fields: [
					{
						type: "string",
						label: "Site Title",
						name: "title",
					},
					{
						type: "string",
						label: "Site subtitle",
						name: "subtitle",
					},
				],
				ui: {
					allowedActions: {
						create: false,
						delete: false,
					},
				},
			},
			{
				name: "post",
				label: "Posts",
				path: "posts",
				defaultItem: () => ({
					title: "New Post",
					added: new Date(),
					tags: [],
				}),
				ui: {
					dateFormat: "MMM DD YYYY",
					filename: {
						readonly: false,
						slugify: (values) => {
							return values?.slug?.toLowerCase().replace(/ /g, "-");
						},
					},
				},
				fields: [
					{
						name: "title",
						label: "Title",
						type: "string",
						isTitle: true,
						required: true,
					},
					{
						label: "Slug",
						name: "slug",
						type: "string",
						required: true,
					},
					{
						label: "Description",
						name: "description",
						type: "string",
						required: true,
					},
					{
						label: "Tags",
						name: "tags",
						type: "string",
						list: true,
						options: [
							{
								value: "advice",
								label: "Advice",
							},
							{
								value: "AI",
								label: "AI Stuff",
							},
							{
								value: "aaif",
								label: "AAIF",
							},
							{
								value: "argocd",
								label: "ArgoCD",
							},
							{
								value: "azure",
								label: "Azure",
							},
							{
								value: "cert-manager",
								label: "cert-manager",
							},
							{
								value: "conferences",
								label: "Conferences",
							},
							{
								value: "devcontainers",
								label: "Dev Containers",
							},
							{
								value: "devrel",
								label: "DevRel",
							},
							{
								value: "docker",
								label: "Docker",
							},
							{
								value: "dynatrace",
								label: "Dynatrace",
							},
							{
								value: "events",
								label: "Events",
							},
							{
								value: "goose",
								label: "Goose",
							},
							{
								value: "github-codespaces",
								label: "GitHub Codespaces",
							},
							{
								value: "google-cloud",
								label: "Google Cloud",
							},
							{
								value: "hashicorp",
								label: "Hashicorp",
							},
							{
								value: "hashiqube",
								label: "Hashiqube",
							},
							{
								value: "kubernetes",
								label: "Kubernetes",
							},
							{
								value: "kubecon",
								label: "KubeCon",
							},
							{
								value: "learning",
								label: "Learning",
							},
							{
								value: "lightstep",
								label: "Lightstep",
							},
							{
								value: "mcp",
								label: "MCP",
							},
							{
								value: "nomad",
								label: "Nomad",
							},
							{
								value: "observability",
								label: "Observability",
							},
							{
								value: "opentelemetry",
								label: "OpenTelemetry",
							},
							{
								value: "otel-collector",
								label: "Otel Collector",
							},
							{
								value: "opamp",
								label: "OTel OpAMP",
							},
							{
								value: "otel-operator",
								label: "OTel Operator",
							},
							{
								value: "personal",
								label: "Personal",
							},
							{
								value: "platform-engineering",
								label: "Platform Engineering",
							},
							{
								value: "podcast",
								label: "Podcast",
							},
							{
								value: "projects",
								label: "Projects",
							},
							{
								value: "sre",
								label: "SRE",
							},
							{
								value: "technical",
								label: "Technical",
							},
							{
								value: "tekton",
								label: "Tekton",
							},
							{
								value: "terraform",
								label: "Terraform",
							},
							{
								value: "thought-leadership",
								label: "Thought Leadership",
							},
							{
								value: "vibe-coding",
								label: "Vibe Coding",
							},
							{
								value: "2020",
								label: "2020",
							},
							{
								value: "2021",
								label: "2021",
							},
							{
								value: "2022",
								label: "2022",
							},
							{
								value: "2023",
								label: "2023",
							},
							{
								value: "2024",
								label: "2024",
							},
							{
								value: "2025",
								label: "2025",
							},
							{
								value: "2026",
								label: "2026",
							},
						],
					},
					{
						label: "Added",
						name: "added",
						type: "datetime",
						dateFormat: "MMM DD YYYY",
						required: true,
					},
					{
						label: "Updated",
						name: "updated",
						type: "datetime",
						dateFormat: "MMM DD YYYY",
					},
					{
						type: "rich-text",
						name: "body",
						label: "Body",
						isBody: true,
					},
				],
			},
		],
	},
	search: {
		tina: {
			indexerToken: process.env.TINASEARCH,
			stopwordLanguages: ["eng"],
		},
		indexBatchSize: 50,
		maxSearchIndexFieldLength: 100,
	},
});
