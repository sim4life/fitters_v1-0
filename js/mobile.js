// var apiDomain = Environment.baseApiUrl();
var apiDomain = "http://obsoap.risk-technology.co.uk";

var Init = {
    initState: function() {
    }
};

var Api = {
    urlFor: function(endPoint) {
        return apiDomain + endPoint;
    },
    
    authParams: function(params, send_key) {
        // Util.logger('account_key is:', localStorage.account_key);
        send_key = (send_key) ? send_key : true;
        if(send_key) {
            params.account_key = Api.getLocalStorageProp('account_key');
            params.device_key = Api.getLocalStorageProp('device_key');
        }
            
        return params;
    },
    
    /*It takes a normal localDateObject and returns a formattedUTCDateString*/
    formatToUTCDate: function(unfmtLocalDate) {
        // '%Y%m%d%H%M%S' --> Ruby API format
        // Util.logger('Unformatted Date is: ', unfmtLocalDate);
        if(Ext.isEmpty(unfmtLocalDate))
            return unfmtLocalDate;
            
        var fmtUTCDate = unfmtLocalDate.add(Date.MINUTE, unfmtLocalDate.getTimezoneOffset());
        
        return fmtUTCDate.format('YmdHis');
    },
    
    /*It takes a formattedUTCDateString and returns a localDateObject*/
    parseFromUTCDate: function(fmtUTCDateStr) {
        // Util.logger('Unparsed data is: ', fmtUTCDateStr);
        if(Ext.isEmpty(fmtUTCDateStr))
            return null;
            
        year = parseInt(fmtUTCDateStr.substr(0, 4), 10);
        month = parseInt(fmtUTCDateStr.substr(4, 2), 10)-1;
        date = parseInt(fmtUTCDateStr.substr(6, 2), 10);
        hrs = parseInt(fmtUTCDateStr.substr(8, 2), 10);
        mins = parseInt(fmtUTCDateStr.substr(10, 2), 10);
        secs = parseInt(fmtUTCDateStr.substr(12, 2), 10);
        
        var localDate = new Date(Date.UTC(year, month, date, hrs, mins, secs));
        // var localDate = Date.parseDate(fmtUTCDateStr, "YmdHis", true);
        // Util.logger('date is::'+year+'-'+month+'-'+date+'-'+hrs+'-'+mins+'-'+secs);
        return localDate;
    },
    
    getLocalStorageProp: function(key) {
        return localStorage[key];
    },
    
    setLocalStorageProp: function(key, value) {
        localStorage[key] = value;
    },
    
    clearLocalStorage: function(key) {
        if(!Ext.isEmpty(key)) {
            Util.logger('[INFO]:: Clearing all '+key+' keys from localStorage');
            if(!Ext.isEmpty(localStorage[key]))
                localStorage.removeItem(key);
            else {
                var lKey, keys = [], count = 0, isFound = true;
                while(isFound) {
                    isFound = false;
                    keys = [];
                    for(var i = 0, ln = localStorage.length; i < ln; i++) {
                        lKey = localStorage.key(i);
                        if(lKey.indexOf(key) != -1) {
                            keys.push(lKey);
                            isFound = true;
                        }
                    }
                    for(var i = 0, ln = keys.length; i < ln; i++) {
                        localStorage.removeItem(keys[i]);
                    }
                    count++;
                }
                Util.logger('Keys were traversed '+count+' times');
            }
        } else {
            Util.logger('[WARN]:: Clearing all KEYS from localStorage');
            //these are all the user-defined or retainable keys
            var retainableKeysMap = {};
                
            var retainableKeyVals = {};
            for(var key in retainableKeysMap) {
                retainableKeysMap[key] = localStorage[key];
                for(var i = localStorage.length-1; i >= 0; i--) {
                    if(localStorage.key(i).indexOf(key) != -1)
                        retainableKeyVals[localStorage.key(i)] = localStorage[localStorage.key(i)];
                }
            }

            localStorage.clear(); //can also use
            /*
            for(var i = localStorage.length-1; i >= 0; i--) {
                localStorage.removeItem(localStorage.key(i));
            }
            */

            //restoring the values of retainable keys
            for(var key in retainableKeysMap) {
                localStorage[key] = retainableKeysMap[key];
            }
            
            for(var key in retainableKeyVals) {
                localStorage[key] = retainableKeyVals[key];
            }
            
        }
    },
    
    getButtonBase: function(btnText, isHidden, cssCls, handlerCB) {
        return {
            text: btnText,
            hidden: isHidden,
            handler: handlerCB,
            cls: cssCls,
            scope: this
        };
    }
};

var User = {
    getLoginFormBase: function(loginCB, signupCB) {
        return {
            fullscreen: true,
            standardSubmit: false,
            cls: 'auth_panel',
			id: 'login_form_panel',
            items: [{
                xtype: 'fieldset',
                defaults: {
                    required: true, // has no visual effect as we use a placeHolder for the label
                    useClearIcon: true
                },
                items: [{
                    xtype: 'emailfield',
                    name: 'username',
                    placeHolder: 'Email',
                    autoCapitalize : false,
                    autoComplete: false,
                    autoCorrect: false
                }, {
                    xtype: 'passwordfield',
                    name: 'password',
                    placeHolder: 'Password',
                    id: 'loginPasswordField'
                }/*, {
                    xtype: 'passwordfield',
                    name: 'password2',
                    placeHolder: 'Re-type Password',
                    hidden: true,
                    id: 'loginPasswordField2'
                }*/]
            }, {
                xtype: 'fieldset',
                items: [{
                    xtype: 'button',
                    id: 'loginButton',
                    ui: 'action',
                    text: 'Login',
                    handler: loginCB
                }/*, {
                    xtype: 'button',
                    id: 'newuserButton',
                    text: 'New user? Sign up here',
                    handler: function(ele, eve) {
                        Ext.getCmp('loginButton').hide();
                        Ext.getCmp('newuserButton').hide();
                        Ext.getCmp('loginPasswordField2').show();
                        Ext.getCmp('signupButton').show();
                        Ext.getCmp('cancelButton').show();
                    }
                }, {
                    xtype: 'button',
                    id: 'signupButton',
                    text: 'Sign Up',
                    hidden: true,
                    handler: signupCB
                }, {
                    xtype: 'button',
                    id: 'cancelButton',
                    text: 'Cancel',
                    hidden: true,
                    ui: 'decline',
                    handler: function(ele, eve) {
                        Ext.getCmp('loginPasswordField2').setValue('');
                        Ext.getCmp('loginPasswordField2').hide();
                        Ext.getCmp('signupButton').hide();
                        Ext.getCmp('cancelButton').hide();
                        Ext.getCmp('loginButton').show();
                        Ext.getCmp('newuserButton').show();
                    }
                }*/]
            }],
            listeners: {
                // this is to handle the "Go" button on the iPhone keyboard, bit hacky can't find another way to do it
                beforesubmit: function(formPanel, values, options) {
                    if(Ext.getCmp('loginButton').isHidden())
                        signupCB(formPanel, values);
                    else
                        loginCB(formPanel, values);
                }
            }
        };
    },
    
    login: function(email, password, failForm, succCallback, failCallBack) {
        var errMsg = "Device Offline or Server not responding!";
		
		var uname = "onboardwebservice",
			pswd = "password";
		
        Api.setLocalStorageProp('login', email);
        Api.setLocalStorageProp('user_id', '1');
        
        // succCallback();
        
		SOAPClient.username = uname;
		SOAPClient.password = pswd;
		var params = new SOAPClientParameters();
		params.add("username", uname);
		params.add("password", pswd);
        Ext.getBody().mask('Authenticating...', 'x-mask-loading', false);
		var resp = SOAPClient.invoke(apiDomain, "Login", params, false, function(res1, res2) {
            Util.logger('SOAP response is:', res1);
            Util.logger('SOAP response2 is:', res2);
			
			// SOAPClient.username = uname;
			// SOAPClient.password = pswd;
			Util.logger('SOAP session_cookie is:', SOAPClient.session_cookie);
			
			if(SOAPClient.session_cookie)
				Api.setLocalStorageProp('account_key', SOAPClient.session_cookie);
			/*
			params = new SOAPClientParameters();
			params.add("VehicleRegistration", "sdfds3243");
			SOAPClient.invoke(apiDomain, "GetVehicleInformation", params, true, function(r1, r22) {
				Util.logger('SOAP response is:', r1);
	            Util.logger('SOAP response2 is:', r22);
	            
            });

*/
			Ext.getBody().unmask();

			succCallback();
    		
		});
		
		Util.logger('raw response is::', resp);

        /*
        Ext.getBody().mask('Authenticating...', 'x-mask-loading', false);
        Ext.Ajax.request({
            url: Api.urlFor('/apiv2/auth/key'),
            method: 'POST',
            params: { login: email, password: password, device_key: Api.getLocalStorageProp('device_key') },
            timeout: 10000,
            success: function(response, opts) {
                Api.setLocalStorageProp('account_key', Ext.decode(response.responseText).account_key);
                Api.setLocalStorageProp('user_id', Ext.decode(response.responseText).id);
                
                Util.logger('in login account_key is:', Api.getLocalStorageProp('account_key'));
                
                Ext.getBody().unmask();
                
                succCallback();
            },
            failure: function(response, opts) {
                Util.logger('[INFO]:: server-side failure with status code ', response.status);
                Util.logger(response);
                
                if(!Ext.isEmpty(response.request.timedout))
                    errMsg = 'Request timedout'
                else if(response.status != 0)
                    errMsg = Ext.decode(response.responseText).error;

                Ext.getBody().unmask();
                failCallBack(failForm, "Login Failed!", errMsg);
            }
        });
        */
    },
    /*
    signup: function(email, password, failForm, succCallback, failCallBack) {
        var errMsg = "Device Offline or Server not responding!";
        var signup_key = '';
        
        Ext.getBody().mask('Authenticating...', 'x-mask-loading', false);
        Ext.Ajax.request({
            url: Api.urlFor('/apiv2/auth/signup_key'),
            method: 'POST',
            timeout: 10000,
            success: function(response, opts) {
                signup_key = Ext.decode(response.responseText).signup_key;

                Ext.getBody().unmask();
                Ext.getBody().mask('Signing Up...', 'x-mask-loading', false);
                if(!Ext.isEmpty(signup_key)) {
                    Ext.Ajax.request({
                        url: Api.urlFor('/apiv2/users'),
                        method: 'POST',
                        jsonData: { signup_key: signup_key, user: { email: email, password: password }},
                        timeout: 10000,
                        success: function(response, opts) {
                            Api.setLocalStorageProp('account_key', Ext.decode(response.responseText).account_key);
                            Api.setLocalStorageProp('user_id', Ext.decode(response.responseText).id);
                            Util.logger('in login account_key is:', Api.getLocalStorageProp('account_key'));
                            
                            Ext.getBody().unmask();

                            succCallback();
                        },
                        failure: function(response, opts) {
                            Util.logger('[INFO]:: server-side failure with status code ', response.status);
                            Util.logger(response);
                            
                            if(!Ext.isEmpty(response.request.timedout))
                                errMsg = 'Request timedout'
                            else if(response.status != 0)
                                errMsg = Ext.decode(response.responseText).error;

                            Ext.getBody().unmask();
                            failCallBack(failForm, "Login Failed!", errMsg);
                        }
                    });
                    
                }
                
                // succCallback();
                
            },
            failure: function(response, opts) {
                Util.logger('[INFO]:: server-side failure with status code ', response.status);
                Util.logger(response);
                
                if(!Ext.isEmpty(response.request.timedout))
                    errMsg = 'Request timedout'
                else if(response.status != 0)
                    errMsg = Ext.decode(response.responseText).error;

                Ext.getBody().unmask();
                failCallBack(failForm, "Login Failed!", errMsg);
            }
        });
        
    }*/
};

var Home = {
    createHomeMainPanel: function() {
        return new Ext.Panel({
            // hidden: true,
            scroll: 'vertical',
            fullscreen: true,
            id: 'home_screen_panel',
            html: [
                '<div class="home_page_text" style="padding-bottom: 60px">',
                '</div>'
            ]
        });
    }
};

var Install = {
    createInstallStep1Panel: function(searchCB, nextCB) {
        return {
        
        
            // fullscreen: true,
            hidden: false,
			id: 'install1_form_panel',
            items: [{
                xtype: 'fieldset',
                title: 'New Install - Step 1 of 3',
                id: 'install1_field',
                items: [{
                    xtype: 'textfield',
                    name: 'registration',
                    placeHolder: 'Enter Vehicle registration',
                    required: true,
                    useClearIcon: true,
                    hideOnMaskTap: true,
                    autoCapitalize : true,
                    id: 'enter_vehicle_reg_field'
                }]
/*
                items:[{
                    xtype: 'textfield',
                    name: 'install',
                    width: 650,
                    label: 'New Install - Step 1 of 3',
                    disabled: true,
                    id: 'install1_field'                    
                }]
*/
            }, {
	            xtype: 'fieldset',
	            items: [{
	                xtype: 'button',
	                ui: 'Normal',
	                text: 'Search',
	                name: 'search',
	                id: 'install1SearchButton',
	                flex: 1,
	                handler: searchCB
	            }]
			}, {
                xtype: 'fieldset',
                items: [{
                    xtype: 'textfield',
                    name: 'make',
                    placeHolder: 'Vehicle Make',
                    required: true,
                    useClearIcon: true,
                    hideOnMaskTap: true,
                    autoCapitalize : true,
                    id: 'vehicle_make_field'
                }, {
                    xtype: 'textfield',
                    name: 'model',
                    placeHolder: 'Vehicle Model',
                    required: true,
                    useClearIcon: true,
                    hideOnMaskTap: true,
                    autoCapitalize : true,
                    id: 'vehicle_model_field'
                }, {
                    xtype: 'textfield',
                    name: 'colour',
                    placeHolder: 'Vehicle Colour',
                    required: true,
                    useClearIcon: true,
                    hideOnMaskTap: true,
                    autoCapitalize : true,
                    id: 'vehicle_colour_field'
                }, {
                    xtype: 'textfield',
                    name: 'vin',
                    placeHolder: 'VIN',
                    required: true,
                    useClearIcon: true,
                    hideOnMaskTap: true,
                    autoCapitalize : true,
                    id: 'vehicle_vin_field'
                }]
            }, {
	            xtype: 'fieldset',
	            items: [{
	                xtype: 'button',
	                ui: 'Normal',
	                text: 'Next',
	                name: 'next',
	                id: 'install1NextButton',
	                flex: 1,
	                handler: nextCB
	            }]
			}]
        };
    },
    
    createInstallStep2Panel: function(nextCB) {
        return {
            fullscreen: true,
            hidden: true,
			id: 'install2_form_panel',
            items: [{
                xtype: 'fieldset',
                title: 'New Install - Step 2 of 3',
                id: 'install2_field',
                /*items:[{
                    xtype: 'textfield',
                    name: 'install',
                    width: 650,
                    label: 'New Install - Step 2 of 3',
                    disabled: true,
                    id: 'install2_field'
                }]
            }, {
                xtype: 'fieldset',*/
                items: [{
                    xtype: 'textfield',
                    name: 'imei',
                    placeHolder: 'Enter IMEI',
                    required: true,
                    useClearIcon: true,
                    hideOnMaskTap: true,
                    autoCapitalize : true,
                    id: 'enter_imei_field'
                }, {
                    xtype: 'textfield',
                    name: 'mileage',
                    placeHolder: 'Enter Vehicle Mileage',
                    required: true,
                    useClearIcon: true,
                    hideOnMaskTap: true,
                    autoCapitalize : true,
                    id: 'enter_vehicle_mil_field'
                }, {
                    xtype: 'textfield',
                    name: 'second_ref',
                    placeHolder: 'Enter 2nd Reference',
                    required: true,
                    useClearIcon: true,
                    hideOnMaskTap: true,
                    autoCapitalize : true,
                    id: 'enter_2nd_ref_field'
                }]
            }, 	{
	            xtype: 'fieldset',
	            items: [{
	                xtype: 'button',
	                ui: 'Normal',
	                text: 'Next',
	                name: 'next',
	                id: 'install2NextButton',
	                flex: 1,
	                handler: nextCB
	            }]
			}]
        };
    },
    
        /*items:[{
            xtype: 'textfield',
            name: 'install',
            width: 650,
            label: 'New Install - Step 3 of 3',
            disabled: true,
            id: 'install3_field'
        }]
    }, {
        xtype: 'fieldset',*/

	/*
					{
	                    xtype: 'checkboxfield',
	                    name: 'extension',

	                    label: 'Extension Lead Fitted to Unit & Vehicle OBD Port:',
	                    id: 'extension_lead_field'
	                }, {
	                    xtype: 'checkboxfield',
	                    name: 'telematics',

	                    label: 'Telematics Unit Located & Secured in Vehicle:',
	                    id: 'telematics_unit_field'
	                }, {
	                    xtype: 'checkboxfield',
	                    name: 'diagnostic',

	                    label: 'Diagnostic Flashing Light Sequence Confirmed:',
	                    id: 'diagnostic_flash_field'
	                }
	*/
	/*
					, {
	                    xtype: 'textareafield',
	                    name: 'notes',
	                    placeHolder: 'Notes',
	                    useClearIcon: true,
	                    hideOnMaskTap: true,
	                    autoCapitalize : true,
	                    id: 'notes_field'
	                }
	*/

    createInstallStep3Panel: function(refreshCB, submitCB) {
        return {
            fullscreen: true,
            hidden: true,
			id: 'install3_form_panel',
            items: [{
                xtype: 'fieldset',
                title: 'New Install - Step 3 of 3',
                id: 'install3_field',
			}, {
           	    xtype: 'fieldset',
	            items: [{
	                xtype: 'button',
	                ui: 'Normal',
	                text: 'Refresh',
	                name: 'Refresh',
	                id: 'install3RefreshButton',
	                flex: 1,
	                handler: refreshCB
				}]
			}, {
				xtype: 'fieldset',
	            items: [{
					xtype: 'textareafield',
                    name: 'install_refresh',
                    // placeHolder: 'Installation Completion Date/Time',
                    required: true,
                    useClearIcon: true,
                    hideOnMaskTap: true,
                    autoCapitalize : true,
                    id: 'install_refresh_field'
				}]
            }, {
                xtype: 'fieldset',
                items: [{
                    xtype: 'textareafield',
                    name: 'install_notes',
                    placeHolder: 'Installation Notes',
                    required: true,
                    useClearIcon: true,
                    hideOnMaskTap: true,
                    autoCapitalize : true,
                    id: 'install_notes_field'
                }, {
                    xtype: 'datepickerfield',
                    name: 'instal_comp_date',
                    placeHolder: 'Installation Completion Date',
                    required: true,
                    useClearIcon: true,
                    hideOnMaskTap: true,
                    autoCapitalize : true,
                    id: 'instal_comp_date_field'
                }, {
                    xtype: 'textfield',
                    name: 'installer_name',
                    placeHolder: 'Installer Name',
                    required: true,
                    useClearIcon: true,
                    hideOnMaskTap: true,
                    autoCapitalize : true,
                    id: 'installer_name_field'
                }]
            // }]
			}, {
	            xtype: 'fieldset',
	            items: [{
	                xtype: 'button',
	                ui: 'Normal',
	                text: 'Submit',
	                name: 'submit',
	                id: 'install3SubmitButton',
	                flex: 1,
	                handler: submitCB
	            }]
			// }]
			}]
        };
    }
    
};

var Deinstall = {
    createDeinstallMainPanel: function(submitCB) {
        return new Ext.form.FormPanel({
            // fullscreen: true,
            hidden: false,
			id: 'deinstall_form_panel',
            items: [{
                xtype: 'fieldset',
                title: 'De Install',
                id: 'deinstall_field',
                /*items:[{
                    xtype: 'textfield',
                    name: 'de_install',
                    label: 'De Install',
                    width: 650,
                    disabled: true,
                    id: 'deinstall_field'
                }]
            }, {
                xtype: 'fieldset',*/
                items: [{
                    xtype: 'textfield',
                    name: 'vehicle_reg',
                    placeHolder: 'Vehicle registration',
                    required: true,
                    useClearIcon: true,
                    hideOnMaskTap: true,
                    autoCapitalize : true,
                    id: 'vehicle_reg_field'
                }, {
                    xtype: 'textfield',
                    name: 'imei',
                    placeHolder: 'IMEI',
                    required: true,
                    useClearIcon: true,
                    hideOnMaskTap: true,
                    autoCapitalize : true,
                    id: 'imei_field'
                }, {
                    xtype: 'checkboxfield',
                    name: 'replace_unit',
                    label: 'Replacement Unit fitter:',
                    id: 'replace_unit_field'
                }]
            }, {
	            xtype: 'fieldset',
	            items: [{
	                xtype: 'button',
	                ui: 'Normal',
	                text: 'Submit',
	                name: 'submit',
	                id: 'deinstallSubmitButton',
	                flex: 1,
	                handler: submitCB
	            }]
	        }]
        });
    }
};

var Search = {
    createSearchMainPanel: function(searchCB) {
        return new Ext.form.FormPanel({
            // fullscreen: true,
            hidden: false,
			id: 'search_form_panel',
            items: [{
                xtype: 'fieldset',
                title: 'New Install',
                id: 'new_install_field',
                /*items:[{
                    xtype: 'textfield',
                    name: 'new_install',
                    label: 'New Install',
                    width: 650,
                    disabled: true,
                    id: 'new_install_field'
                }]
            }, {
                xtype: 'fieldset',*/
                items: [{
                    xtype: 'textfield',
                    name: 'search_reg',
                    placeHolder: 'Search by registration',
                    required: true,
                    useClearIcon: true,
                    hideOnMaskTap: true,
                    autoCapitalize : true,
                    id: 'search_reg_field'
                }, {
                    xtype: 'textfield',
                    name: 'search_imei',
                    placeHolder: 'Search by IMEI',
                    required: true,
                    useClearIcon: true,
                    hideOnMaskTap: true,
                    autoCapitalize : true,
                    id: 'search_imei_field'
				}, {
                    xtype: 'textfield',
                    name: 'search_2ndref',
                    placeHolder: 'Search by 2nd Ref',
                    required: true,
                    useClearIcon: true,
                    hideOnMaskTap: true,
                    autoCapitalize : true,
                    id: 'search_2ndref_field'
                }]
            }, {
	            xtype: 'fieldset',
	            items: [{
	                xtype: 'button',
	                ui: 'Normal',
	                text: 'Search',
	                name: 'search',
	                id: 'searchSubmitButton',
	                flex: 1,
	                handler: searchCB
	            }]
	        }]
        });
    },

    getListBase: function(resultsTpl, resultsData, itemtapCB) {
        return {
            itemTpl: resultsTpl,
            layout: 'fit',
            hidden: true,
            selModel: {
                mode: 'SINGLE',
                allowDeselect: true
            },
            // grouped: true,
/*            onItemDisclosure: {
                scope: 'test',
                handler: itemDisclosureCB
            },
            indexBar: true,
*/          
            emptyText: '<p class="emptyResultMessage"><strong>You have no search results</strong></p>',
            grouped: true,
            store: Search.getResultsListStore(resultsData),
            fullscreen: true,
            scroll: 'vertical',
            listeners: {
                itemtap: itemtapCB
            }
        };
    },

    getResultsListStore: function(results) {
        return new Ext.data.Store({
            model: 'Vehicles',
            sorters: [{   
                //match it with the model method: Person.load_more argument: order
                property : 'registration',
                direction: 'DESC'
            }],
			/*
            getGroupString : function(record) {
                return Ext.util.Format.date(record.get('posted_at'), 'F Y');//record.get('occurs_at').format('F Y');
            },
			*/
            data: [results]
        });
    }
};

var Help = {
    createHelpMainPanel: function() {
        return new Ext.Panel({
            // hidden: true,
            scroll: 'vertical',
            fullscreen: true,
            id: 'help_panel',
            html: [
                '<div class="help_page_text">',
                    '<p><strong>Q: Lorem ipsum dolor sit amet, consectetur adipiscing elit adipiscing elit</strong></p>',
                    '<p>A: Nam rhoncus euismod blandit. Fusce imperdie</p>',
                '</div>'
            ]
        });
    }
};

var Util = function() {
    /* 
    Public/private access sorted using Revealing Module Pattern 
    http://www.wait-till-i.com/2007/08/22/again-with-the-module-pattern-reveal-something-to-the-world/
    */
    /* Public pointers to private functions */
    return {
        logger: logger,
        getItemState: getItemState,
        getItemsSize: getItemsSize,
        cacheItemLocally: cacheItemLocally,
        searchVehicleRemotely: searchVehicleRemotely,
		findVehicleRemotely: findVehicleRemotely,
		saveVehicleInfoRemotely: saveVehicleInfoRemotely,
		assignVehicleRemotely: assignVehicleRemotely,
		deinstallVehicleRemotely: deinstallVehicleRemotely
    };
    
    function logger(txt, obj) {
        // if(Environment.debug()) {
            if(Ext.isEmpty(obj))
                console.log(txt);
            else {
                if(Ext.is.Phone) { /*
                    if(Ext.isObject(obj)) {
                        console.log(txt);
                        console.log(obj);
                    } else */
                        console.log(txt + obj);
                } else
                    console.log(txt, obj);
            }
        // }
    };
    
    /*
    This method reads the current persistence state and the action performed on the item
        and returns the resulting persistence state
    current_state refers to the current persistence state of the item, which can be
        'select', 'insert', 'update' or 'delete'
    action refers to the 'new', 'edit', 'delete' or 'toggle' action performed on the item
    */
    function getItemState(current_state, action) {
        var resultant_state = action;
        if(current_state == 'insert') {
            resultant_state = 'insert';
            //if(action == 'delete') is managed outside this function
        } else if(current_state == 'update') {
            if(action != 'delete')
                resultant_state = 'update';
        } else if(current_state == 'delete') {
            resultant_state = current_state;
        }
        
        return resultant_state;
    };
    
    function getItemsSize() {
        Util.logger('Util.getItemsSize called');
        var size = 0;
        // var user_id = Api.getLocalStorageProp('user_id');
        var key = 'vehicle',
            size = 0;
        for(var i = 0, len = localStorage.length; i < len; i++) {
            if(localStorage.key(i).indexOf(key) != -1)
                size++;
        }

        Util.logger('size is: ', size);
        return size;
    };
    
    function cacheItemLocally(entity, item, index) {
        /*
        var user_id = Api.getLocalStorageProp('user_id');
        if(Ext.isEmpty(user_id)) {
            Util.logger('[WARN]:: Util.cacheItemLocally() => user_id is invalid: ', user_id);
            return;
        }
        */
        if(Ext.isEmpty(item)) {
            Util.logger('[INFO]:: In cacheItemLocally() => item is empty!');
            return;
        }
        
        //To remove a residual account_key param attached to the item in JSON
        Util.logger('newItem before saving:::', JSON.stringify(item));

        localStorage[entity+'['+index+']'] = Ext.encode(item);
        Util.logger('Item saved locally!');
        
    };

	function findVehicleRemotely(vehicle, action, callBack) {
	    Util.logger('In findVehicleRemotely()');
        
		// SOAPClient.username = uname;
		// SOAPClient.password = pswd;
		var retVehicleObj = new Object();
		var account_key = Api.getLocalStorageProp('account_key');
		Util.logger('account_key is:', account_key);
        
		if(!Ext.isEmpty(account_key)) {
			
			SOAPClient.session_cookie = account_key;
           	Util.logger('registration is:', vehicle.registration);
           	// Util.logger('imei is:', vehicle.imei);
			
			var params = new SOAPClientParameters();
			params.add("VehicleRegistration", vehicle.registration);
			// params.add("imei", vehicle.imei);
			Ext.getBody().mask('Authenticating...', 'x-mask-loading', false);
			// GetInstallationLogByVehicleRegistration
			var resp = SOAPClient.invoke(apiDomain, "GetVehicleInformation", params, true, function(res1, res2) {
	           	Util.logger('SOAP response is:', res1);
	           	Util.logger('SOAP response2 is:', res2);

				retVehicleObj.registration = res1.VehicleRegistration;
				retVehicleObj.make = res1.DvlaMake;
				retVehicleObj.model = res1.DvlaModel;
				retVehicleObj.colour = res1.DvlaColour;
				retVehicleObj.vin = res1.DvlaVin;
				// SOAPClient.username = uname;
				// SOAPClient.password = pswd;
				// if(SOAPClient.session_cookie)
					// Api.setLocalStorageProp('account_key', SOAPClient.session_cookie);

				callBack(retVehicleObj);
				
				Ext.getBody().unmask();

				// succCallback();

			});
		}
	};
	
	function saveVehicleInfoRemotely(vehicle, action, callBack) {
	    Util.logger('In saveVehicleInfoRemotely()');
        
		// SOAPClient.username = uname;
		// SOAPClient.password = pswd;
		var resp, params, retVehicleObj = new Object();
		var account_key = Api.getLocalStorageProp('account_key');
		Util.logger('account_key is:', account_key);
        
		if(!Ext.isEmpty(account_key)) {
			
			SOAPClient.session_cookie = account_key;
           	Util.logger('make is:', vehicle.make);
           	Util.logger('model is:', vehicle.model);
           	Util.logger('colour is:', vehicle.colour);
           	Util.logger('vin is:', vehicle.vin);
           	// Util.logger('imei is:', vehicle.imei);
			
			params = new SOAPClientParameters();
			params.add("registration", vehicle.registration);
			params.add("make", vehicle.make);
			params.add("model", vehicle.model);
			params.add("colour", vehicle.colour);
			params.add("vin", vehicle.vin);
			// params.add("imei", vehicle.imei);
			Ext.getBody().mask('Authenticating...', 'x-mask-loading', false);
			// GetInstallationLogByVehicleRegistration
			resp = SOAPClient.invoke(apiDomain, "saveVehicleInformation", params, true, function(res1, res2) {
	           	Util.logger('SOAP response is:', res1);
	           	Util.logger('SOAP response2 is:', res2);

				retVehicleObj.registration = res1.VehicleRegistration;
				retVehicleObj.make = res1.DvlaMake;
				retVehicleObj.model = res1.DvlaModel;
				retVehicleObj.colour = res1.DvlaColour;
				retVehicleObj.vin = res1.DvlaVin;

				params = new SOAPClientParameters();
				params.add("vehicleRegistration", vehicle.registration);

				// Ext.getBody().mask('Authenticating...', 'x-mask-loading', false);
				resp = SOAPClient.invoke(apiDomain, "GetInstallationLogByVehicleRegistration", params, true, function(resp1, resp2) {
		           Util.logger('SOAP again response is:', resp1);
		           Util.logger('SOAP again response2 is:', resp2);

					// retVehicleObj.registration = resp1.VehicleRegistration;
					// retVehicleObj.make = resp1.DvlaMake;
					// retVehicleObj.model = resp1.DvlaModel;
					// retVehicleObj.colour = resp1.DvlaColour;
					// retVehicleObj.vin = resp1.DvlaVin;
					retVehicleObj.imei = resp1.Imei;
					retVehicleObj.second_ref = resp1.secondReference;
					retVehicleObj.mileage = resp1.InitialMileage;

					Ext.getBody().unmask();

					callBack(retVehicleObj);

				});

				// Ext.getBody().unmask();

				// callBack(retVehicleObj);
				
				// succCallback();

			});
		}
	};
	
	function assignVehicleRemotely(vehicle, action, callBack) {
	    Util.logger('In assignVehicleRemotely()');
        
		var retVehicleObj = new Object();
		
		// SOAPClient.username = uname;
		// SOAPClient.password = pswd;
		var account_key = Api.getLocalStorageProp('account_key');
		Util.logger('account_key is:', account_key);
        
		if(!Ext.isEmpty(account_key)) {
			
			SOAPClient.session_cookie = account_key;
           	Util.logger('registration is:', vehicle.registration);
           	Util.logger('imei is:', vehicle.imei);
			
			var params = new SOAPClientParameters();
			params.add("VehicleRegistration", vehicle.registration);
			params.add("IMEI", vehicle.imei);
			params.add("mileage", vehicle.mileage);
			params.add("secondref", vehicle.second_ref);

			Ext.getBody().mask('Authenticating...', 'x-mask-loading', false);
			var resp = SOAPClient.invoke(apiDomain, "AssignIMEIToRegistration", params, true, function(res1, res2) {
	            Util.logger('SOAP response is:', res1);
	            Util.logger('SOAP response2 is:', res2);
/*
				retVehicleObj.registration = res1.VehicleRegistration;
				retVehicleObj.make = res1.DvlaMake;
				retVehicleObj.model = res1.DvlaModel;
				retVehicleObj.colour = res1.DvlaColour;
				retVehicleObj.vin = res1.DvlaVin;
*/				
				// SOAPClient.username = uname;
				// SOAPClient.password = pswd;
				// if(SOAPClient.session_cookie)
					// Api.setLocalStorageProp('account_key', SOAPClient.session_cookie);
				/*
				params = new SOAPClientParameters();
				params.add("VehicleRegistration", "sdfds3243");
				SOAPClient.invoke(apiDomain, "GetVehicleInformation", params, true, function(r1, r22) {
					Util.logger('SOAP response is:', r1);
		            Util.logger('SOAP response2 is:', r22);

		           });

				*/
				Ext.getBody().unmask();

				callBack(retVehicleObj);
				// succCallback();

			});
		}
	};
    
    function searchVehicleRemotely(vehicleRegVal, imeiVal, _2ndRefVal, callBack) {
		var remoteMethod, retVehicleObj = new Object();

		// SOAPClient.username = uname;
		// SOAPClient.password = pswd;
		var account_key = Api.getLocalStorageProp('account_key');
		Util.logger('account_key is:', account_key);

		if(!Ext.isEmpty(account_key)) {

			SOAPClient.session_cookie = account_key;
           	Util.logger('registration is:', vehicleRegVal);
           	Util.logger('imei is:', imeiVal);
           	Util.logger('2ndRef is:', _2ndRefVal);

			var params = new SOAPClientParameters();
	        if(!Ext.isEmpty(vehicleRegVal)) {
				params.add("vehicleRegistration", vehicleRegVal);
				remoteMethod = "GetInstallationLogByVehicleRegistration";
			} else if(!Ext.isEmpty(imeiVal)) {
				params.add("imei", imeiVal);
				remoteMethod = "GetInstallationLogByIMEI";
			} else {
				params.add("secondReference", _2ndRefVal);
				remoteMethod = "GetInstallationLogBySecondReference";					
			}


			Ext.getBody().mask('Authenticating...', 'x-mask-loading', false);
			var resp = SOAPClient.invoke(apiDomain, remoteMethod, params, true, function(res1, res2) {
	           Util.logger('SOAP response is:', res1);
	           Util.logger('SOAP response2 is:', res2);

				retVehicleObj.registration = res1.VehicleRegistration;
				retVehicleObj.make = res1.DvlaMake;
				retVehicleObj.model = res1.DvlaModel;
				retVehicleObj.colour = res1.DvlaColour;
				retVehicleObj.vin = res1.DvlaVin;
				retVehicleObj.imei = res1.Imei;
				retVehicleObj.second_ref = res1.secondReference;
				retVehicleObj.mileage = res1.InitialMileage;

				Ext.getBody().unmask();

				callBack(retVehicleObj);

			});
		}
        // return null;
    };

		function deinstallVehicleRemotely(registration, imei, isReplacementUnit, callBack) {
		    Util.logger('In deinstallVehicleRemotely()');

			var retVehicleObj = new Object();

			// SOAPClient.username = uname;
			// SOAPClient.password = pswd;
			var account_key = Api.getLocalStorageProp('account_key');
			Util.logger('account_key is:', account_key);

			if(!Ext.isEmpty(account_key)) {

				SOAPClient.session_cookie = account_key;
	           	Util.logger('registration is:', registration);
	           	Util.logger('imei is:', imei);
	           	Util.logger('replacementUnit is:', isReplacementUnit);

				var params = new SOAPClientParameters();
				params.add("vehicleRegistration", registration);
				params.add("imei", imei);
				params.add("replacementFitted", isReplacementUnit);

				Ext.getBody().mask('Authenticating...', 'x-mask-loading', false);
				var resp = SOAPClient.invoke(apiDomain, "DeInstall", params, true, function(res1, res2) {
		            Util.logger('SOAP response is:', res1);
		            Util.logger('SOAP response2 is:', res2);
	/*
					retVehicleObj.registration = res1.VehicleRegistration;
					retVehicleObj.make = res1.DvlaMake;
					retVehicleObj.model = res1.DvlaModel;
					retVehicleObj.colour = res1.DvlaColour;
					retVehicleObj.vin = res1.DvlaVin;
	*/				
					// SOAPClient.username = uname;
					// SOAPClient.password = pswd;
					// if(SOAPClient.session_cookie)
						// Api.setLocalStorageProp('account_key', SOAPClient.session_cookie);
					/*
					params = new SOAPClientParameters();
					params.add("VehicleRegistration", "sdfds3243");
					SOAPClient.invoke(apiDomain, "GetVehicleInformation", params, true, function(r1, r22) {
						Util.logger('SOAP response is:', r1);
			            Util.logger('SOAP response2 is:', r22);

			           });

					*/
					Ext.getBody().unmask();

					callBack(retVehicleObj);
					// succCallback();

				});
			}
		};


	
}();