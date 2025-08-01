
import { URL, HEADER } from '../../App';
import { isMaintenance } from '../MaintenanceService/MaintenanceService';
import NavigationService from '../NavigationService';

class InstituteService{
	
	responseData: responseData;

	getRespData(){
		return this.responseData;
	}

	setRespData(responseData: data){
		this.responseData = responseData;
	}

	async instituteLogin(pFormData){
		 ;
		var lUrl = URL + 'institute_login_arr.php'; 
		await fetch(lUrl, {
  			method: 'POST',
		  	headers: HEADER,
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

	async instituteScanViewCertificate(pFormData){
		 ;
		var lUrl = URL + 'scan_view_certificate.php'; 
		await fetch(lUrl, {
  			method: 'POST',
		  	headers: HEADER,
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

	async instituteScan1DCertificate(pFormData){
		 ;
		var lUrl = URL + 'scan_view_audit_trail.php'; 
		await fetch(lUrl, {
  			method: 'POST',
		  	headers: HEADER,
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

export default InstituteService;