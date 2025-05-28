export function match(param: string): boolean {
	// Common region slug patterns for ski areas
	// This should ideally be populated from database
	const validRegionSlugs = [
		// France
		'chamonix-mont-blanc', 'val-disere', 'tignes', 'courchevel', 'meribel', 'val-thorens',
		'les-deux-alpes', 'alpe-dhuez', 'la-plagne', 'les-arcs', 'paradiski', 'trois-vallees',
		'espace-killy', 'portes-du-soleil', 'evasion-mont-blanc', 'grand-massif',
		
		// Switzerland
		'zermatt', 'st-moritz', 'verbier', 'davos', 'st-anton', 'engelberg', 'jungfrau',
		'grindelwald', 'wengen', 'murren', 'saas-fee', 'crans-montana', 'villars',
		'leysin', 'champery', 'portes-du-soleil-swiss',
		
		// Austria
		'innsbruck', 'salzburg', 'tyrol', 'vorarlberg', 'carinthia', 'styria',
		'kitzbuhel', 'saalbach', 'kaprun', 'zell-am-see', 'bad-gastein', 'schladming',
		
		// Italy
		'dolomites', 'val-gardena', 'alta-badia', 'cortina-dampezzo', 'madonna-di-campiglio',
		'livigno', 'bormio', 'cervinia', 'courmayeur', 'sestriere', 'bardonecchia',
		
		// North America
		'colorado', 'utah', 'california', 'vermont', 'new-hampshire', 'montana', 'wyoming',
		'idaho', 'washington', 'oregon', 'alaska', 'british-columbia', 'alberta', 'quebec',
		'ontario', 'whistler-blackcomb', 'banff', 'lake-louise',
		
		// Specific US regions
		'aspen', 'vail', 'breckenridge', 'keystone', 'beaver-creek', 'steamboat-springs',
		'winter-park', 'telluride', 'crested-butte', 'park-city', 'deer-valley', 'alta',
		'snowbird', 'jackson-hole', 'big-sky', 'sun-valley', 'mammoth', 'tahoe',
		'squaw-valley', 'northstar', 'kirkwood', 'stowe', 'killington', 'sugarbush',
		
		// South America
		'patagonia', 'andes', 'valle-nevado', 'portillo', 'las-lenas', 'cerro-catedral',
		'chapelco', 'cerro-bayo',
		
		// Japan
		'hokkaido', 'honshu', 'niseko', 'rusutsu', 'kiroro', 'furano', 'tomamu',
		'hakuba', 'nozawa-onsen', 'shiga-kogen', 'myoko', 'naeba', 'zao'
	];
	
	const normalizedParam = param.toLowerCase().trim();
	
	// Direct match
	if (validRegionSlugs.includes(normalizedParam)) {
		return true;
	}
	
	// Basic slug pattern validation
	const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
	return slugPattern.test(normalizedParam) && normalizedParam.length >= 2 && normalizedParam.length <= 100;
}