
import { URL, HEADER } from '../../App';

class VerifierService{
	
	responseData: responseData;

	getRespData(){
		return this.responseData;
	}

	setRespData(responseData: data){
		this.responseData = responseData;
	}

	async scanByPublicUser(pFormData){
		 ;
		var lUrl = URL + 'scan_arr.php'; 
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
    	.catch((error) => {
      		console.error(error);
    	});
	};


}

export default VerifierService;