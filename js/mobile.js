// var apiDomain = Environment.baseApiUrl();

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
    }
};

var User = {
    getLoginFormBase: function(loginCB, signupCB) {
        return {
            fullscreen: true,
            standardSubmit: false,
            cls: 'auth_panel',
            items: [{
                xtype: 'fieldset',
                defaults: {
                    required: true, // KL - has no visual effect as we use a placeHolder for the label
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
                }, {
                    xtype: 'passwordfield',
                    name: 'password2',
                    placeHolder: 'Re-type Password',
                    hidden: true,
                    id: 'loginPasswordField2'
                }]
            }, 
            {
                xtype: 'fieldset',
                items: [{
                    xtype: 'button',
                    id: 'loginButton',
                    ui: 'action',
                    text: 'Login',
                    handler: loginCB
                }, {
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
                }]
            }],
            listeners: {
                // KL - this is to handle the "Go" button on the iPhone keyboard, bit hacky can't find another way to do it
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

        Api.setLocalStorageProp('login', email);
        Api.setLocalStorageProp('user_id', '1');
        
        succCallback();
        
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
    
    signup: function(email, password, failForm, succCallback, failCallBack) {
        var errMsg = "Device Offline or Server not responding!";
        var signup_key = '';
        /*
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
        */
    }
};

var Home = {
    createHomeMainPanel: function() {
        return new Ext.Panel({
            // hidden: true,
            scroll: 'vertical',
            fullscreen: true,
            id: 'home_screen_html',
            html: [
                '<div class="settings_page_text" style="padding-bottom: 60px">',
                    '<h1>onboard</h1>',
                    '<p>in-car cleverness</p>',
                    '<p><strong>Welcome to the OnBoard Fitters App</strong></p>',
                '</div>'
            ]
        });
    }
};

var Install = {
    createInstallStep1Panel: function(nextCB) {
        return new Ext.form.FormPanel({
            // fullscreen: true,
            hidden: false,
            items: [{
                xtype: 'fieldset',
                items:[{
                    xtype: 'textfield',
                    name: 'install',
                    width: 650,
                    label: 'New Install - Step 1 of 3',
                    disabled: true,
                    id: 'install1_field'                    
                }]
            }, {
                xtype: 'fieldset',
                items: [{
                    xtype: 'textfield',
                    name: 'enter_vehicle_reg',
                    placeHolder: 'Enter Vehicle registration',
                    required: true,
                    useClearIcon: true,
                    hideOnMaskTap: true,
                    autoCapitalize : true,
                    id: 'enter_vehicle_reg_field'
                }]
            }, {
                xtype: 'fieldset',
                items: [{
                    xtype: 'textfield',
                    name: 'vehicle_make',
                    placeHolder: 'Vehicle Make',
                    required: true,
                    useClearIcon: true,
                    hideOnMaskTap: true,
                    autoCapitalize : true,
                    id: 'vehicle_make_field'
                }, {
                    xtype: 'textfield',
                    name: 'vehicle_model',
                    placeHolder: 'Vehicle Model',
                    required: true,
                    useClearIcon: true,
                    hideOnMaskTap: true,
                    autoCapitalize : true,
                    id: 'vehicle_model_field'
                }, {
                    xtype: 'textfield',
                    name: 'vehicle_colour',
                    placeHolder: 'Vehicle Colour',
                    required: true,
                    useClearIcon: true,
                    hideOnMaskTap: true,
                    autoCapitalize : true,
                    id: 'vehicle_colour_field'
                },{
                    // xtype: 'fieldset',
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
            }]
        });
    },
    
    createInstallStep2Panel: function(nextCB) {
        return new Ext.form.FormPanel({
            fullscreen: true,
            hidden: true,
            items: [{
                xtype: 'fieldset',
                items:[{
                    xtype: 'textfield',
                    name: 'install',
                    width: 650,
                    label: 'New Install - Step 2 of 3',
                    disabled: true,
                    id: 'install2_field'
                }]
            }, {
                xtype: 'fieldset',
                items: [{
                    xtype: 'textfield',
                    name: 'enter_imei',
                    placeHolder: 'Enter IMEI',
                    required: true,
                    useClearIcon: true,
                    hideOnMaskTap: true,
                    autoCapitalize : true,
                    id: 'enter_imei_field'
                }, {
                    xtype: 'textfield',
                    name: 'enter_vehicle_mil',
                    placeHolder: 'Enter Vehicle Mileage',
                    required: true,
                    useClearIcon: true,
                    hideOnMaskTap: true,
                    autoCapitalize : true,
                    id: 'enter_vehicle_mil_field'
                }, {
                    xtype: 'textfield',
                    name: 'enter_2nd_ref',
                    placeHolder: 'Enter 2nd Reference',
                    required: true,
                    useClearIcon: true,
                    hideOnMaskTap: true,
                    autoCapitalize : true,
                    id: 'enter_2nd_ref_field'
                }, {
                    // xtype: 'fieldset',
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
            }]
        });
    },
    
    createInstallStep3Panel: function() {
        return new Ext.form.FormPanel({
            fullscreen: true,
            hidden: true,
            items: [{
                xtype: 'fieldset',
                items:[{
                    xtype: 'textfield',
                    name: 'install',
                    width: 650,
                    label: 'New Install - Step 3 of 3',
                    disabled: true,
                    id: 'install3_field'
                }]
            }, {
                xtype: 'fieldset',
                items: [{
                    xtype: 'checkboxfield',
                    name: 'extension_lead',
                    width: 620,
                    label: 'Extension Lead Fitted to Unit & Vehicle OBD Port:',
                    id: 'extension_lead_field'
                }, {
                    xtype: 'checkboxfield',
                    name: 'telematics_unit',
                    width: 620,
                    label: 'Telematics Unit Located & Secured in Vehicle:',
                    id: 'telematics_unit_field'
                }, {
                    xtype: 'checkboxfield',
                    name: 'diagnostic_flash',
                    width: 620,
                    label: 'Diagnostic Flashing Light Sequence Confirmed:',
                    id: 'diagnostic_flash_field'
                }]
            }, {
                xtype: 'fieldset',
                items: [{
                    xtype: 'textfield',
                    name: 'install_comp',
                    placeHolder: 'Installation Completion Date/Time',
                    required: true,
                    useClearIcon: true,
                    hideOnMaskTap: true,
                    autoCapitalize : true,
                    id: 'install_comp_field'
                }, {
                    xtype: 'textfield',
                    name: 'installer_name',
                    placeHolder: 'Installer Name',
                    required: true,
                    useClearIcon: true,
                    hideOnMaskTap: true,
                    autoCapitalize : true,
                    id: 'installer_name_field'
                }, {
                    xtype: 'textfield',
                    name: 'cust_rep_name',
                    placeHolder: 'Customer/Representative Name',
                    required: true,
                    useClearIcon: true,
                    hideOnMaskTap: true,
                    autoCapitalize : true,
                    id: 'cust_rep_name_field'
                }, {
                    xtype: 'textareafield',
                    name: 'notes',
                    placeHolder: 'Notes',
                    useClearIcon: true,
                    hideOnMaskTap: true,
                    autoCapitalize : true,
                    id: 'notes_field'
                }, {
                    // xtype: 'fieldset',
                    items: [{
                        xtype: 'button',
                        ui: 'Normal',
                        text: 'Submit',
                        name: 'submit',
                        id: 'install3SubmitButton',
                        flex: 1,
                        handler: Ext.emptyFn
                    }]
                }]
            }]
        });
    }
    
};

var Deinstall = {
    createDeinstallMainPanel: function() {
        return new Ext.form.FormPanel({
            // fullscreen: true,
            hidden: false,
            items: [{
                xtype: 'fieldset',
                items:[{
                    xtype: 'textfield',
                    name: 'de_install',
                    label: 'De Install',
                    width: 650,
                    disabled: true,
                    id: 'deinstall_field'
                }]
            }, {
                xtype: 'fieldset',
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
                },{
                    // xtype: 'fieldset',
                    items: [{
                        xtype: 'button',
                        ui: 'Normal',
                        text: 'Submit',
                        name: 'submit',
                        id: 'deinstallSubmitButton',
                        flex: 1,
                        handler: Ext.emtpyFn
                    }]
                }]
            }]
        });
    }
};

var Search = {
    createSearchMainPanel: function() {
        return new Ext.form.FormPanel({
            // fullscreen: true,
            hidden: false,
            items: [/*{
                xtype: 'fieldset',
                defaults: {
                    labelWidth: ''
                }, */
                /*{   
                    cls: 'external_links',
                    html: [
                        '<div class="settings_page_text"">',
                        '<h1>onboard</h1>',
                        '<p>in-car cleverness</p>',
                        '<p><strong>New Install</strong></p>',
                        '</div>'
                    ]
                }*/
            {
                xtype: 'fieldset',
                items:[{
                    xtype: 'textfield',
                    name: 'new_install',
                    label: 'New Install',
                    width: 650,
                    disabled: true,
                    id: 'new_install_field'
                }]
            }, {
                xtype: 'fieldset',
                items: [{
                    xtype: 'textfield',
                    name: 'title',
                    placeHolder: 'Search by IMEI or registration number',
                    required: true,
                    useClearIcon: true,
                    hideOnMaskTap: true,
                    autoCapitalize : true,
                    id: 'search_field'
                }, {
                    // xtype: 'fieldset',
                    items: [{
                        xtype: 'button',
                        ui: 'Normal',
                        text: 'Submit',
                        name: 'submit',
                        id: 'searchSubmitButton',
                        flex: 1,
                        handler: Ext.emtpyFn
                    }]
                }]
            }]
        });
    }
};

var Help = {
    createHelpMainPanel: function() {
        return new Ext.Panel({
            // hidden: true,
            scroll: 'vertical',
            fullscreen: true,
            id: 'help_html',
            html: [
                '<div class="settings_page_text" style="padding-bottom: 60px">',
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
        logger: logger
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
    
}();