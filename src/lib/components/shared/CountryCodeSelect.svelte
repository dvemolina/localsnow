<script lang="ts">
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Form from '$lib/components/ui/form';

	let props = $props();

	let form = props.form;
	let name = props.name;

	const prefixes = [
  { label: '+1 (USA/Canada)', value: 1 },
  { label: '+20 (Egypt)', value: 20 },
  { label: '+27 (South Africa)', value: 27 },
  { label: '+30 (Greece)', value: 30 },
  { label: '+31 (Netherlands)', value: 31 },
  { label: '+32 (Belgium)', value: 32 },
  { label: '+33 (France)', value: 33 },
  { label: '+34 (Spain)', value: 34 },
  { label: '+36 (Hungary)', value: 36 },
  { label: '+39 (Italy)', value: 39 },
  { label: '+40 (Romania)', value: 40 },
  { label: '+41 (Switzerland)', value: 41 },
  { label: '+43 (Austria)', value: 43 },
  { label: '+44 (United Kingdom)', value: 44 },
  { label: '+45 (Denmark)', value: 45 },
  { label: '+46 (Sweden)', value: 46 },
  { label: '+47 (Norway)', value: 47 },
  { label: '+48 (Poland)', value: 48 },
  { label: '+49 (Germany)', value: 49 },
  { label: '+51 (Peru)', value: 51 },
  { label: '+52 (Mexico)', value: 52 },
  { label: '+53 (Cuba)', value: 53 },
  { label: '+54 (Argentina)', value: 54 },
  { label: '+55 (Brazil)', value: 55 },
  { label: '+56 (Chile)', value: 56 },
  { label: '+57 (Colombia)', value: 57 },
  { label: '+58 (Venezuela)', value: 58 },
  { label: '+60 (Malaysia)', value: 60 },
  { label: '+61 (Australia)', value: 61 },
  { label: '+62 (Indonesia)', value: 62 },
  { label: '+63 (Philippines)', value: 63 },
  { label: '+64 (New Zealand)', value: 64 },
  { label: '+65 (Singapore)', value: 65 },
  { label: '+66 (Thailand)', value: 66 },
  { label: '+81 (Japan)', value: 81 },
  { label: '+82 (South Korea)', value: 82 },
  { label: '+84 (Vietnam)', value: 84 },
  { label: '+86 (China)', value: 86 },
  { label: '+90 (Turkey)', value: 90 },
  { label: '+91 (India)', value: 91 },
  { label: '+92 (Pakistan)', value: 92 },
  { label: '+93 (Afghanistan)', value: 93 },
  { label: '+94 (Sri Lanka)', value: 94 },
  { label: '+95 (Myanmar)', value: 95 },
  { label: '+98 (Iran)', value: 98 },
  { label: '+211 (South Sudan)', value: 211 },
  { label: '+212 (Morocco)', value: 212 },
  { label: '+213 (Algeria)', value: 213 },
  { label: '+216 (Tunisia)', value: 216 },
  { label: '+218 (Libya)', value: 218 },
  { label: '+220 (Gambia)', value: 220 },
  { label: '+221 (Senegal)', value: 221 },
  { label: '+222 (Mauritania)', value: 222 },
  { label: '+223 (Mali)', value: 223 },
  { label: '+224 (Guinea)', value: 224 },
  { label: '+225 (Ivory Coast)', value: 225 },
  { label: '+226 (Burkina Faso)', value: 226 },
  { label: '+227 (Niger)', value: 227 },
  { label: '+228 (Togo)', value: 228 },
  { label: '+229 (Benin)', value: 229 },
  { label: '+230 (Mauritius)', value: 230 },
  { label: '+231 (Liberia)', value: 231 },
  { label: '+232 (Sierra Leone)', value: 232 },
  { label: '+233 (Ghana)', value: 233 },
  { label: '+234 (Nigeria)', value: 234 },
  { label: '+235 (Chad)', value: 235 },
  { label: '+236 (Central African Republic)', value: 236 },
  { label: '+237 (Cameroon)', value: 237 },
  { label: '+238 (Cape Verde)', value: 238 },
  { label: '+239 (São Tomé and Príncipe)', value: 239 },
  { label: '+240 (Equatorial Guinea)', value: 240 },
  { label: '+241 (Gabon)', value: 241 },
  { label: '+242 (Congo)', value: 242 },
  { label: '+243 (DR Congo)', value: 243 },
  { label: '+244 (Angola)', value: 244 },
  { label: '+245 (Guinea-Bissau)', value: 245 },
  { label: '+246 (British Indian Ocean Territory)', value: 246 },
  { label: '+248 (Seychelles)', value: 248 },
  { label: '+249 (Sudan)', value: 249 },
  { label: '+250 (Rwanda)', value: 250 },
  { label: '+251 (Ethiopia)', value: 251 },
  { label: '+252 (Somalia)', value: 252 },
  { label: '+253 (Djibouti)', value: 253 },
  { label: '+254 (Kenya)', value: 254 },
  { label: '+255 (Tanzania)', value: 255 },
  { label: '+256 (Uganda)', value: 256 },
  { label: '+257 (Burundi)', value: 257 },
  { label: '+258 (Mozambique)', value: 258 },
  { label: '+260 (Zambia)', value: 260 },
  { label: '+261 (Madagascar)', value: 261 },
  { label: '+262 (Réunion/Mayotte)', value: 262 },
  { label: '+263 (Zimbabwe)', value: 263 },
  { label: '+264 (Namibia)', value: 264 },
  { label: '+265 (Malawi)', value: 265 },
  { label: '+266 (Lesotho)', value: 266 },
  { label: '+267 (Botswana)', value: 267 },
  { label: '+268 (Eswatini)', value: 268 },
  { label: '+269 (Comoros)', value: 269 },
  { label: '+290 (Saint Helena)', value: 290 },
  { label: '+291 (Eritrea)', value: 291 },
  { label: '+297 (Aruba)', value: 297 },
  { label: '+298 (Faroe Islands)', value: 298 },
  { label: '+299 (Greenland)', value: 299 }
];

	const formStore = form.form; //the reactive store for form values
</script>

<Form.Field {form} {name} class="w-full">
	<Form.Control>
		{#snippet children({ props })}
			<Form.Label>Country Prefix</Form.Label>
			<Select.Root type="single" bind:value={$formStore[name]} name={props.name}>
				<Select.Trigger {...props} class="w-full">
					{$formStore[name] ? $formStore[name] : 'Country Prefix'}
				</Select.Trigger>
				<Select.Content>
					{#each prefixes as { label, value }}
						<Select.Item {value} {label} />
					{/each}
				</Select.Content>
			</Select.Root>
		{/snippet}
	</Form.Control>
</Form.Field>