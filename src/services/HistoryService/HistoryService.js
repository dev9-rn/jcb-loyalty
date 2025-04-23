
import { URL, HEADER, APIKEY, ACCESSTOKEN } from '../../App';

class HistoryService {

	responseData: responseData;

	getRespData() {
		return this.responseData;
	}

	setRespData(responseData: data) {
		this.responseData = responseData;
	}


	async getRedeemHistory(pFormData) {
		var lUrl = URL + 'getRedeemHistory';

		// console.log("pFormData" + pFormData	);
		console.log("ACCESSTOKEN" + ACCESSTOKEN);
		console.log("APIKEY" + APIKEY);
		console.log("lUrl" + lUrl);
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
				console.log("responseJson" + responseJson.status);

				console.log(JSON.stringify(responseJson));
				this.setRespData(responseJson);
			})
			.catch((error) => {
				console.error(error);
			});
	};

}

export default HistoryService;