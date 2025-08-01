
import { URL, HEADER, APIKEY, ACCESSTOKEN } from '../../App';
import NavigationService from '../NavigationService';

class ProfileService {

	responseData: responseData;

	getRespData() {
		return this.responseData;
	}

	setRespData(responseData: data) {
		this.responseData = responseData;
	}

	async getDistributorProfile(pFormData) {
		var lUrl = URL + 'getDistributorProfile';
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
				// alert(JSON.stringify(responseJson));
				this.setRespData(responseJson);
			})
			.catch(async (error) => {
				await isMaintenance({navigation : NavigationService});
				console.error(error);
			});
	};

	async updateProfile(pFormData) {
		var lUrl = URL + 'updateProfile';
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
				console.log(JSON.stringify(responseJson));
				this.setRespData(responseJson);
			})
			.catch(async (error) => {
				await isMaintenance({navigation : NavigationService});
				console.error(error);
			});
	};




	async getMechanicProfile(pFormData) {
		var lUrl = URL + 'getMechanicProfile';
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
				// alert(JSON.stringify(responseJson));
				this.setRespData(responseJson);
			})
			.catch(async (error) => {
				await isMaintenance({navigation : NavigationService});
				console.error(error);
			});
	};

	async updateProfileMechanic(pFormData) {
		var lUrl = URL + 'updateProfileMechanic';
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
				console.log(JSON.stringify(responseJson));
				this.setRespData(responseJson);
			})
			.catch(async (error) => {
				await isMaintenance({navigation : NavigationService});
				console.error(error);
			});
	};

}

export default ProfileService;