
import { URL, HEADER, APIKEY, ACCESSTOKEN } from '../../App';
import { isMaintenance } from '../MaintenanceService/MaintenanceService';
import NavigationService from '../NavigationService';

class HistoryService{
	
	responseData: responseData;

	getRespData(){
		return this.responseData;
	}

	setRespData(responseData: data){
		this.responseData = responseData;
	}


	async getRedeemHistory(pFormData){
		var lUrl = URL + 'getRedeemHistory'; 
		await fetch(lUrl, {
  			method: 'POST',
		  	headers: {
        		'Accept': 'application\/json',
        		'Content-Type': 'multipart\/form-data',
        		'apikey': APIKEY,
            	'accesstoken': ACCESSTOKEN
  			} ,
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

export default HistoryService;