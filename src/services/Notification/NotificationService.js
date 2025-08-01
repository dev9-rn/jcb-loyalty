
import { URL, APIKEY, ACCESSTOKEN } from '../../App';
import NavigationService from '../NavigationService';

class NotificationService {

	responseData: responseData;

	getRespData() {
		console.log(this.responseData);
		return this.responseData;
	}
	setRespData(responseData: data) {
		this.responseData = responseData;
	}

	async getNotifications(pFormData) {
		var lUrl = URL + 'getNotifications';
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
				console.log(responseJson);
			})
			.catch(async (error) => {
				await isMaintenance({navigation : NavigationService});
				console.error(error);
			});
	};
}
export default NotificationService;