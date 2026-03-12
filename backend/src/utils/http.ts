export function ok<T>(data: T) {
	return {
		success: true,
		data,
	};
}

export function fail(message: string, status = 400) {
	return {
		success: false,
		message,
		status,
	};
}