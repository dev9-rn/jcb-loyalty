import React, {Component} from 'react';
import { Dimensions, Platform } from 'react-native';

import { useToast } from 'native-base';

export function checkSpecialChar(str) {
    var format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
	
	if(format.test(str)){
	  	return false;
	} else {
	  	return true;
	}
}
	
export function checkMobileNumber(pNumber){
	var reg = /^(?:[5-9]\d*|\d)$/;
	var res = reg.test(pNumber);
	console.log(res);
	return res;
}

export function checkDateFormat(dd) {
	var reg = /^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[13-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/;
	var res = reg.test(dd);
	return res;
}

export function checkEmail(pEmail) {
	var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
	return filter.test(pEmail);
}

export function checkIFSC(ifsc) {
	var filter = /^[A-Za-z]{4}\d{7}$/;
	return filter.test(ifsc);
}

export function checkPanNo(pPanNo) {
	var regPanNo = /^([a-zA-Z]){5}([0-9]){4}([a-zA-Z]){1}?$/;
	return regPanNo.test(pPanNo);
}

export function showToastMsg(msg){
	useToast.show({
    	text: msg,
      	style: { position: 'absolute', bottom:10,left:10,right:10, borderRadius: 5 }	
    });
}