
import { URL, HEADER, APIKEY, ACCESSTOKEN } from '../../App';
import { isMaintenance } from '../MaintenanceService/MaintenanceService';
import NavigationService from '../NavigationService';

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
		var lUrl = URL + 'logout';
		// alert(ACCESSTOKEN);
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
			.catch(async (error) => {
				await isMaintenance({navigation : NavigationService});
				console.error(error);
			});
	};

	async login(pFormData) {
		var lUrl = URL + 'login';
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
				console.log("then response" ,responseJson);
				
				// alert(JSON.stringify(responseJson))
				this.setRespData(responseJson);
			})
			.catch(async (error) => {
				console.error("====error",error);
				await isMaintenance({navigation : NavigationService});
				return true;
			});
	};

	async getBrands() {
		var lUrl = URL + 'getBrands';
		await fetch(lUrl, {
			method: 'POST',
			headers: {
				'Accept': 'application\/json',
				'Content-Type': 'multipart\/form-data',
				'apikey': 'c4o_LTJIez6XfnH^r=$l&!FAN@MM]5'
			}
		})
			.then((response) => response.json())
			.then((responseJson) => {
				this.setRespData(responseJson);
			})
			.catch(async (error) => {
				await isMaintenance({navigation : NavigationService});
				console.error(error);
			});
	};

	async getCountries() {
		var lUrl = URL + 'getCountries';
		await fetch(lUrl, {
			method: 'POST',
			headers: {
				'Accept': 'application\/json',
				'Content-Type': 'multipart\/form-data',
				'apikey': 'c4o_LTJIez6XfnH^r=$l&!FAN@MM]5'
			}
		})
			.then((response) => response.json())
			.then((responseJson) => {
				this.setRespData(responseJson);
			})
			.catch(async (error) => {
				await isMaintenance({navigation : NavigationService});
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
				'apikey': 'c4o_LTJIez6XfnH^r=$l&!FAN@MM]5'
			},
			body: pFormData
		})
			.then((response) => response.json())
			.then((responseJson) => {
				this.setRespData(responseJson);
			})
			.catch(async (error) => {
				await isMaintenance({navigation : NavigationService});
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
				'apikey': 'c4o_LTJIez6XfnH^r=$l&!FAN@MM]5'
			},
			body: pFormData
		})
			.then((response) => response.json())
			.then((responseJson) => {
				this.setRespData(responseJson);
			})
			.catch(async (error) => {
				await isMaintenance({navigation : NavigationService});
				console.error(error);
			});
	};

	async registration(pFormData) {
		var lUrl = URL + 'register';
		console.log(lUrl, pFormData);
		await fetch(lUrl, {
			method: 'POST',
			headers: {
				'Accept': 'application\/json',
				'Content-Type': 'multipart\/form-data',
				'apikey': 'c4o_LTJIez6XfnH^r=$l&!FAN@MM]5'
			},
			body: pFormData,
		}).then((response) => response.json())
			.then((responseJson) => {
				this.setRespData(responseJson);
			})
			.catch(async (error) => {
				console.error(error);
				await isMaintenance({navigation : NavigationService});
				// this.setRespData({'Error':'Service API failure','Message': error});
			});
	};
	async verifyOtp(pFormData) {
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
				this.setRespData(responseJson);
				if (responseJson.data) {
					this.setAccessToken(responseJson.data.accesstoken);
				}
			})
			.catch(async (error) => {
				console.error(error);
				await isMaintenance({navigation : NavigationService});
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