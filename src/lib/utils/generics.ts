import 'dotenv';

export function getProjectUrl() {
	if(process.env.NODE_ENV === "production"){
		return 'https://localsnow.org'
	}else {
		return 'http://localhost:5173'
	}
}