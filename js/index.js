Ext.setup({
    
    tabletStartupScreen: 'rsc/phone_startup.svg',
    phoneStartupScreen: 'rsc/phone_startup.svg',
    icon: 'rsc/icon.png',
    glossOnIcon: false,
    
    onReady: function() {
        var form, loginFormBase;
        BottomTabsInline = '';
        
        Util.logger('Abt to register deviceready event!');
        // if(Ext.is.Android)
        document.addEventListener("deviceready", onDeviceReady, false);
        
        // Api.clearLocalStorage();

        Init.initState();

        loginHandlerCB = function(ele, eve) {
            Util.logger('Login button handler called!');
            
            handleLoginSignup(Ext.emptyFn, User.login);
        };
        
        signupHandlerCB = function(ele, eve) {
            Util.logger('Signup button handler called!');
            
            handleLoginSignup(errorsHandlerCB, User.signup);
        };
        
        handleLoginSignup = function(errorsHandlerCB, userCB) {
            Api.clearLocalStorage();
            Init.initState();
            
            var displayPanelCB,
                model = Ext.ModelMgr.create(form.getValues(), 'User'),
                message = "", errors = model.validate();
            
            if(Ext.isEmpty(BottomTabsInline)) {
                displayPanelCB = renderAllWithDataCB;
            } 
            /*else {
                displayPanelCB = updatePanelWithDataCB;
            }*/
        
            passwordField2 = Ext.get('loginPasswordField');
            passwordField2.down('input').dom.focus();
            passwordField2.down('input').dom.blur();
            
            errors = (errorsHandlerCB != Ext.emptyFn) ? errorsHandlerCB(model, errors) : errors;
            /*
            if(model.get('password') != model.get('password2')) {
                var error = {field: 'password2', message: 'Passwords mismatch'};
                errors.add("password2", error);
            }
            */
            if(errors.isValid()) {
                
                if(loginFormBase.user) {
                    form.updateRecord(loginFormBase.user, true);
                }
                Util.logger('username is:', loginFormBase.user.get('username'));
                userCB(loginFormBase.user.get('username'), loginFormBase.user.get('password'), form, displayPanelCB, formFailedCB);
                
                //SIM - forces the soft keyboard to hide for Android devices using Phonegap mechanism 
                //http://wiki.phonegap.com/w/page/27915465/How-to-show-and-hide-soft-keyboard-in-Android
                if(Ext.is.Android)
                    window.KeyBoard.hideKeyBoard();
                
                form.hide();
            } else {
                Ext.each(errors.items, function(rec, i) {
                    message += '<p class="loginErrorMsg">'+rec.message+'</p>';
                });
                Ext.Msg.alert("Oops!", message, Ext.emptyFn);
            }
            return false;
        };
        
        errorsHandlerCB = function(model, errors) {
            if(model.get('password') != model.get('password2')) {
                var error = {field: 'password2', message: 'Passwords mismatch'};
                errors.add("password2", error);
            }
            return errors;
        };
        
        // KL - http://www.sencha.com/forum/showthread.php?112719-Best-practice-for-form-validation&highlight=textfield
        Ext.regModel('User', { 
            fields: [
                {name: 'username', type: 'string'},
                {name: 'password', type: 'string'}
                // ,{name: 'password2', type: 'string'}
            ],
            validations: [
                {type: 'presence', name: 'username', message: "Email is required"},
                {type: 'presence', name: 'password', message: "Password is required"}
                // ,{type: 'format',   name: 'username', matcher: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/, message:"Wrong Email Format"}
            ]
        });

        registerLoginHandler = function() {
            loginFormBase = User.getLoginFormBase(loginHandlerCB, signupHandlerCB);

            loginFormBase.user = Ext.ModelMgr.create({ username: '', password: ''}, 'User');
        };
        
        requestFailedCB = function(alert, msg) {
            Ext.Msg.alert(alert, msg, Ext.emptyFn);
            // return false;
        };
        
        formFailedCB = function(form, alert, msg) {
            Ext.Msg.alert(alert, msg, Ext.emptyFn);
            form.show();
            return false;
        };

        renderAllComp = function() {
            Util.logger('renderAllComp() called');
            
            var homePanel, vehicles = [];
            
            panelIndex = {home: 0, install: 1, deinstall: 2, search: 3, help: 4};
            
            // events = [], tasks = [];
            
            Ext.apply(Ext.util.Format, {
            	defaultDateFormat: 'j-M-Y'
            });

            //__HOME panels layout start==================================================================================
            
            homeNavBar = new Ext.Toolbar({
                ui: 'dark',
                dock: 'top',
                title: 'OnBoard Fitters'
            });

            homeMainPanel = Home.createHomeMainPanel();
            
            homePanel = new Ext.Panel({
                title: 'Home',
                id: 'tab'+panelIndex.home+1,
                cls: 'card' + (panelIndex.home+1) + ' home_panel',
                iconCls: 'home',
                // layout: 'card',
                items: [ homeMainPanel ],
                dockedItems: [ homeNavBar ]
            });
            
            
            //__HOME panels layout end==================================================================================
            
            Ext.regModel('Vehicle', { 
                fields: [
                    {name: 'id', type: 'int'},
                    {name: 'registration', type: 'string'},
                    {name: 'make', type: 'string'},
                    {name: 'model', type: 'string'},
                    {name: 'colour', type: 'string'},
                    {name: 'vin', type: 'string'},
                    {name: 'imei', type: 'string'},
                    {name: 'mileage', type: 'string'},
                    {name: 'second_ref', type: 'string'},
                    {name: 'install_completion', type: 'date'},
                    {name: 'installer_name', type: 'string'},
                    {name: 'notes', type: 'string'},
                    {name: 'vehicle_id', type: 'int'},
                    {name: 'cl_state', type: 'string'},
                    {name: 'action', type: 'string'}
                ]
            });


            Ext.regModel('Vehicle1', { 
                fields: [
                    {name: 'id', type: 'int'},
                    {name: 'registration', type: 'string'},
                    {name: 'make', type: 'string'},
                    {name: 'model', type: 'string'},
                    {name: 'colour', type: 'string'},
                    {name: 'vin', type: 'string'},
                    {name: 'vehicle_id', type: 'int'},
                    {name: 'cl_state', type: 'string'},
                    // {name: 'client_uid', type: 'string'},
                    {name: 'action', type: 'string'}
                ],
                validations: [
                    {type: 'presence', name: 'registration', message: "Registration is required"}
                    // ,{type: 'presenceDueDate', name: 'remind_before'}
                ]
            });

            Ext.regModel('Vehicle2', { 
                fields: [
                    {name: 'id', type: 'int'},
                    {name: 'imei', type: 'string'},
                    {name: 'mileage', type: 'string'},
                    {name: 'second_ref', type: 'string'},
                    {name: 'vehicle_id', type: 'int'},
                    {name: 'cl_state', type: 'string'},
                    // {name: 'client_uid', type: 'string'},
                    {name: 'action', type: 'string'}
                ]
            });
            
            Ext.regModel('Vehicle3', { 
                fields: [
                    {name: 'id', type: 'int'},
/*
                    {name: 'extension', type: 'boolean'},
                    {name: 'telematics', type: 'boolean'},
                    {name: 'diagnostic', type: 'boolean'},
*/
                    {name: 'install_completion', type: 'date'},
                    {name: 'installer_name', type: 'string'},
                    // {name: 'rep_name', type: 'string'},
                    {name: 'notes', type: 'string'},
                    {name: 'vehicle_id', type: 'int'},
                    {name: 'cl_state', type: 'string'},
                    // {name: 'client_uid', type: 'string'},
                    {name: 'action', type: 'string'}
                ]
            });
            
            installBackBtn = new Ext.Button(Api.getButtonBase('Back', true, 'install_back', onBackInstallBtnTap));
            
            installNavBar = new Ext.Toolbar({
                ui: 'dark',
                dock: 'top',
                title: 'OnBoard Fitters',
                items: [installBackBtn]
            });

            installStep1FormBase = Install.createInstallStep1Panel(onSearchStep1InstallBtnTapCB, onNextStep1InstallBtnTapCB);
            installStep1Panel = new Ext.form.FormPanel(installStep1FormBase);
            installStep2FormBase = Install.createInstallStep2Panel(onNextStep2InstallBtnTapCB);
            installStep2Panel = new Ext.form.FormPanel(installStep2FormBase);
            installStep3FormBase = Install.createInstallStep3Panel(onRefreshStep3InstallBtnTapCB, onSubmitStep3InstallBtnTapCB);
            installStep3Panel = new Ext.form.FormPanel(installStep3FormBase);

            var vehicleTpl = new Ext.XTemplate(
                '<div class="vehicle_page_text">',
                    '<p>registration: {registration}</p>',
                    '<p>make: {make}</p>',
                    '<p>model: {model}</p>',
                    '<p>imei: {imei}</p>',
                '</div>', 
                {
                    isEmpty: function(c) {
                        return Ext.isEmpty(c);
                    },
                });

	        var resultsTpl = new Ext.XTemplate(
                '<div class="resultsMain">',
                    '<div class="results_list_item registration">registration</div>', 
					'<div class="results_list_item imei">imei</div>', 
					'<div class="results_list_item make">make</div>', 
					'<div class="results_list_item model">model</div>', 
                '</div>', 
                '<p class="installed_time">{installed_time:date("j/n/y G:i:s")}</p>', 
	            {
	                hasTitle: function(c) {
	                    return !Ext.isEmpty(c);
	                }
	            });

            showVehiclePanel = new Ext.Panel({
                // scroll: 'vertical',
                fullscreen: true,
                hidden: true,
                id: 'show_vehicle_panel',
                tpl: vehicleTpl/*
                html: [
                    '<div class="settings_page_text" style="padding-bottom: 60px">',
                        '<p>registration: {registration}</p>',
                        '<p>make: {make}</p>',
                        '<p>model: {model}</p>',
                        '<p>imei: {imei}</p>',
                    '</div>'
                ]*/
            });
            
            resetVehicleFormPanel();
            
            installPanel = new Ext.Panel({
                title: 'Install',
                id: 'tab'+panelIndex.install+1,
                cls: 'card' + (panelIndex.install+1) + ' install_panel',
                iconCls: 'install',
                // layout: 'card',
                items: [ installStep1Panel, installStep2Panel, installStep3Panel, showVehiclePanel ],
                dockedItems: [ installNavBar ]
            });
            
            deinstallNavBar = new Ext.Toolbar({
                ui: 'dark',
                dock: 'top',
                title: 'OnBoard Fitters'
            });

            deinstallMainPanel = Deinstall.createDeinstallMainPanel(onSubmitDeinstallBtnTapCB);
            
            deinstallPanel = new Ext.Panel({
                title: 'Deinstall',
                id: 'tab'+panelIndex.deinstall+1,
                cls: 'card' + (panelIndex.deinstall+1) + ' deinstall_panel',
                iconCls: 'deinstall',
                // layout: 'card',
                items: [ deinstallMainPanel, showVehiclePanel ],
                dockedItems: [ deinstallNavBar ]
            });
            
            searchNavBar = new Ext.Toolbar({
                ui: 'dark',
                dock: 'top',
                title: 'OnBoard Fitters'
            });

            searchMainPanel = Search.createSearchMainPanel(onSubmitSearchBtnTapCB);

	        Ext.regModel('Vehicles', {
	            fields: ['id', 'registration', 'imei', 'make', 'model', '2nd_ref', 'installed_time', 'client_uid']
	        });

	        searchResultsListComp = new Ext.List(Ext.apply(Search.getListBase(resultsTpl, vehicles, Ext.emptyFn)));

            
            searchPanel = new Ext.Panel({
                title: 'Search',
                id: 'tab'+panelIndex.search+1,
                cls: 'card' + (panelIndex.search+1) + ' search_panel',
                iconCls: 'search',
                // layout: 'card',
                items: [ searchMainPanel, searchResultsListComp /*,showVehiclePanel*/ ],
                dockedItems: [ searchNavBar ]
            });
            
            /*
            installPanel = Tasks.renderTasksPanel();
            
            deinstallPanel = Journals.renderJournalsPanel();

            searchPanel = Events.renderEventsPanel();

            */
            //__HELP panels layout start==================================================================================
            
            helpNavBar = new Ext.Toolbar({
                ui: 'dark',
                dock: 'top',
                title: 'OnBoard Fitters'
            });

            helpMainPanel = Help.createHelpMainPanel();
            
            helpPanel = new Ext.Panel({
                title: 'Help',
                id: 'tab'+panelIndex.help+1,
                cls: 'card'+(panelIndex.help+1) + ' help_panel',
                iconCls: 'help',
                // layout: 'card',
                // fullscreen: true,
                items: [ helpMainPanel ],
                dockedItems: [helpNavBar]
            });
            
            
            //__HELP panels layout end==================================================================================
                
            BottomTabsInline = new Ext.TabPanel({
                tabBar: {
                    dock: 'bottom',
                    layout: {
                        pack: 'center'
                    },
                    listeners: {
                        hide: function(comp) {
                            this.up("tabpanel").componentLayout.childrenChanged = true;
                            this.up("tabpanel").doComponentLayout();
                        },
                        show: function(comp) {
                            this.up("tabpanel").componentLayout.childrenChanged = true;
                            this.up("tabpanel").doComponentLayout();
                        },
                    }
                },
                fullscreen: true,
                ui: 'light',
                cardSwitchAnimation: null,
                defaults: {
                    scroll: 'vertical'
                },
                items: [ homePanel, installPanel, deinstallPanel, searchPanel, helpPanel],
                listeners: {
                    cardswitch : function(cont, newCard, oldCard, index, isAnimated) {
                        //change: function(tabBar, tab, card) may also be used
                        Util.logger("newCard is::", newCard);
                        
                        // var newCardTitle = (newCard.title == 'Journal') ? 'journals' : newCard.title.toLowerCase();
                        Util.logger('cardswitch! index is: ', index);
                        /*
                        if(index == panelIndex.home)
                            refreshDashAndListPanelsCB('', '');
                        else if(index == panelIndex.event)
                            Events.showFreshEventsListPanel();
                        else if(index == panelIndex.note)
                            Journals.showFreshJournalsListPanel();
                        else if(index == panelIndex.todo)
                            Tasks.showFreshTasksListPanel();
                        else if(index == panelIndex.help) {
                            // bugfix if the user scrolls the static privacy pages and presses the help button the panel goes blank
                            // this at least navigating back resets this page.
                            // helpPanel.doLayout();
                            // helpPanel.doComponentLayout();
                        }
                        */
                    }
                }
            });

            Util.logger('>>>>>>>>>>>>>>>>>>>>Finished rendering!<<<<<<<<<<<<<<<<<<<<<<<<<<<');
            BottomTabsInline.show();
            
        }; // renderAllComp

        renderAllWithDataCB = function() {
            Util.logger('>>>>>>>>>>>>>>>>>>>>renderAllWithDataCB called!<<<<<<<<<<<<<<<<<<<<<<<<<<<');
            
            renderAllComp();
            
            // performMasterSyncCB();
            
        };

        // Call onDeviceReady when PhoneGap is loaded.
        //
        // At this point, the document has loaded but phonegap.js has not.
        // When PhoneGap is loaded and talking with the native device,
        // it will call the event `deviceready`.
        // 
        // PhoneGap is loaded and it is now safe to make calls PhoneGap methods
        //
        function onDeviceReady() {
            Util.logger('\n\n=========>>>>>>>>>>>>onDeviceReady called<<<<<<<<<<===========\n\n');
           // Register the event listener
           if(Ext.is.Android) {
               // document.addEventListener("backbutton", onBackKeyDown, false);
               document.addEventListener("menubutton", onMenuKeyDown, false);
               // document.addEventListener("homebutton", onHomeKeyDown, false);
               document.addEventListener("backbutton", Ext.emptyFn, false);
           }
        };


        onBackInstallBtnTap = function(btn, eveObj) {
            if(installStep2Panel.isHidden()) {
                Util.logger('installStep2Panel is hidden...');
                installStep1Panel.hide();
                installStep3Panel.hide();
                
                installBackBtn.show();
                installStep2Panel.show();
            } else {
                Util.logger('installStep2Panel is NOT hidden...');
                installStep2Panel.hide();
                installStep3Panel.hide();
                installBackBtn.hide();
                
                installStep1Panel.show();
            }
        };
        
        onSearchStep1InstallBtnTapCB = function() {
            Util.logger('In onSearchStep1InstallBtnTapCB()');
            
            var current_state = 'select';
            var model = Ext.ModelMgr.create(installStep1Panel.getValues(), 'Vehicle1');
            var message = "", errors = model.validate();
            
            var vehicleRegField = Ext.get('enter_vehicle_reg_field');
            vehicleRegField.down('input').dom.focus();
            vehicleRegField.down('input').dom.blur();

            if(Ext.is.Android)
                window.KeyBoard.hideKeyBoard();
            
			Util.logger('\n\n*******reg val is::', installStep1FormBase.vehicle1);
			
			
            if(installStep1FormBase.vehicle1) {
            // if(errors.isValid()) {

                Util.logger('Before updateRecord');
                Util.logger('vehicle1::', installStep1FormBase.vehicle1);
                installStep1Panel.updateRecord(installStep1FormBase.vehicle1, true);
				Util.logger('*******reg val is::', installStep1FormBase.vehicle1.get('registration'));

				if(installStep1FormBase.vehicle1.get('registration')) {        
                    newVehicle = copyToVehicleObject(installStep1FormBase.vehicle1);
                    findVehicle(newVehicle, Util.getItemsSize(), newVehicle.cl_state, 'add', refillStep1Form);

                    Util.logger('After updateRecord vehicle1::', installStep1FormBase.vehicle1);

                }

	            // BottomTabsInline.setActiveItem(installPanel);
/*
	            installStep1Panel.hide();
	            installStep3Panel.hide();
	            installStep2Panel.show();
	            installBackBtn.show();
*/

            } else {
                Ext.each(errors.items, function(rec, i) {
                    message += '<p class="loginErrorMsg">'+rec.message+'</p>';
                });
                Util.logger('ERROR is: ', message);
                Ext.Msg.alert("Oops!", message, Ext.emptyFn);
            }
                        
        };

        onNextStep1InstallBtnTapCB = function() {
            Util.logger('In onNextStep1InstallBtnTapCB()');
            
            var current_state = 'select';
            var model = Ext.ModelMgr.create(installStep1Panel.getValues(), 'Vehicle1');
            var message = "", errors = model.validate();
            
            var vehicleRegField = Ext.get('enter_vehicle_reg_field');
            vehicleRegField.down('input').dom.focus();
            vehicleRegField.down('input').dom.blur();

            if(Ext.is.Android)
                window.KeyBoard.hideKeyBoard();
            
            if(errors.isValid()) {

                if(installStep1FormBase.vehicle1) {
                    Util.logger('Before updateRecord');
                    Util.logger('vehicle1::', installStep1FormBase.vehicle1);
                    installStep1Panel.updateRecord(installStep1FormBase.vehicle1, true);
        
                    newVehicle = copyToVehicleObject(installStep1FormBase.vehicle1);

					// Util.searchVehicleRemotely(newVehicle.registration, '', '', updateVehicleModel);

                    saveVehicleInfo(newVehicle, Util.getItemsSize(), newVehicle.cl_state, 'add', moveStep1NextStep2);

                    Util.logger('After updateRecord vehicle1::', installStep1FormBase.vehicle1);

                }

	            // BottomTabsInline.setActiveItem(installPanel);
/*
	            installStep1Panel.hide();
	            installStep3Panel.hide();
	            installStep2Panel.show();
	            installBackBtn.show();*/


            } else {
                Ext.each(errors.items, function(rec, i) {
                    message += '<p class="loginErrorMsg">'+rec.message+'</p>';
                });
                Util.logger('ERROR is: ', message);
                Ext.Msg.alert("Oops!", message, Ext.emptyFn);
            }
                        
        };
        
        onNextStep2InstallBtnTapCB = function() {
            Util.logger('In onNextStep2InstallBtnTapCB()');

            var current_state = 'select',
             	model = Ext.ModelMgr.create(installStep2Panel.getValues(), 'Vehicle2'),
            	message = "", errors = model.validate(), newVehicle;
            
            var vehicleRegField = Ext.get('enter_imei_field');
            vehicleRegField.down('input').dom.focus();
            vehicleRegField.down('input').dom.blur();

            if(Ext.is.Android)
                window.KeyBoard.hideKeyBoard();
            
            if(errors.isValid()) {

                if(installStep2FormBase.vehicle2) {
                    Util.logger('Before updateRecord');
                    Util.logger('vehicle2::', installStep2FormBase.vehicle2);
                    installStep2Panel.updateRecord(installStep2FormBase.vehicle2, true);
        
                    Util.logger('After updateRecord vehicle2::', installStep2FormBase.vehicle2);

                    newVehicle = copyToVehicleObject(installStep1FormBase.vehicle1, installStep2FormBase.vehicle2);
                    assignVehicle(newVehicle, Util.getItemsSize(), newVehicle.cl_state, 'add', moveStep2NextStep3);
                    
                }

	            // BottomTabsInline.setActiveItem(installPanel);
/*
	            installStep1Panel.hide();
	            installStep2Panel.hide();
	            installStep3Panel.show();
	            installBackBtn.show();
*/

            } else {
                Ext.each(errors.items, function(rec, i) {
                    message += '<p class="loginErrorMsg">'+rec.message+'</p>';
                });
                Util.logger('ERROR is: ', message);
                Ext.Msg.alert("Oops!", message, Ext.emptyFn);
            }
            
        };
        
		onRefreshStep3InstallBtnTapCB = function() {
            Util.logger('In onRefreshStep3InstallBtnTapCB()');
			
		};
		
        onSubmitStep3InstallBtnTapCB = function() {
            Util.logger('In onSubmitStep3InstallBtnTapCB()');

            var current_state = 'select',
            	model = Ext.ModelMgr.create(installStep3Panel.getValues(), 'Vehicle3'),
            	message = "", errors = model.validate(), newVehicle;
            
            var vehicleRegField = Ext.get('install_comp_field');
            vehicleRegField.down('input').dom.focus();
            vehicleRegField.down('input').dom.blur();

            if(Ext.is.Android)
                window.KeyBoard.hideKeyBoard();
            
            if(errors.isValid()) {

                if(installStep3FormBase.vehicle3) {
                    Util.logger('Before updateRecord');
                    Util.logger('vehicle3::', installStep3FormBase.vehicle3);
                    installStep3Panel.updateRecord(installStep3FormBase.vehicle3, true);
        
                    Util.logger('After updateRecord vehicle3::', installStep3FormBase.vehicle3);
                    
                    // localStorage[entity+'_'+user_id+'['+index+']'] = Ext.encode(item);
                    newVehicle = copyToVehicleObject(installStep1FormBase.vehicle1, installStep2FormBase.vehicle2, installStep3FormBase.vehicle3);
                    saveVehicle(newVehicle, Util.getItemsSize(), newVehicle.cl_state, 'add');
                }
            } else {
                Ext.each(errors.items, function(rec, i) {
                    message += '<p class="loginErrorMsg">'+rec.message+'</p>';
                });
                Util.logger('ERROR is: ', message);
                Ext.Msg.alert("Oops!", message, Ext.emptyFn);
            }
            
            // BottomTabsInline.setActiveItem(installPanel);
            installStep1Panel.hide();
            installStep2Panel.hide();
            installStep3Panel.hide();
            installBackBtn.hide();
            
            showVehiclePanel.update(newVehicle);
            showVehiclePanel.show();
            
        };
        
        onSubmitDeinstallBtnTapCB = function() {
            Util.logger('In onSubmitDeinstallBtnTapCB()');
            
            var vehicleRegField = Ext.get('vehicle_reg_field');
            vehicleRegField.down('input').dom.focus();
            vehicleRegField.down('input').dom.blur();

            if(Ext.is.Android)
                window.KeyBoard.hideKeyBoard();
            
            var searchVal;
            var vehicleRegFieldVal = Ext.getCmp('vehicle_reg_field').getValue();
            var imeiFieldVal = Ext.getCmp('imei_field').getValue();
            var replaceUnitFieldVal = Ext.getCmp('replace_unit_field').isChecked();
            if(Ext.isEmpty(vehicleRegFieldVal) && Ext.isEmpty(imeiFieldVal)) {
                Ext.Msg.alert("Error", "Please enter either Registration or IMEI", Ext.emptyFn);
            } else {
                Util.logger('val reg is::', vehicleRegFieldVal);
                Util.logger('val imei is::', imeiFieldVal);
                Util.logger('val replace fitted is::', replaceUnitFieldVal);
            
				Util.deinstallVehicleRemotely(vehicleRegFieldVal, imeiFieldVal, replaceUnitFieldVal, confirmDeinstall);
				/*
                searchVal = Util.searchVehicleRemotely(vehicleRegFieldVal, imeiFieldVal);

                if(Ext.isEmpty(searchVal)) {
                    Ext.Msg.alert("Error", "No record found", Ext.emptyFn);                    
                } else {
                    Util.logger('serachVal is::',searchVal);
                    Ext.Msg.confirm("Confirmation", "Are you sure you want to Deinstall this vehicle?", function(btn) {
                        if(btn == 'yes') {
                            searchVal.status = 'deinstalled';
                            saveVehicle(searchVal, searchVal.vehicle_id-1, searchVal.cl_state, 'edit');

                            deinstallMainPanel.hide();
                        }
                    });
                }
				*/
            }
        };
        
        onSubmitSearchBtnTapCB = function() {
            Util.logger('In onSubmitSearchBtnTapCB()');
            
			var vehicles = [], searchResults;
            
            var vehicleRegField = Ext.get('search_reg_field');
            vehicleRegField.down('input').dom.focus();
            vehicleRegField.down('input').dom.blur();

            if(Ext.is.Android)
                window.KeyBoard.hideKeyBoard();
          
            var searchRegFieldVal = Ext.getCmp('search_reg_field').getValue();
            var searchImeiFieldVal = Ext.getCmp('search_imei_field').getValue();
            var search2ndrefFieldVal = Ext.getCmp('search_2ndref_field').getValue();
            if(Ext.isEmpty(searchRegFieldVal) && Ext.isEmpty(searchImeiFieldVal) && Ext.isEmpty(search2ndrefFieldVal)) {
                Ext.Msg.alert("Error", "Please enter either Registration or IMEI or second reference", Ext.emptyFn);
            } else {
                Util.logger('regval is::', searchRegFieldVal);
                Util.logger('imeival is::', searchImeiFieldVal);
                Util.logger('_2ndRefVal is::', search2ndrefFieldVal);

                Util.searchVehicleRemotely(searchRegFieldVal, searchImeiFieldVal, search2ndrefFieldVal, updateSearchResults);
                
            }
        };
        
        //__VEHICLES action handlers start============================================================

        resetVehicleFormPanel = function() {
            installStep1FormBase.vehicle1 = Ext.ModelMgr.create({ id: null, registration: '', make: '', model: '', colour: '', vin: '', 
									vehicle_id: null, cl_state: 'insert', /*client_uid: Api.randomString(), */action: 'new'}, 'Vehicle1');
            installStep1Panel.load(installStep1FormBase.vehicle1);
            
            installStep2FormBase.vehicle2 = Ext.ModelMgr.create({ id: null, imei: '', mileage: '', second_ref: '', vehicle_id: null, 
                                    cl_state: 'insert', /*client_uid: Api.randomString(), */action: 'new'}, 'Vehicle2');
            installStep2Panel.load(installStep2FormBase.vehicle2);

            installStep3FormBase.vehicle3 = Ext.ModelMgr.create({ id: null, extension: false, telematics: false, diagnostic: false, 
                                    install_completion: new Date(), installer_name: '', rep_name: '', notes: '', vehicle_id: null, cl_state: 'insert', 
                                    /*client_uid: Api.randomString(), */action: 'new'}, 'Vehicle3');
            installStep3Panel.load(installStep3FormBase.vehicle3);
        };

        copyToVehicleObject = function(vehicleModel1, vehicleModel2, vehicleModel3) {
            var vehicleObj = new Object();
            vehicleObj.id = vehicleModel1.get('id');
            vehicleObj.registration = vehicleModel1.get('registration');
            vehicleObj.make = vehicleModel1.get('make');
            vehicleObj.model = vehicleModel1.get('model');
            vehicleObj.colour = vehicleModel1.get('colour');
            vehicleObj.vin = vehicleModel1.get('vin');
			if(!Ext.isEmpty(vehicleModel2)) {
	            vehicleObj.imei = vehicleModel2.get('imei');
	            vehicleObj.mileage = vehicleModel2.get('mileage');
	            vehicleObj.second_ref = vehicleModel2.get('second_ref');
			}
			if(!Ext.isEmpty(vehicleModel3)) {
				vehicleObj.extension = vehicleModel3.get('extension');
	            vehicleObj.telematics = vehicleModel3.get('telematics');
	            vehicleObj.diagnostic = vehicleModel3.get('diagnostic');
	            vehicleObj.install_completion = vehicleModel3.get('install_completion');
	            vehicleObj.installer_name = vehicleModel3.get('installer_name');
	            vehicleObj.rep_name = vehicleModel3.get('rep_name');
	            vehicleObj.notes = vehicleModel3.get('notes');	
			}
            
            vehicleObj.vehicle_id = vehicleModel1.get('vehicle_id');
            vehicleObj.cl_state = vehicleModel1.get('cl_state');
            // vehicleObj.client_uid = todoModel.get('client_uid');
            return vehicleObj;
        };

        saveVehicle = function(vehicleParam, index, curr_state, action/*, callBack, syncCallBack, failCallBack*/) {
            Util.logger('In saveVehicle()');

            vehicleParam.status = 'installed';
            vehicleParam.updated_at = Api.formatToUTCDate(new Date());
            vehicleParam.vehicle_id = index+1;
            vehicleParam.cl_state = Util.getItemState(curr_state, action);

            Util.logger('vehicleParam before saving:::', JSON.stringify(vehicleParam));

            // Util.remoteSyncItem(vehicleParam, action/*, callBack, syncCallBack, failCallBack*/);

            cacheItemLocally(vehicleParam, index);
            // callBack();
    //        }
        };

        findVehicle = function(vehicleParam, index, curr_state, action, callBack/*, syncCallBack, failCallBack*/) {
            Util.logger('In findVehicle()');

            vehicleParam.status = 'installed';
            vehicleParam.updated_at = Api.formatToUTCDate(new Date());
            vehicleParam.vehicle_id = index+1;
            vehicleParam.cl_state = Util.getItemState(curr_state, action);

            Util.logger('vehicleParam before saving:::', JSON.stringify(vehicleParam));

            Util.findVehicleRemotely(vehicleParam, action, callBack/*, syncCallBack, failCallBack*/);

            cacheItemLocally(vehicleParam, index);
            // callBack();
    //        }
        };

        saveVehicleInfo = function(vehicleParam, index, curr_state, action, callBack/*, syncCallBack, failCallBack*/) {
            Util.logger('In saveVehicleInfo()');

            vehicleParam.status = 'installed';
            vehicleParam.updated_at = Api.formatToUTCDate(new Date());
            vehicleParam.vehicle_id = index+1;
            vehicleParam.cl_state = Util.getItemState(curr_state, action);

            Util.logger('vehicleParam before saving:::', JSON.stringify(vehicleParam));

            Util.saveVehicleInfoRemotely(vehicleParam, action, callBack/*, syncCallBack, failCallBack*/);

            cacheItemLocally(vehicleParam, index);
            // callBack();
    //        }
        };

        findVehicleInfo = function(vehicleParam, index, curr_state, action, callBack/*, syncCallBack, failCallBack*/) {
            Util.logger('In findVehicle()');

            vehicleParam.status = 'installed';
            vehicleParam.updated_at = Api.formatToUTCDate(new Date());
            vehicleParam.vehicle_id = index+1;
            vehicleParam.cl_state = Util.getItemState(curr_state, action);

            Util.logger('vehicleParam before saving:::', JSON.stringify(vehicleParam));

            Util.findVehicleRemotely(vehicleParam, action, callBack/*, syncCallBack, failCallBack*/);

            cacheItemLocally(vehicleParam, index);
            // callBack();
    //        }
        };

        assignVehicle = function(vehicleParam, index, curr_state, action, callBack/*, syncCallBack, failCallBack*/) {
            Util.logger('In assignVehicle()');

            vehicleParam.status = 'installed';
            vehicleParam.updated_at = Api.formatToUTCDate(new Date());
            vehicleParam.vehicle_id = index+1;
            vehicleParam.cl_state = Util.getItemState(curr_state, action);

            Util.logger('vehicleParam before saving:::', JSON.stringify(vehicleParam));

            Util.assignVehicleRemotely(vehicleParam, action, callBack/*, syncCallBack, failCallBack*/);

            cacheItemLocally(vehicleParam, index);
            // callBack();
    //        }
        };
        
		refillStep1Form = function(vehicle) {
			Util.logger('In refillStep1Form');
			
			if(Ext.isEmpty(installStep1FormBase.vehicle1)) {
				resetVehicleFormPanel();
			}

			Util.logger('vehicle param is::', vehicle);
			
			installStep1FormBase.vehicle1.set('registration', vehicle.registration);
			installStep1FormBase.vehicle1.set('make', vehicle.make);
			installStep1FormBase.vehicle1.set('model', vehicle.model);
			installStep1FormBase.vehicle1.set('colour', vehicle.colour);
			installStep1FormBase.vehicle1.set('vin', vehicle.vin);

			installStep1Panel.load(installStep1FormBase.vehicle1);
			
		};
		
		moveStep1NextStep2 = function(vehicle) {
			
			installStep1Panel.hide();
            installStep3Panel.hide();
            installStep2Panel.show();
            installBackBtn.show();
		};
		
		moveStep2NextStep3 = function(vehicle) {
			
			installStep1Panel.hide();
            installStep2Panel.hide();
            installStep3Panel.show();
            installBackBtn.show();
		};
		
		updateVehicleModel = function(vehicle) {
			Util.logger('In updateVehicleModel');
			
			newVehicle.imei = vehicle.imei;
			newVehicle.mileage = vehicle.mileage;
			newVehicle.second_ref = vehicle.second_ref;
			
		};
		
		confirmDeinstall = function(vehicle) {
			Util.logger('In confirmDeinstall');
		};
		
		updateSearchResults = function(vehicles) {
			Util.logger('In updateSearchResults');
			/*
			if(Ext.isEmpty(searchResults)) {
                Ext.Msg.alert("Error", "No record found", Ext.emptyFn);                    
            } else {
                Util.logger('searchResults is::',searchResults);
                

				//in case data is synced with server and requires update
				Ext.each(searchResults, function(item, index, allItems) {
					journalFormBase.note = Ext.ModelMgr.create({
					    id: item.id,
					    registration: item.registration,
					    imei: item.imei,
					    make: item.make,
					    model: item.model,
					    second_ref: item.second_ref,
						installation_time: item.installation_time,
					    vehicle_id: item.vehicle_id,
					    cl_state: item.cl_state,
					    // client_uid: item.client_uid,
					    action: 'edit'},
					    'Vehicle');
								
		        });
				
		        journalsListComp.getStore().loadData(notes, false);
                searchMainPanel.hide();
				searchResultsListComp.show();
                // showVehiclePanel.update(searchVal);
                // showVehiclePanel.show();
				*/
            
		};
		
        cacheItemLocally = function(item, index) {
            // var user_id = Api.getLocalStorageProp('user_id');
            if(Ext.isEmpty(item)) {
                Util.logger('[INFO]:: In cacheItemLocally() => item is empty!');
                return;
            }

            Util.logger('newItem before saving:::', JSON.stringify(item));

            localStorage['vehicle['+index+']'] = Ext.encode(item);
            Util.logger('Item saved locally!');

        };
        
        registerLoginHandler();
        
        if(Ext.isEmpty(Api.getLocalStorageProp('account_key'))) {
            
            form = new Ext.form.FormPanel(loginFormBase);
            form.show();

            // renderAllWithDataCB();

        } else {
            renderAllWithDataCB();
        }

	}
});