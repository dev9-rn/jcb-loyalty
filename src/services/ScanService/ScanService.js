
import { URL, HEADER, APIKEY, ACCESSTOKEN } from '../../App';
import { isMaintenance } from '../MaintenanceService/MaintenanceService';
import NavigationService from '../NavigationService';

class ScanService {

	responseData: responseData;

	getRespData() {
		return this.responseData;
	}

	setRespData(responseData: data) {
		this.responseData = responseData;
	}

	async checkCoupon(pFormData) {

		console.log(URL);
		console.log(ACCESSTOKEN);
		console.log(APIKEY);
		debugger
		var lUrl = URL + 'checkCoupon';
		await fetch(lUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'multipart\/form-data',
				'apikey': APIKEY,
				'accesstoken': ACCESSTOKEN
			},
			body: pFormData,
		})
			.then((response) => response.json())
			.then((responseJson) => {
				// alert(JSON.stringify(responseJson))
				console.log(JSON.stringify(responseJson));
				this.setRespData(responseJson);
			})
			.catch(async (error) => {
				await isMaintenance({navigation : NavigationService});
				console.error(error);
			});
	};

	async redeemCoupon(pFormData) {
		console.log("ACCESSTOKEN");
		console.log(ACCESSTOKEN);
		
		var lUrl = URL + 'redeemCoupon';
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
				console.log("--=-=-=-=-=-=");
				
				console.log(JSON.stringify(responseJson));
				this.setRespData(responseJson);
			})
			.catch(async (error) => {
				await isMaintenance({navigation : NavigationService});
				console.error(error);
			});
	};
	async redeemCouponV1(pFormData) {
		console.log("ACCESSTOKEN");
		console.log(ACCESSTOKEN, "V1");
		
		var lUrl = URL + 'redeemCouponV1Apk';
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
				console.log("--=-=-=-=-=-=");
				
				console.log(JSON.stringify(responseJson));
				this.setRespData(responseJson);
			})
			.catch(async (error) => {
				await isMaintenance({navigation : NavigationService});
				console.error(error);
			});
	};
}

export default ScanService;