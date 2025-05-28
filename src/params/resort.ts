export function match(param: string): boolean {
	// Comprehensive list of major ski resort slugs
	// This should ideally be populated from database
	const validResortSlugs = [
		// France - Major Resorts
		'chamonix', 'val-disere', 'tignes', 'courchevel', 'meribel', 'val-thorens',
		'les-deux-alpes', 'alpe-dhuez', 'la-plagne', 'les-arcs', 'avoriaz', 'morzine',
		'les-gets', 'chatel', 'argentiere', 'les-houches', 'megeve', 'saint-gervais',
		'flaine', 'samoens', 'morillon', 'les-carroz', 'grand-bornand', 'la-clusaz',
		'val-cenis', 'bonneval-sur-arc', 'tignes-val-claret', 'val-disere-village',
		
		// Switzerland - Major Resorts
		'zermatt', 'st-moritz', 'verbier', 'davos', 'st-anton', 'engelberg', 'grindelwald',
		'wengen', 'murren', 'saas-fee', 'crans-montana', 'villars', 'leysin', 'champery',
		'andermatt', 'laax', 'flims', 'arosa', 'lenzerheide', 'klosters', 'gstaad',
		'adelboden', 'kandersteg', 'nendaz', 'veysonnaz', 'thyon', 'mayens-de-riddes',
		
		// Austria - Major Resorts
		'st-anton-am-arlberg', 'kitzbuhel', 'saalbach-hinterglemm', 'kaprun', 'zell-am-see',
		'bad-gastein', 'schladming', 'soelden', 'obergurgl', 'hochgurgl', 'ischgl',
		'serfaus', 'fiss', 'ladis', 'lech', 'zurs', 'warth', 'stuben', 'innsbruck',
		'axamer-lizum', 'patscherkofel', 'mutters', 'telfes', 'fulpmes', 'neustift',
		
		// Italy - Major Resorts
		'cortina-dampezzo', 'val-gardena', 'alta-badia', 'madonna-di-campiglio', 'livigno',
		'bormio', 'cervinia', 'courmayeur', 'sestriere', 'bardonecchia', 'sauze-doulx',
		'la-thuile', 'pila', 'champoluc', 'gressoney', 'alagna', 'macugnaga', 'ponte-di-legno',
		'tonale', 'marilleva', 'folgarida', 'canazei', 'campitello', 'ortisei', 'selva',
		
		// USA - Colorado
		'aspen', 'snowmass', 'vail', 'beaver-creek', 'breckenridge', 'keystone',
		'copper-mountain', 'arapahoe-basin', 'loveland', 'winter-park', 'mary-jane',
		'steamboat-springs', 'telluride', 'crested-butte', 'monarch', 'wolf-creek',
		'silverton', 'purgatory', 'powderhorn', 'sunlight', 'ski-cooper', 'eldora',
		
		// USA - Utah
		'park-city', 'deer-valley', 'canyons', 'alta', 'snowbird', 'solitude',
		'brighton', 'sundance', 'nordic-valley', 'powder-mountain', 'snowbasin',
		'eagle-point', 'brian-head', 'cherry-peak',
		
		// USA - California
		'mammoth-mountain', 'mammoth', 'squaw-valley', 'alpine-meadows', 'northstar',
		'kirkwood', 'heavenly', 'sierra-at-tahoe', 'sugar-bowl', 'boreal', 'soda-springs',
		'dodge-ridge', 'badger-pass', 'china-peak', 'mountain-high', 'snow-summit',
		'snow-valley', 'mt-baldy', 'mt-waterman',
		
		// USA - Other States
		'jackson-hole', 'grand-targhee', 'snow-king', 'big-sky', 'bridger-bowl',
		'red-lodge', 'whitefish', 'blacktail', 'sun-valley', 'brundage', 'tamarack',
		'schweitzer', 'silver-mountain', 'lookout-pass', 'lost-trail', 'crystal-mountain',
		'stevens-pass', 'snoqualmie', 'white-pass', 'mount-baker', 'mission-ridge',
		'mount-hood-meadows', 'timberline', 'mount-bachelor', 'anthony-lakes',
		'stowe', 'killington', 'sugarbush', 'mad-river-glen', 'smugglers-notch',
		'jay-peak', 'burke', 'magic-mountain', 'bromley', 'stratton', 'mount-snow',
		'okemo', 'ludlow', 'ascutney', 'dartmouth-skiway',
		
		// Canada
		'whistler-blackcomb', 'whistler', 'blackcomb', 'grouse-mountain', 'cypress',
		'mount-seymour', 'sun-peaks', 'big-white', 'silver-star', 'red-mountain',
		'fernie', 'kimberley', 'panorama', 'kicking-horse', 'revelstoke', 'whitewater',
		'lake-louise', 'sunshine-village', 'mount-norquay', 'marmot-basin', 'nakiska',
		'mont-tremblant', 'mont-sainte-anne', 'le-massif', 'stoneham', 'mont-orford',
		
		// South America
		'portillo', 'valle-nevado', 'la-parva', 'el-colorado', 'farellones', 'corralco',
		'nevados-de-chillan', 'antillanca', 'cerro-catedral', 'cerro-bayo', 'chapelco',
		'caviahue', 'las-lenas', 'penitentes', 'los-puquios',
		
		// Japan
		'niseko', 'rusutsu', 'kiroro', 'furano', 'tomamu', 'sahoro', 'kamui-ski-links',
		'hakuba-valley', 'happo-one', 'hakuba-47', 'goryu', 'tsugaike', 'cortina',
		'kashimayari', 'jiigatake', 'norikura', 'nozawa-onsen', 'shiga-kogen',
		'myoko-kogen', 'lotte-arai', 'naeba', 'kagura', 'tazawako', 'appi-kogen',
		'zao-onsen', 'yamagata-zao', 'bandai', 'alts-bandai', 'grandeco'
	];
	
	const normalizedParam = param.toLowerCase().trim();
	
	// Direct match
	if (validResortSlugs.includes(normalizedParam)) {
		return true;
	}
	
	// Handle common variations and patterns
	const commonVariations: Record<string, string[]> = {
		'whistler': ['whistler-blackcomb', 'whistler-village'],
		'aspen': ['aspen-snowmass', 'aspen-mountain'],
		'vail': ['vail-village', 'vail-mountain'],
		'chamonix': ['chamonix-mont-blanc'],
		'st-anton': ['st-anton-am-arlberg'],
		'val-disere': ['val-d-isere']
	};
	
	for (const [canonical, alts] of Object.entries(commonVariations)) {
		if (alts.includes(normalizedParam) && validResortSlugs.includes(canonical)) {
			return true;
		}
	}
	
	// Basic slug pattern validation for resort names
	const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
	const isValidSlug = slugPattern.test(normalizedParam);
	const isValidLength = normalizedParam.length >= 2 && normalizedParam.length <= 100;
	
	// Additional validation for resort-like patterns
	const resortPatterns = [
		/^mount?-[a-z0-9-]+$/,     // mount-*, mt-*
		/^[a-z0-9-]+-mountain$/,   // *-mountain
		/^[a-z0-9-]+-valley$/,     // *-valley
		/^[a-z0-9-]+-ski$/,        // *-ski
		/^[a-z0-9-]+-resort$/,     // *-resort
		/^[a-z0-9-]+-village$/,    // *-village
		/^[a-z0-9-]+-pass$/,       // *-pass
		/^[a-z0-9-]+-basin$/,      // *-basin
		/^[a-z0-9-]+-peak$/,       // *-peak
		/^[a-z0-9-]+-ridge$/,      // *-ridge
		/^cerro-[a-z0-9-]+$/,      // cerro-* (South American pattern)
		/^les-[a-z0-9-]+$/,        // les-* (French pattern)
		/^val-[a-z0-9-]+$/,        // val-* (Alpine pattern)
		/^saint?-[a-z0-9-]+$/      // saint-*, st-* (Saint patterns)
	];
	
	const matchesResortPattern = resortPatterns.some(pattern => pattern.test(normalizedParam));
	
	return isValidSlug && isValidLength && (validResortSlugs.includes(normalizedParam) || matchesResortPattern);
}