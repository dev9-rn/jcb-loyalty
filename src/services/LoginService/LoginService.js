
import { URL, HEADER, APIKEY, ACCESSTOKEN } from '../../App';

class LoginService {

	responseData: responseData;
	accessToken: accessToken;
	getRespData() {
		return this.responseData;
	}
	setRespData(responseData: data) {
		this.responseData = responseData;
	}

	getAccessToken() {
		return this.accessToken;
	}
	setAccessToken(accessToken: accessToken) {
		this.accessToken = accessToken;
	}

	async logOut(pFormData) {
		debugger;
		var lUrl = URL + 'logout';
		await fetch(lUrl, {
			method: 'POST',
			headers: {
				'Accept': 'application\/json',
				'Content-Type': 'multipart\/form-data',
				'apikey': APIKEY,
				'accesstoken': ACCESSTOKEN
			},
			body: pFormData,
		})
			.then((response) => response.json())
			.then((responseJson) => {
				this.setRespData(responseJson);
			})
			.catch((error) => {
				console.error(error);
			});
	};

	async login(pFormData) {
		debugger
		var lUrl = URL + 'login';

		console.log(pFormData)
		console.log("URL" + URL)
		console.log("APIKEY" + APIKEY)
		await fetch(lUrl, {
			method: 'POST',
			headers: {
				'Accept': 'application\/json',
				'Content-Type': 'multipart\/form-data',
				'apikey': APIKEY
			},
			body: pFormData,
		})
			.then((response) => response.json())
			.then((responseJson) => {
				// alert(JSON.stringify(responseJson))
				console.log("===============-=------------------------------====-=========");
				console.log("responseJson" + responseJson);
				this.setRespData(responseJson);
			})
			.catch((error) => {
				console.error(error);
			});
	};

	async getBrands() {
		var lUrl = URL + 'getBrands';
		await fetch(lUrl, {
			method: 'POST',
			headers: {
				'Accept': 'application\/json',
				'Content-Type': 'multipart\/form-data',
				'apikey': 'JE*U#?tg$%|RFU6uXw>p^I+e7$+#oE'
			}
		})
			.then((response) => response.json())
			.then((responseJson) => {
				this.setRespData(responseJson);
			})
			.catch((error) => {
				console.error(error);
			});
	};

	async getCountries() {
		var lUrl = URL + 'getCountries';

		console.log(lUrl);
		await fetch(lUrl, {
			method: 'POST',
			headers: {
				'Accept': 'application\/json',
				'Content-Type': 'multipart\/form-data',
				'apikey': 'JE*U#?tg$%|RFU6uXw>p^I+e7$+#oE'
			}
		})
			.then((response) => response.json())
			.then((responseJson) => {
				console.log("working Country");
				this.setRespData(responseJson);
			})
			.catch((error) => {
				console.error(error);
			});
	};

	async getStatesByCountry(pFormData) {
		var lUrl = URL + 'getStatesByCountry';
		await fetch(lUrl, {
			method: 'POST',
			headers: {
				'Accept': 'application\/json',
				'Content-Type': 'multipart\/form-data',
				'apikey': 'JE*U#?tg$%|RFU6uXw>p^I+e7$+#oE'
			},
			body: pFormData
		})
			.then((response) => response.json())
			.then((responseJson) => {
				console.log(responseJson);

				this.setRespData(responseJson);
			})
			.catch((error) => {
				console.error(error);
			});
	};

	async getCitiesByState(pFormData) {
		var lUrl = URL + 'getCitiesByState';
		await fetch(lUrl, {
			method: 'POST',
			headers: {
				'Accept': 'application\/json',
				'Content-Type': 'multipart\/form-data',
				'apikey': 'JE*U#?tg$%|RFU6uXw>p^I+e7$+#oE'
			},
			body: pFormData
		})
			.then((response) => response.json())
			.then((responseJson) => {
				this.setRespData(responseJson);
			})
			.catch((error) => {
				console.error(error);
			});
	};

	async registration(pFormData) {
		debugger;
		var lUrl = URL + 'register';
		await fetch(lUrl, {
			method: 'POST',
			headers: {
				'Accept': 'application\/json',
				'Content-Type': 'multipart\/form-data',
				'apikey': 'JE*U#?tg$%|RFU6uXw>p^I+e7$+#oE'
			},
			body: pFormData,
		}).then((response) => response.json())
			.then((responseJson) => {
				console.log(responseJson);
				this.setRespData(responseJson);
			})
			.catch((error) => {
				console.error(error);
				// this.setRespData({'Error':'Service API failure','Message': error});
			});
	};
	async verifyOtp(pFormData) {
		debugger;
		var lUrl = URL + 'verifyOtp';
		await fetch(lUrl, {
			method: 'POST',
			headers: {
				'Accept': 'application\/json',
				'Content-Type': 'multipart\/form-data',
				'apikey': APIKEY
			},
			body: pFormData,
		}).then((response) => response.json())
			.then((responseJson) => {
				console.log(responseJson);
				this.setRespData(responseJson);
				if (responseJson.status === 403) {

				} else if (responseJson.status === 422 || responseJson.status == 503 || responseJson.status == 451) {

				} else if(responseJson.status == 200){
					console.log("aaya andr bhai");
					this.setAccessToken(responseJson.data.accesstoken);

				}
			})
			.catch((error) => {
				console.error(error);
				// this.setRespData({'Error':'Service API failure','Message': error});
			});
	};
	// .then((response) => {
	// 	this.setRespData(response.json());
	// 	this.setAccessToken(response.headers.map.accesstoken);
	// 	// response.json();

	// })
}

export default LoginService;