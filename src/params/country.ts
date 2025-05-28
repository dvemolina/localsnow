export function match(param: string): boolean {
	// Common country slug patterns for ski destinations
	// This should ideally be populated from database, but here's a comprehensive static list
	const validCountrySlugs = [
		// Europe
		'france', 'switzerland', 'austria', 'italy', 'germany', 'norway', 'sweden', 'finland',
		'spain', 'andorra', 'slovenia', 'czech-republic', 'slovakia', 'poland', 'romania',
		'bulgaria', 'bosnia-herzegovina', 'serbia', 'montenegro', 'north-macedonia',
		
		// North America
		'united-states', 'usa', 'canada',
		
		// South America
		'chile', 'argentina', 'peru', 'bolivia',
		
		// Asia
		'japan', 'south-korea', 'china', 'kazakhstan', 'kyrgyzstan', 'india', 'pakistan',
		'georgia', 'armenia', 'turkey', 'iran', 'lebanon', 'israel',
		
		// Oceania
		'australia', 'new-zealand',
		
		// Africa (limited ski destinations)
		'morocco', 'south-africa', 'lesotho'
	];
	
	// Normalize the param (lowercase, handle common variations)
	const normalizedParam = param.toLowerCase().trim();
	
	// Direct match
	if (validCountrySlugs.includes(normalizedParam)) {
		return true;
	}
	
	// Handle common variations
	const variations: Record<string, string[]> = {
		'usa': ['united-states', 'us'],
		'united-states': ['usa', 'us'],
		'uk': ['united-kingdom', 'great-britain', 'britain'],
		'united-kingdom': ['uk', 'great-britain', 'britain']
	};
	
	for (const [canonical, alts] of Object.entries(variations)) {
		if (alts.includes(normalizedParam) && validCountrySlugs.includes(canonical)) {
			return true;
		}
	}
	
	// Basic slug pattern validation (letters, numbers, hyphens only)
	const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
	return slugPattern.test(normalizedParam) && normalizedParam.length >= 2 && normalizedParam.length <= 50;
}