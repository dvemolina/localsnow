export function match(param: string): boolean {
	// Match against the sportSlugEnum values
    //Maybe change to a db call afterwards
	const validSports = ['ski', 'snowboard', 'telemark'];
	return validSports.includes(param.toLowerCase());
}