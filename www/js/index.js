Ext.setup({
    
    tabletStartupScreen: 'rsc/phone_startup.svg',
    phoneStartupScreen: 'rsc/phone_startup.svg',
    icon: 'rsc/icon.png',
    glossOnIcon: false,
    
    onReady: function() {
        // $> ./install_droid_app.sh
        // $> cd fitters
        // $> ant release
        // $> adb install bin/Fitters-release.apk
        var form, loginFormBase;
        BottomTabsInline = '';
        newVehicle = {};//new Object();

        Util.logger('Abt to register deviceready event!');
        // if(Ext.is.Android)
        document.addEventListener("deviceready", onDeviceReady, false);
        
        // Api.clearLocalStorage();

        Init.initState();

        loginHandlerCB = function(ele, eve) {
            Util.logger('Login button handler called!');
            
            handleLoginSignup(Ext.emptyFn, User.login);
        };
        
        /*
        signupHandlerCB = function(ele, eve) {
            Util.logger('Signup button handler called!');
            
            handleLoginSignup(errorsHandlerCB, User.signup);
        };
        */
        handleLoginSignup = function(errorsHandlerCB, userCB) {
            Api.clearLocalStorage();
            Init.initState();
            
            var displayPanelCB, passwordField2,
                model = Ext.ModelMgr.create(form.getValues(), 'User'),
                message = "", errors = model.validate();
            
            if(Ext.isEmpty(BottomTabsInline)) {
                displayPanelCB = renderAllWithDataCB;
            }
            else {
                displayPanelCB = updatePanelWithDataCB;
            }
        
            if(Ext.is.iOS) {
                passwordField2 = Ext.get('loginPasswordField');
                passwordField2.down('input').dom.focus();
                passwordField2.down('input').dom.blur();
            }
            
            //SIM - forces the soft keyboard to hide for Android devices using Phonegap mechanism
            //http://wiki.phonegap.com/w/page/27915465/How-to-show-and-hide-soft-keyboard-in-Android
            if(Ext.is.Android) {
                passwordField2 = Ext.get('loginPasswordField');
                passwordField2.down('input').dom.focus();
                passwordField2.down('input').dom.blur();
                window.KeyBoard.hideKeyBoard();
                //PhoneGap.fireEvent('hidekeyboard');
            }

            // errors = (errorsHandlerCB != Ext.emptyFn) ? errorsHandlerCB(model, errors) : errors;
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
                                
                // form.hide();
            } else {
                Ext.each(errors.items, function(rec, i) {
                    message += '<p class="loginErrorMsg">'+rec.message+'</p>';
                });
                Ext.Msg.alert("Oops!", message, Ext.emptyFn);
            }
            return false;
        };
        
        /*
        errorsHandlerCB = function(model, errors) {
            if(model.get('password') != model.get('password2')) {
                var error = {field: 'password2', message: 'Passwords mismatch'};
                errors.add("password2", error);
            }
            return errors;
        };
        */
        // KL - http://www.sencha.com/forum/showthread.php?112719-Best-practice-for-form-validation&highlight=textfield
        Ext.regModel('User', { 
            fields: [
                {name: 'username', type: 'string'},
                {name: 'password', type: 'string'}
                // ,{name: 'password2', type: 'string'}
            ],
            validations: [
                {type: 'presence', name: 'username', message: "Username is required"},
                {type: 'presence', name: 'password', message: "Password is required"}
                // ,{type: 'format',   name: 'username', matcher: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/, message:"Wrong Email Format"}
            ]
        });

        registerLoginHandler = function() {
            loginFormBase = User.getLoginFormBase(loginHandlerCB/*, signupHandlerCB*/);

            loginFormBase.user = Ext.ModelMgr.create({ username: '', password: ''}, 'User');
        };
        
        requestFailedCB = function(alert, msg) {
            Ext.Msg.alert(alert, msg, Ext.emptyFn);
            // return false;
        };
        
        formFailedCB = function(form, alert, msg) {
            Util.logger('form is:', form);

            Ext.Msg.alert(alert, msg, Ext.emptyFn);
            form.show();
            return false;
        };

        renderAllComp = function() {
            Util.logger('renderAllComp() called');
            
            var vehicles = [];
            
            panelIndex = {home: 0, install: 1, deinstall: 2, search: 3, help: 4};
            
            // events = [], tasks = [];
            
            Ext.apply(Ext.util.Format, { defaultDateFormat: 'j-M-Y' });

            //__HOME panels layout start==================================================================================
            
            //homeNavBar = new Ext.Toolbar({
              //  ui: 'dark',
                //dock: 'top',
                //title: 'OnBoard Fitters',
                //id: 'titleContainer'
            //});

            homeMainPanel = Home.createHomeMainPanel();
            
            homePanel = new Ext.Panel({
                title: 'Home',
                id: 'tab'+panelIndex.home+1,
                cls: 'card' + (panelIndex.home+1) + ' home_panel',
                iconCls: 'home',
                // layout: 'card',
                items: [ homeMainPanel ]
            //    dockedItems: [ homeNavBar ]
            });
            
            
            //__HOME panels layout end==================================================================================
            
            Ext.regModel('Vehicle', {
                fields: [
                    {name: 'id', type: 'int'},
                    {name: 'service_id', type: 'int'},
                    {name: 'user_id', type: 'int'},
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
                    {name: 'install_notes', type: 'string'},
                    {name: 'install_refresh', type: 'string'},
                    {name: 'install_status', type: 'boolean'},
                    {name: 'replace_unit', type: 'boolean'},
                    {name: 'cap_confirmed', type: 'boolean'},
                    {name: 'signal_received', type: 'boolean'},
                    {name: 'service_time', type: 'date'},
                    {name: 'remote_error', type: 'string'},
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
                ],
                validations: [
                    {type: 'presence', name: 'imei', message: "IMEI is required"},
                    {type: 'presence', name: 'mileage', message: "Mileage is required"},
                    {type: 'presence', name: 'second_ref', message: "Second Reference is required"}
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
                    {name: 'install_notes', type: 'string'},
                    {name: 'install_refresh', type: 'string'},
                    {name: 'vehicle_id', type: 'int'},
                    {name: 'cl_state', type: 'string'},
                    // {name: 'client_uid', type: 'string'},
                    {name: 'action', type: 'string'}
                ],
                validations: [
                    {type: 'presence', name: 'installer_name', message: "Installer Name is required"}
                ]
            });
            
            logoutBtn = new Ext.Button(Api.getButtonBase('Logout', false, 'logout', onLogoutBtnTap));
            
            installBackBtn = new Ext.Button(Api.getButtonBase('Back', true, 'install_back', onBackInstallBtnTap));
            
            installNavBar = new Ext.Toolbar({
                ui: 'dark',
                dock: 'top',
                title: '',
                id: 'titleContainer',
                items: [ installBackBtn, {xtype: 'spacer'}, logoutBtn ]
            });

            installStep1FormBase = Install.createInstallStep1Panel(onSearchStep1InstallBtnTapCB, onNextStep1InstallBtnTapCB);
            installStep1Panel = new Ext.form.FormPanel(installStep1FormBase);
            installStep2FormBase = Install.createInstallStep2Panel(onNextStep2InstallBtnTapCB);
            installStep2Panel = new Ext.form.FormPanel(installStep2FormBase);
            installStep3FormBase = Install.createInstallStep3Panel(onRefreshStep3InstallBtnTapCB, onCompStep3InstallBtnTapCB);
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
                    }
                });

            var resultsTpl = new Ext.XTemplate(
                '<div class="resultsMain">',
                    '<div class="results_list_item make">{make}</div>',
					'<div class="results_list_item model">{model}</div>',
                    '<div class="results_list_item registration">Registration: {registration}</div>',
					'<div class="results_list_item imei">IMEI: {imei}</div>',
                '</div>',
                '<p class="installed_time">Installed: {install_completion:date("j/n/y G:i:s")}</p>',
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
                scroll: 'vertical',
                // layout: 'card',
                items: [ installStep1Panel, installStep2Panel, installStep3Panel/*, showVehiclePanel*/ ],
                dockedItems: [ installNavBar ]
            });
            
            deinstallNavBar = new Ext.Toolbar({
                ui: 'dark',
                dock: 'top',
                title: '',
                id: 'titleContainer',
        /*
       
                titleCls: 'masthead',
*/
                items: [ {xtype: 'spacer'}, logoutBtn ]
            });

            deinstallMainPanel = Deinstall.createDeinstallMainPanel(onSubmitDeinstallBtnTapCB);
            
            deinstallPanel = new Ext.Panel({
                title: 'Deinstall',
                id: 'tab'+panelIndex.deinstall+1,
                cls: 'card' + (panelIndex.deinstall+1) + ' deinstall_panel',
                iconCls: 'deinstall',
                // layout: 'card',
                items: [ deinstallMainPanel ],
                dockedItems: [ deinstallNavBar ]
            });
            
            searchBackBtn = new Ext.Button(Api.getButtonBase('Back', true, 'install_back', onBackSearchBtnTap));
            
            searchNavBar = new Ext.Toolbar({
                ui: 'dark',
                dock: 'top',
                title: '',
                id: 'titleContainer',
				items: [ searchBackBtn, {xtype: 'spacer'}, logoutBtn ]
            });

            searchMainPanel = Search.createSearchMainPanel(onSubmitSearchBtnTapCB);

            Ext.regModel('Vehicles', {
                fields: ['id', 'registration', 'imei', 'make', 'model', 'colour', 'second_ref', 'install_completion', 'client_uid']
            });

            searchResultsListComp = new Ext.List(Ext.apply(Search.getListBase(resultsTpl, vehicles, Ext.emptyFn)));

            
            searchPanel = new Ext.Panel({
                title: 'Search',
                id: 'tab'+panelIndex.search+1,
                cls: 'card' + (panelIndex.search+1) + ' search_panel',
                iconCls: 'search',
                fullscreen: (Ext.is.iOS) ? false : true,
                // scroll: 'vertical',
                layout: 'card',
                items: [ searchMainPanel, searchResultsListComp /*,showVehiclePanel*/ ],
                dockedItems: [ searchNavBar ]
            });
            
            
            //__HELP panels layout start==================================================================================
            
            helpNavBar = new Ext.Toolbar({
                ui: 'dark',
                dock: 'top',
                title: '',
                id: 'titleContainer',
             /*    titleCls: 'masthead', */
                items: [ /*installBackBtn,*/ {xtype: 'spacer'}, logoutBtn ]
            });

            helpMainPanel = Help.createHelpMainPanel();
            
            helpPanel = new Ext.Panel({
                title: 'Help',
                id: 'tab'+panelIndex.help+1,
                cls: 'card'+(panelIndex.help+1) + ' help_panel',
                iconCls: 'help',
                scroll: 'vertical',
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
                        }
                    }
                },
                fullscreen: true,
                ui: 'light',
                cardSwitchAnimation: null,
/*                defaults: {
                    scroll: 'vertical'
                },
*/                items: [ homePanel, installPanel, deinstallPanel, searchPanel, helpPanel ],
                listeners: {
                    cardswitch : function(cont, newCard, oldCard, index, isAnimated) {
                        //change: function(tabBar, tab, card) may also be used
                        Util.logger("newCard is::", newCard);
                        
                        // var newCardTitle = (newCard.title == 'Journal') ? 'journals' : newCard.title.toLowerCase();
                        Util.logger('cardswitch! index is: ', index);
/*
                        if(index == panelIndex.home)
                            // refreshDashAndListPanelsCB('', '');
                        else if(index == panelIndex.install)
                            // Events.showFreshEventsListPanel();
                        else if(index == panelIndex.deinstall)
                            // Journals.showFreshJournalsListPanel();
                        else if(index == panelIndex.search)
                            // Tasks.showFreshTasksListPanel();
                        else if(index == panelIndex.help) {
                            // bugfix if the user scrolls the static privacy pages and presses the help button the panel goes blank
                            // this at least navigating back resets this page.
                            // helpPanel.doLayout();
                            // helpPanel.doComponentLayout();
                            // helpMainPanel.show();
                            helpMainPanel.doLayout();
                        }
*/
                        Util.logger('index is::', index);
                        if(index == panelIndex.help) {
                            helpMainPanel.show();
                        }
                    }
                }
            });

            Util.logger('>>>>>>>>>>>>>>>>>>>>Finished rendering!<<<<<<<<<<<<<<<<<<<<<<<<<<<');
            BottomTabsInline.show();
            
        }; // renderAllComp

        renderAllWithDataCB = function() {
            Util.logger('>>>>>>>>>>>>>>>>>>>>renderAllWithDataCB called!<<<<<<<<<<<<<<<<<<<<<<<<<<<');
            

            if(form !== undefined)
                form.hide();

            renderAllComp();
            
            // performMasterSyncCB();
            
        };

        updatePanelWithDataCB = function() {
            Util.logger('>>>>>>>>>>>>>>>>>>>>updatePanelWithDataCB called!<<<<<<<<<<<<<<<<<<<<<<<<<');
            // var user_id = Api.getLocalStorageProp('user_id');
			// Util.logger('user_id is::', user_id);
			// Util.logger('isEmpty is::', Ext.isEmpty(Api.getLocalStorageProp('feed_'+user_id+'[0]')));
			// var vehicle;
			
            if(form !== undefined)
                form.hide();

            Init.initState();
			var vehicleModel = '';
			Util.logger('tmp_vehicle is:', localStorage['tmp_vehicle']);
            Util.logger('newVehicle.cl_state is::', newVehicle.cl_state);
            //in case the logout action occurred
            BottomTabsInline.show();
			if(!Ext.isEmpty(localStorage['tmp_vehicle'])) {
				newVehicle = Ext.decode(localStorage['tmp_vehicle']);
				Util.logger('vehicle is: ', newVehicle);
				
				if(newVehicle.cl_state == 'step1') {
					installStep2Panel.hide();
                    installStep3Panel.hide();
                    installBackBtn.hide();

                    homePanel.show();
                    // deinstallPanel.show();
                    // searchPanel.show();
                    // helpPanel.show();
                    // helpMainPanel.show();

					if(Ext.isEmpty(installStep1FormBase.vehicle1))
						resetVehicleFormPanel();
						
					copyToVehicleModel1(newVehicle, installStep1FormBase.vehicle1);
					installStep1Panel.load(installStep1FormBase.vehicle1);
                    installStep1Panel.show();
                    installPanel.show();

					BottomTabsInline.setActiveItem(installPanel);
				} else if(newVehicle.cl_state == 'step2') {
					installStep1Panel.hide();
                    installStep3Panel.hide();
                    installBackBtn.show();

                    homePanel.show();
                    // deinstallPanel.show();
                    // searchPanel.show();
                    // helpPanel.show();
                    // helpMainPanel.show();

					if(Ext.isEmpty(installStep1FormBase.vehicle1) || Ext.isEmpty(installStep2FormBase.vehicle2))
						resetVehicleFormPanel();
						
					copyToVehicleModel1(newVehicle, installStep1FormBase.vehicle1);
					copyToVehicleModel2(newVehicle, installStep2FormBase.vehicle2);
					installStep1Panel.load(installStep1FormBase.vehicle1);
					installStep2Panel.load(installStep2FormBase.vehicle2);
					
                    installPanel.show();
                    installStep2Panel.show();
                
					BottomTabsInline.setActiveItem(installPanel);
				} else if(newVehicle.cl_state == 'step3') {
					installStep1Panel.hide();
                    installStep2Panel.hide();
                    installBackBtn.show();

                    homePanel.show();
                    // deinstallPanel.show();
                    // searchPanel.show();
                    // helpPanel.show();
                    // helpMainPanel.show();
/*
					if(Ext.isEmpty(installStep1FormBase.vehicle1) || Ext.isEmpty(installStep2FormBase.vehicle2) || Ext.isEmpty(installStep3FormBase.vehicle3))
						resetVehicleFormPanel();
						
					copyToVehicleModel1(newVehicle, installStep1FormBase.vehicle1);
					copyToVehicleModel2(newVehicle, installStep2FormBase.vehicle2);
					copyToVehicleModel3(newVehicle, installStep3FormBase.vehicle3);
*/
					installStep1FormBase.vehicle1 = Ext.ModelMgr.create(newVehicle, 'Vehicle1');
					installStep2FormBase.vehicle2 = Ext.ModelMgr.create(newVehicle, 'Vehicle2');
					installStep3FormBase.vehicle3 = Ext.ModelMgr.create(newVehicle, 'Vehicle3');
					installStep1Panel.load(installStep1FormBase.vehicle1);
					installStep2Panel.load(installStep2FormBase.vehicle2);
					installStep3Panel.load(installStep3FormBase.vehicle3);

                    installStep3Panel.show();
                    installPanel.show();
                
					BottomTabsInline.setActiveItem(installPanel);
				} else if(newVehicle.cl_state == 'search') {
					vehicleModel = Ext.ModelMgr.create(newVehicle, 'Vehicle');
        
                    // installStep1Panel.show();
                    // installStep3Panel.show();
                    // installStep2Panel.show();
                    homePanel.show();
                    // deinstallPanel.show();
                    // helpPanel.show();
                    // helpMainPanel.show();

					searchMainPanel.load(vehicleModel);
                    searchMainPanel.show();
                    searchPanel.show();
					BottomTabsInline.setActiveItem(searchPanel);
				} else if(newVehicle.cl_state == 'deinstall'){
					vehicleModel = Ext.ModelMgr.create(newVehicle, 'Vehicle');

                    // installStep1Panel.show();
                    // installStep3Panel.show();
                    // installStep2Panel.show();
                    homePanel.show();
                    // searchPanel.show();
                    // helpPanel.show();
                    // helpMainPanel.show();

					deinstallMainPanel.load(vehicleModel);
                    deinstallPanel.show();
					BottomTabsInline.setActiveItem(deinstallPanel);
				} else {
                    vehicleModel = Ext.ModelMgr.create(newVehicle, 'Vehicle');

                    // installStep1Panel.show();
                    // installStep3Panel.show();
                    // installStep2Panel.show();
                    // deinstallPanel.show();
                    // searchPanel.show();
                    // helpMainPanel.show();

                    homePanel.show();
                    BottomTabsInline.setActiveItem(homePanel);
                }
					
				newVehicle.cl_state = 'insert';
			}
            
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
               document.addEventListener("menubutton", Ext.emptyFn/*onMenuKeyDown*/, false);
               // document.addEventListener("homebutton", onHomeKeyDown, false);
               document.addEventListener("backbutton", Ext.emptyFn, false);
           }
        }


        onLogoutBtnTap = function(btn, eveObj) {
            Util.logger('onLogoutBtnTap called');

            resetVehicleFormPanel();

            deinstallMainPanel.reset();
/*
            Ext.getCmp('deinstall_imei_field').reset();
            Ext.getCmp('deinstall_imei2_field').reset();
            Ext.getCmp('replace_unit_field').reset();
            Ext.getCmp('deinstall_notes_field').reset();
*/
            searchMainPanel.reset();
/*
            Ext.getCmp('search_reg_field').reset();
            Ext.getCmp('search_imei_field').reset();
            Ext.getCmp('search_2ndref_field').reset();
*/
            searchResultsListComp.hide();

            // installStep1Panel.hide();
            installStep3Panel.hide();
            installStep2Panel.hide();
            installPanel.hide();
            installBackBtn.hide();
            homePanel.hide();
            deinstallPanel.hide();
            searchPanel.hide();
            helpPanel.hide();
            helpMainPanel.hide();
                
            vehicle.cl_state = 'insert';

            // localStorage['tmp_vehicle'] = Ext.encode(vehicle);
            
            BottomTabsInline.hide();
            if(form === undefined)
                form = new Ext.form.FormPanel(loginFormBase);

            form.reset();
            form.show();

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
            
            if(Ext.is.iOS) {
                var vehicleRegField = Ext.get('enter_vehicle_reg_field');
                vehicleRegField.down('input').dom.focus();
                vehicleRegField.down('input').dom.blur();
            }

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
                    newVehicle = copyToVehicleObject(newVehicle, installStep1FormBase.vehicle1);
                    findVehicle(newVehicle, Util.getItemsSize(), newVehicle.cl_state, 'add', refillStep1Form, failSearchStep1Install);

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
            
            if(Ext.is.iOS) {
                var vehicleRegField = Ext.get('enter_vehicle_reg_field');
                vehicleRegField.down('input').dom.focus();
                vehicleRegField.down('input').dom.blur();
            }

            if(Ext.is.Android)
                window.KeyBoard.hideKeyBoard();
            
            if(errors.isValid()) {

                if(installStep1FormBase.vehicle1) {
                    Util.logger('Before updateRecord');
                    Util.logger('vehicle1::', installStep1FormBase.vehicle1);
                    installStep1Panel.updateRecord(installStep1FormBase.vehicle1, true);
        
                    newVehicle = copyToVehicleObject(newVehicle, installStep1FormBase.vehicle1);

					// Util.searchVehicleRemotely(newVehicle.registration, '', '', updateVehicleModel);

                    saveVehicleInfo(newVehicle, Util.getItemsSize(), newVehicle.cl_state, 'add', moveStep1NextStep2, failNextStep1Install);

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
        
        onNextStep2InstallBtnTapCB = function() {
            Util.logger('In onNextStep2InstallBtnTapCB()');

            var current_state = 'select',
                model = Ext.ModelMgr.create(installStep2Panel.getValues(), 'Vehicle2'),
                message = "", errors = model.validate();
            
            if(Ext.is.iOS) {
                var vehicleRegField = Ext.get('enter_imei_field');
                vehicleRegField.down('input').dom.focus();
                vehicleRegField.down('input').dom.blur();
            }

            if(Ext.is.Android)
                window.KeyBoard.hideKeyBoard();
            
            if(errors.isValid()) {

                if(installStep2FormBase.vehicle2) {
                    Util.logger('Before updateRecord');
                    Util.logger('vehicle2::', installStep2FormBase.vehicle2);
                    installStep2Panel.updateRecord(installStep2FormBase.vehicle2, true);
        
                    Util.logger('After updateRecord vehicle2::', installStep2FormBase.vehicle2);

                    // newVehicle = copyToVehicleObject(installStep1FormBase.vehicle1, installStep2FormBase.vehicle2);
                    newVehicle = copyToVehicleObject(newVehicle, '', installStep2FormBase.vehicle2);
                    assignVehicle(newVehicle, Util.getItemsSize(), newVehicle.cl_state, 'add', moveStep2NextStep3, failNextStep2Install);
                    
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
			
			var current_state = 'select',
                model = Ext.ModelMgr.create(installStep3Panel.getValues(), 'Vehicle3'),
                message = "", errors = model.validate();
            
            if(Ext.is.iOS) {
                var vehicleRefField = Ext.get('installer_name_field');
                vehicleRefField.down('input').dom.focus();
                vehicleRefField.down('input').dom.blur();
            }

            if(Ext.is.Android)
                window.KeyBoard.hideKeyBoard();

                newVehicle = copyToVehicleObject(newVehicle, installStep1FormBase.vehicle1, installStep2FormBase.vehicle2, installStep3FormBase.vehicle3);

			Util.logger('newVehicle is::', newVehicle);
			if(!Ext.isEmpty(newVehicle)) {
                Util.refreshVehicleRemotely(newVehicle, 'add', refreshInstallStep3, failRefreshStep3Install);
                
			}
            
		};
		
        onCompStep3InstallBtnTapCB = function(isComplete) {
            Util.logger('In onCompStep3InstallBtnTapCB()');

            var current_state = 'select',
                model = Ext.ModelMgr.create(installStep3Panel.getValues(), 'Vehicle3'),
                message = "", errors = model.validate();
            
            if(Ext.is.iOS) {
                var vehicleRegField = Ext.get('installer_name_field');
                vehicleRegField.down('input').dom.focus();
                vehicleRegField.down('input').dom.blur();
            }

            Util.logger('Is it complete or NOT? ', isComplete);

            if(Ext.is.Android)
                window.KeyBoard.hideKeyBoard();
            
            if(errors.isValid()) {

                if(installStep3FormBase.vehicle3) {
                    Util.logger('Before updateRecord');
                    Util.logger('vehicle3::', installStep3FormBase.vehicle3);
                    installStep3Panel.updateRecord(installStep3FormBase.vehicle3, true);
        
                    Util.logger('After updateRecord vehicle3::', installStep3FormBase.vehicle3);
                    
                    // localStorage[entity+'_'+user_id+'['+index+']'] = Ext.encode(item);
                    newVehicle = copyToVehicleObject(newVehicle, installStep1FormBase.vehicle1, installStep2FormBase.vehicle2, installStep3FormBase.vehicle3);
					newVehicle.install_status = isComplete;
                    saveVehicle(newVehicle, Util.getItemsSize(), newVehicle.cl_state, 'add', moveStep3SubmitHome, failSubmitStep3Install);
                }
            } else {
                Ext.each(errors.items, function(rec, i) {
                    message += '<p class="loginErrorMsg">'+rec.message+'</p>';
                });
                Util.logger('ERROR is: ', message);
                Ext.Msg.alert("Oops!", message, Ext.emptyFn);
            }
            
            
        };
        
        onSubmitDeinstallBtnTapCB = function() {
            Util.logger('In onSubmitDeinstallBtnTapCB()');
            
            if(Ext.is.iOS) {
                var vehicleRegField = Ext.get('deinstall_imei_field');
                vehicleRegField.down('input').dom.focus();
                vehicleRegField.down('input').dom.blur();
            }

            if(Ext.is.Android)
                window.KeyBoard.hideKeyBoard();
            
            var searchVal;
            // var vehicleRegFieldVal = Ext.getCmp('vehicle_reg_field').getValue();
            var imeiFieldVal = Ext.getCmp('deinstall_imei_field').getValue();
            var replaceUnitFieldVal = Ext.getCmp('replace_unit_field').isChecked();
            var notesFieldVal = Ext.getCmp('deinstall_notes_field').getValue();
            if(/*Ext.isEmpty(vehicleRegFieldVal) &&*/ Ext.isEmpty(imeiFieldVal)) {
                Ext.Msg.alert("Error", "Please enter Vehicle IMEI", Ext.emptyFn);
            } else if(imeiFieldVal != Ext.getCmp('deinstall_imei2_field').getValue()) {
                Ext.Msg.alert("Error", "Please re-enter Vehicle IMEI correctly", Ext.emptyFn);
            } else {
                // Util.logger('val reg is::', vehicleRegFieldVal);
                Util.logger('val imei is::', imeiFieldVal);
                Util.logger('val replace fitted is::', replaceUnitFieldVal);
            
				Util.deinstallVehicleRemotely(imeiFieldVal, replaceUnitFieldVal, notesFieldVal, confirmDeinstall, failDeinstall);
				/*
                searchVal = Util.searchVehicleRemotely(vehicleRegFieldVal, imeiFieldVal);

                if(Ext.isEmpty(searchVal)) {
                    Ext.Msg.alert("Error", "No record found", Ext.emptyFn);                    
                } else {
                    Util.logger('serachVal is::',searchVal);
                    Ext.Msg.confirm("Confirmation", "Are you sure you want to Deinstall this vehicle?", function(btn) {
                        if(btn == 'yes') {
                            searchVal.install_status = 'deinstalled';
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
            
            if(Ext.is.iOS) {
                var vehicleRegField = Ext.get('search_reg_field');
                vehicleRegField.down('input').dom.focus();
                vehicleRegField.down('input').dom.blur();
            }
            
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

                Util.searchVehicleRemotely(searchRegFieldVal, searchImeiFieldVal, search2ndrefFieldVal, updateSearchResults, failSearch);
            }
        };
        
		onBackSearchBtnTap = function() {
			searchResultsListComp.hide();
            searchMainPanel.show();
			searchBackBtn.hide();
            homePanel.hide();
            deinstallPanel.hide();
            helpPanel.hide();
        
		};
		
        //__VEHICLES action handlers start============================================================

        resetVehicleFormPanel = function() {
            installStep1FormBase.vehicle1 = Ext.ModelMgr.create({ id: 0, registration: '', make: '', model: '', colour: '', vin: '',
									vehicle_id: null, cl_state: 'insert', /*client_uid: Api.randomString(), */action: 'new'}, 'Vehicle1');
            installStep1Panel.load(installStep1FormBase.vehicle1);
            
            installStep2FormBase.vehicle2 = Ext.ModelMgr.create({ id: 0, imei: '', mileage: '', second_ref: '', vehicle_id: null,
                                    cl_state: 'insert', /*client_uid: Api.randomString(), */action: 'new'}, 'Vehicle2');
            installStep2Panel.load(installStep2FormBase.vehicle2);

            installStep3FormBase.vehicle3 = Ext.ModelMgr.create({ id: 0, /*extension: false, telematics: false, diagnostic: false, */
               install_completion: new Date(), installer_name: '', /*rep_name: '', */install_notes: '', install_refresh: '', vehicle_id: null,
							cl_state: 'insert', /*client_uid: Api.randomString(), */action: 'new'}, 'Vehicle3');
            installStep3Panel.load(installStep3FormBase.vehicle3);
        };

        copyToVehicleObject = function(vehicle, vehicleModel1, vehicleModel2, vehicleModel3) {
            Util.logger('In copyToVehicleObject()');
            var vehicleObj = vehicle;
			
			Util.logger('Vehicle1 is:', vehicleModel1);
			Util.logger('Vehicle2 is:', vehicleModel2);
			Util.logger('Vehicle3 is:', vehicleModel3);
			Util.logger('vehicle is:', vehicle);
			
			if(!Ext.isEmpty(vehicleModel1)) {
			
                vehicleObj.id = vehicleModel1.get('id');
                vehicleObj.registration = vehicleModel1.get('registration');
                vehicleObj.make = vehicleModel1.get('make');
                vehicleObj.model = vehicleModel1.get('model');
                vehicleObj.colour = vehicleModel1.get('colour');
                vehicleObj.vin = vehicleModel1.get('vin');
			}
			if(!Ext.isEmpty(vehicleModel2)) {
                vehicleObj.imei = vehicleModel2.get('imei');
                vehicleObj.mileage = vehicleModel2.get('mileage');
                vehicleObj.second_ref = vehicleModel2.get('second_ref');
			}
			if(!Ext.isEmpty(vehicleModel3)) {
/*
				vehicleObj.extension = vehicleModel3.get('extension');
                vehicleObj.telematics = vehicleModel3.get('telematics');
                vehicleObj.diagnostic = vehicleModel3.get('diagnostic');
*/
                vehicleObj.install_completion = vehicleModel3.get('install_completion');
                vehicleObj.installer_name = vehicleModel3.get('installer_name');
                // vehicleObj.rep_name = vehicleModel3.get('rep_name');
                vehicleObj.install_notes = vehicleModel3.get('install_notes');	
                vehicleObj.install_refresh = vehicleModel3.get('install_refresh');
			}
            
            // vehicleObj.vehicle_id = vehicleModel1.get('vehicle_id');
            // vehicleObj.cl_state = vehicleModel1.get('cl_state');
            return vehicleObj;
        };

		copyToVehicleModel = function(vehicle, vehicleModel) {
			if(!Ext.isEmpty(vehicle)) {
			
                vehicleModel.set('id', vehicle.id);
                vehicleModel.set('registration', vehicle.registration);
                vehicleModel.set('make', vehicle.make);
                vehicleModel.set('model', vehicle.model);
                vehicleModel.set('colour', vehicle.colour);
                vehicleModel.set('vin', vehicle.vin);
                vehicleModel.set('imei', vehicle.imei);
                vehicleModel.set('mileage', vehicle.mileage);
                vehicleModel.set('second_ref', vehicle.second_ref);
                vehicleModel.set('install_completion', vehicle.install_completion);
                vehicleModel.set('installer_name', vehicle.installer_name);
                vehicleModel.set('install_notes', vehicle.install_notes);
                vehicleModel.set('install_refresh', vehicle.install_refresh);
	
			}
			
			return vehicleModel;
		};

		copyToVehicleModel1 = function(vehicle, vehicleModel) {
			if(!Ext.isEmpty(vehicle)) {
			
                vehicleModel.set('id', vehicle.id);
                vehicleModel.set('registration', vehicle.registration);
                vehicleModel.set('make', vehicle.make);
                vehicleModel.set('model', vehicle.model);
                vehicleModel.set('colour', vehicle.colour);
                vehicleModel.set('vin', vehicle.vin);
			}
			
			return vehicleModel;
		};

		copyToVehicleModel2 = function(vehicle, vehicleModel) {
			if(!Ext.isEmpty(vehicle)) {
			
                vehicleModel.set('id', vehicle.id);
                vehicleModel.set('imei', vehicle.imei);
                vehicleModel.set('mileage', vehicle.mileage);
                vehicleModel.set('second_ref', vehicle.second_ref);
			}
			
			return vehicleModel;
		};

		copyToVehicleModel3 = function(vehicle, vehicleModel) {
			if(!Ext.isEmpty(vehicle)) {
			
                vehicleModel.set('id', vehicle.id);
                vehicleModel.set('install_completion', vehicle.install_completion);
                vehicleModel.set('installer_name', vehicle.installer_name);
                vehicleModel.set('install_notes', vehicle.install_notes);
                vehicleModel.set('install_refresh', vehicle.install_refresh);
			}
			
			return vehicleModel;
		};

        saveVehicle = function(vehicleParam, index, curr_state, action, callBack, failCallBack/*, syncCallBack*/) {
            Util.logger('In saveVehicle()');

            // vehicleParam.status = 'installed';
			// vehicleParam.install_status = true;
            vehicleParam.updated_at = Api.formatToUTCDate(new Date());
            vehicleParam.vehicle_id = index+1;
            vehicleParam.cl_state = Util.getItemState(curr_state, action);

            Util.logger('vehicleParam before saving:::', JSON.stringify(vehicleParam));

            Util.saveVehicleRemotely(vehicleParam, action, callBack, failCallBack/*, syncCallBack*/);

            cacheItemLocally(vehicleParam, index);
            // callBack();
    //        }
        };

        findVehicle = function(vehicleParam, index, curr_state, action, callBack, failCallBack/*, syncCallBack*/) {
            Util.logger('In findVehicle()');

            // vehicleParam.status = 'installed';
			// vehicleParam.install_status = true;
            vehicleParam.updated_at = Api.formatToUTCDate(new Date());
            vehicleParam.vehicle_id = index+1;
            vehicleParam.cl_state = Util.getItemState(curr_state, action);

            Util.logger('vehicleParam before saving:::', JSON.stringify(vehicleParam));

            Util.findVehicleRemotely(vehicleParam, action, callBack, failCallBack/*, syncCallBack*/);

            cacheItemLocally(vehicleParam, index);
            // callBack();
    //        }
        };

        saveVehicleInfo = function(vehicleParam, index, curr_state, action, callBack, failCallBack/*, syncCallBack*/) {
            Util.logger('In saveVehicleInfo()');

            // vehicleParam.status = 'installed';
			// vehicleParam.install_status = true;
            vehicleParam.updated_at = Api.formatToUTCDate(new Date());
            vehicleParam.vehicle_id = index+1;
            vehicleParam.cl_state = Util.getItemState(curr_state, action);

            Util.logger('vehicleParam before saving:::', JSON.stringify(vehicleParam));

            Util.saveVehicleInfoRemotely(vehicleParam, action, callBack, failCallBack/*, syncCallBack*/);

            cacheItemLocally(vehicleParam, index);
            // callBack();
    //        }
        };

        findVehicleInfo = function(vehicleParam, index, curr_state, action, callBack/*, syncCallBack, failCallBack*/) {
            Util.logger('In findVehicle()');

            // vehicleParam.status = 'installed';
			// vehicleParam.install_status = true;
            vehicleParam.updated_at = Api.formatToUTCDate(new Date());
            vehicleParam.vehicle_id = index+1;
            vehicleParam.cl_state = Util.getItemState(curr_state, action);

            Util.logger('vehicleParam before saving:::', JSON.stringify(vehicleParam));

            Util.findVehicleRemotely(vehicleParam, action, callBack/*, syncCallBack, failCallBack*/);

            cacheItemLocally(vehicleParam, index);
            // callBack();
    //        }
        };

        assignVehicle = function(vehicleParam, index, curr_state, action, callBack, failCallBack/*, syncCallBack*/) {
            Util.logger('In assignVehicle()');

            // vehicleParam.status = 'installed';
			// vehicleParam.install_status = true;
            vehicleParam.updated_at = Api.formatToUTCDate(new Date());
            vehicleParam.vehicle_id = index+1;
            vehicleParam.cl_state = Util.getItemState(curr_state, action);

            Util.logger('vehicleParam before saving:::', JSON.stringify(vehicleParam));

            Util.assignVehicleRemotely(vehicleParam, action, callBack, failCallBack/*, syncCallBack*/);

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
			
			if(!Ext.isEmpty(vehicle.make) && !Ext.isEmpty(vehicle.model) && !Ext.isEmpty(vehicle.colour) && !Ext.isEmpty(vehicle.vin))
				vehicle.cap_confirmed = true;
			else
				vehicle.cap_confirmed = false;
/*
			installStep1FormBase.vehicle1.set('registration', vehicle.registration);
			installStep1FormBase.vehicle1.set('make', vehicle.make);
			installStep1FormBase.vehicle1.set('model', vehicle.model);
			installStep1FormBase.vehicle1.set('colour', vehicle.colour);
			installStep1FormBase.vehicle1.set('vin', vehicle.vin);
*/
			newVehicle = vehicle;
			copyToVehicleModel1(newVehicle, installStep1FormBase.vehicle1);

			installStep1Panel.load(installStep1FormBase.vehicle1);
			
		};
		
		moveStep1NextStep2 = function(vehicle) {
			Util.logger('In moveStep1NextStep2');
			
			if(!Ext.isEmpty(vehicle.remote_error)) {
				Ext.Msg.alert("Save Installation Info", vehicle.remote_error, Ext.emptyFn);
				vehicle.remote_error = '';

			} else {

				newVehicle = vehicle;
				
				installStep1Panel.hide();
                installStep3Panel.hide();
                homePanel.hide();
                deinstallPanel.hide();
                searchPanel.hide();
                helpPanel.hide();
                installStep2Panel.show();
                installBackBtn.show();
	
				Util.logger('newVehicle is:', newVehicle);
	
			}
		};
		
		moveStep2NextStep3 = function(vehicle) {
			Util.logger('In moveStep2NextStep3');

			if(!Ext.isEmpty(vehicle.remote_error)) {
				Ext.Msg.alert("Assign IMEI", vehicle.remote_error, Ext.emptyFn);
				vehicle.remote_error = '';
			} else {
				newVehicle = vehicle;
				

				installStep1Panel.hide();
                installStep2Panel.hide();
                homePanel.hide();
                deinstallPanel.hide();
                searchPanel.hide();
                helpPanel.hide();
                installStep3Panel.show();
                installBackBtn.show();
	
				Util.logger('newVehicle is:', newVehicle);

                if(!Ext.isEmpty(newVehicle)) {
                    Util.refreshVehicleRemotely(newVehicle, 'add', refreshInstallStep3, failRefreshStep3Install);
                    
                }
	
			}
		};
		
		refreshInstallStep3 = function(vehicle) {
			Util.logger('In refreshInstallStep3');
			
			/*
			installStep1FormBase.vehicle1.set('registration', vehicle.registration);
			installStep1FormBase.vehicle1.set('make', vehicle.make);
			installStep1FormBase.vehicle1.set('model', vehicle.model);
			installStep1FormBase.vehicle1.set('colour', vehicle.colour);
			*/
			
			newVehicle = vehicle;
			installStep3FormBase.vehicle3.set('install_refresh', vehicle.install_refresh);

			installStep3Panel.load(installStep3FormBase.vehicle3);
			
			Util.logger('newVehicle is:', newVehicle);
			
		};
		
		
		moveStep3SubmitHome = function(vehicle) {
			Util.logger('In moveStep3SubmitHome');
            // BottomTabsInline.setActiveItem(installPanel);
            // showVehiclePanel.update(newVehicle);
            // showVehiclePanel.show();
			if(!Ext.isEmpty(vehicle.remote_error)) {
				Ext.Msg.alert("Save Vehicle", vehicle.remote_error, Ext.emptyFn);
				vehicle.remote_error = '';
			} else {
				Ext.Msg.alert("Save Vehicle", 'Vehicle info Saved successfully!',
				function() {
                    installStep1Panel.hide();
                    installStep2Panel.hide();
                    installStep3Panel.hide();
                    installBackBtn.hide();
                    deinstallPanel.hide();
                    searchPanel.hide();
                    helpPanel.hide();

                    resetVehicleFormPanel();
					// BottomTabsInline.setActiveItem(homePanel);
				});
			}
	
		
		};

		updateVehicleModel = function(vehicle) {
			Util.logger('In updateVehicleModel');
			
			newVehicle.imei = vehicle.imei;
			newVehicle.mileage = vehicle.mileage;
			newVehicle.second_ref = vehicle.second_ref;
			
		};
		
		confirmDeinstall = function(vehicle) {
			Util.logger('In confirmDeinstall');

			// if(!Ext.isEmpty(vehicle.remote_error)) {
				Ext.Msg.alert("Deinstall", vehicle.remote_error, Ext.emptyFn);
				vehicle.remote_error = '';
			// } else {
                Ext.Msg.alert("Deinstall", 'Vehicle Deinstalled successfully!',
				function() {
                    installStep1Panel.hide();
                    installStep2Panel.hide();
                    installStep3Panel.hide();
                    installBackBtn.hide();
                    searchPanel.hide();
                    helpPanel.hide();

                    deinstallMainPanel.reset();
/*
                    Ext.getCmp('deinstall_imei_field').reset();
                    Ext.getCmp('deinstall_imei2_field').reset();
                    Ext.getCmp('replace_unit_field').reset();
                    Ext.getCmp('deinstall_notes_field').reset();
*/
					// deinstallPanel.hide();
					// BottomTabsInline.setActiveItem(homePanel);
				});
			// }
            
		};
		
		updateSearchResults = function(vehicles) {
			Util.logger('In updateSearchResults');
			var vehicle = new Object(), searchResults = [];

			searchResults = vehicles;
			if(Ext.isEmpty(searchResults)) {
                Ext.Msg.alert("Error", "No record found", Ext.emptyFn);
            } else {
                Util.logger('searchResults is::', searchResults);
                /*


                    vehicle.id = 1;
                    vehicle.registration = 'MT11BKD';
                    vehicle.imei = 123456;
                    vehicle.make = 'ALFA ROMEO';
                    vehicle.model = 'GIULIETTA VELOCE JTDM-2';
                    vehicle.colour = 'WHITE';
                    vehicle.vin = 'ZAR94000007081769';
                    vehicle.second_ref = 'Me';
                    vehicle.install_completion = new Date();
                    // vehicle.client_uid = 'XYZ';

                    searchResults = [];
                    searchResults.push(vehicle);

                    vehicle = new Object();
                    vehicle.id = 2;
                    vehicle.registration = 'X847YCC';
                    vehicle.imei = 654321;
                    vehicle.make = 'MERCEDES';
                    vehicle.model = 'ML 270 CDI AUTO';
                    vehicle.colour = 'SILVER';
                    vehicle.vin = 'WDC1631132X734543';
                    vehicle.second_ref = 'You';
                    vehicle.install_completion = new Date();

                    searchResults.push(vehicle);
				*/
                
				//in case data is synced with server and requires update
                Util.logger('new searchResults is::', searchResults);

			}
				
                searchResultsListComp.getStore().loadData(searchResults, false);
                searchMainPanel.hide();
				searchResultsListComp.show();
				searchBackBtn.show();
                // showVehiclePanel.update(searchVal);
                // showVehiclePanel.show();
            
		};
		
		failSearchStep1Install = function(vehicle) {
			Util.logger('In failSearchStep1Install');
			
			// installStep1Panel.hide();
            // installStep3Panel.hide();
            // installStep2Panel.hide();
            installPanel.hide();
            installBackBtn.hide();
            homePanel.hide();
            deinstallPanel.hide();
            searchPanel.hide();
            helpPanel.hide();
            helpMainPanel.hide();
                
			vehicle.cl_state = 'step1';
			
			failForwardToLogin(vehicle);
		};
		
		failNextStep1Install = function(vehicle) {
			Util.logger('In failNextStep1Install');
			
			// installStep1Panel.hide();
            // installStep3Panel.hide();
            // installStep2Panel.hide();
            installPanel.hide();
            installBackBtn.hide();
            homePanel.hide();
            deinstallPanel.hide();
            searchPanel.hide();
            helpPanel.hide();
            helpMainPanel.hide();
            
			vehicle.cl_state = 'step1';
			
			failForwardToLogin(vehicle);
		};
		
		failNextStep2Install = function(vehicle) {
			Util.logger('In failNextStep2Install');
			
			// installStep1Panel.hide();
            // installStep3Panel.hide();
            // installStep2Panel.hide();
            installPanel.hide();
            installBackBtn.hide();
			homePanel.hide();
            deinstallPanel.hide();
            searchPanel.hide();
            helpPanel.hide();
            helpMainPanel.hide();
            
			vehicle.cl_state = 'step2';
			
			failForwardToLogin(vehicle);
		};
		
		failRefreshStep3Install = function(vehicle) {
			Util.logger('In failNextStep3Install');
			
			// installStep1Panel.hide();
            // installStep3Panel.hide();
            // installStep2Panel.hide();
            installPanel.hide();
            installBackBtn.hide();
            homePanel.hide();
            deinstallPanel.hide();
            searchPanel.hide();
            helpPanel.hide();
            helpMainPanel.hide();
            
			vehicle.cl_state = 'step3';
			
			failForwardToLogin(vehicle);
		};
		
		failSubmitStep3Install = function(vehicle) {
			Util.logger('In failSubmitStep3Install');
			
			// installStep1Panel.hide();
            // installStep3Panel.hide();
            // installStep2Panel.hide();
            installPanel.hide();
            installBackBtn.hide();
            homePanel.hide();
            deinstallPanel.hide();
            searchPanel.hide();
            helpPanel.hide();
            helpMainPanel.hide();
                
			vehicle.cl_state = 'step3';
			
			failForwardToLogin(vehicle);
		};
		
		failDeinstall = function(vehicle) {
			Util.logger('In failDeinstall');
			
			// installStep1Panel.hide();
            // installStep3Panel.hide();
            // installStep2Panel.hide();
            installPanel.hide();
            homePanel.hide();
            deinstallPanel.hide();
            searchPanel.hide();
            helpPanel.hide();
            helpMainPanel.hide();
            
			vehicle.cl_state = 'deinstall';
			
			failForwardToLogin(vehicle);
		};
		
		failSearch = function(vehicle) {
			Util.logger('In failSearch');
			
			// installStep1Panel.hide();
            // installStep3Panel.hide();
            // installStep2Panel.hide();
            installPanel.hide();
            homePanel.hide();
            deinstallPanel.hide();
            searchPanel.hide();
            helpPanel.hide();
            helpMainPanel.hide();

            searchMainPanel.hide();
			searchResultsListComp.hide();

			vehicle.cl_state = 'search';
			
			failForwardToLogin(vehicle);
		};
        
		failForwardToLogin = function(vehicle) {

			localStorage['tmp_vehicle'] = Ext.encode(vehicle);
			
			BottomTabsInline.hide();
            if(form === undefined)
				form = new Ext.form.FormPanel(loginFormBase);

			form.reset();
			form.show();
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