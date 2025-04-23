
import { URL, HEADER, APIKEY, ACCESSTOKEN } from '../../App';

class ScanService {

	responseData: responseData;

	getRespData() {
		return this.responseData;
	}

	setRespData(responseData: data) {
		this.responseData = responseData;
	}

	async checkCoupon(pFormData) {
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
			.catch((error) => {
				console.error(error);
			});
	};

	async redeemCoupon(pFormData) {
		debugger
		var lUrl = URL + 'redeemCoupon';

		console.log("URL" + lUrl);
		console.log("pFormData" + pFormData);
		console.log("URL" + APIKEY);
		console.log("ACCESSTOKEN" + ACCESSTOKEN);
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
			.catch((error) => {
				console.error(error);
			});
	};

}

export default ScanService;