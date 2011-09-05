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
                {name: 'password', type: 'string'},
                {name: 'password2', type: 'string'}
            ],
            validations: [
                {type: 'presence', name: 'username', message: "Email is required"},
                {type: 'presence', name: 'password', message: "Password is required"},
                {type: 'format',   name: 'username', matcher: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/, message:"Wrong Email Format"}
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
            
            var homePanel;
            
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
                iconCls: 'info',
                // layout: 'card',
                items: [ homeMainPanel ],
                dockedItems: [ homeNavBar ]
            });
            
            
            //__HOME panels layout end==================================================================================
            
            Ext.regModel('Vehicle1', { 
                fields: [
                    {name: 'id', type: 'int'},
                    {name: 'registration', type: 'string'},
                    {name: 'make', type: 'string'},
                    {name: 'model', type: 'string'},
                    {name: 'colour', type: 'string'},
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
                    {name: 'extension', type: 'boolean'},
                    {name: 'telematics', type: 'boolean'},
                    {name: 'diagnostic', type: 'boolean'},
                    {name: 'install_completion', type: 'date'},
                    {name: 'installer_name', type: 'string'},
                    {name: 'rep_name', type: 'string'},
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

            installStep1FormBase = Install.createInstallStep1Panel(onNextStep1InstallBtnTapCB);
            installStep1Panel = new Ext.form.FormPanel(installStep1FormBase);
            installStep2FormBase = Install.createInstallStep2Panel(onNextStep2InstallBtnTapCB);
            installStep2Panel = new Ext.form.FormPanel(installStep2FormBase);
            installStep3FormBase = Install.createInstallStep3Panel(onSubmitStep3InstallBtnTapCB);
            installStep3Panel = new Ext.form.FormPanel(installStep3FormBase);
            
            installConfirmPanel = new Ext.Panel({
                // scroll: 'vertical',
                fullscreen: true,
                hidden: true,
                id: 'confirm_screen_html',
                html: [
                    '<div class="settings_page_text" style="padding-bottom: 60px">',
                    '</div>'
                ]
            });
            
            resetVehicleFormPanel();
            
            installPanel = new Ext.Panel({
                title: 'Install',
                id: 'tab'+panelIndex.install+1,
                cls: 'card' + (panelIndex.install+1) + ' install_panel',
                iconCls: 'info',
                // layout: 'card',
                items: [ installStep1Panel, installStep2Panel, installStep3Panel, installConfirmPanel ],
                dockedItems: [ installNavBar ]
            });
            
            deinstallNavBar = new Ext.Toolbar({
                ui: 'dark',
                dock: 'top',
                title: 'OnBoard Fitters'
            });

            deinstallMainPanel = Deinstall.createDeinstallMainPanel();
            
            deinstallPanel = new Ext.Panel({
                title: 'Deinstall',
                id: 'tab'+panelIndex.deinstall+1,
                cls: 'card' + (panelIndex.deinstall+1) + ' deinstall_panel',
                iconCls: 'info',
                // layout: 'card',
                items: [ deinstallMainPanel ],
                dockedItems: [ deinstallNavBar ]
            });
            
            searchNavBar = new Ext.Toolbar({
                ui: 'dark',
                dock: 'top',
                title: 'OnBoard Fitters'
            });

            searchMainPanel = Search.createSearchMainPanel();
            
            searchPanel = new Ext.Panel({
                title: 'Search',
                id: 'tab'+panelIndex.search+1,
                cls: 'card' + (panelIndex.search+1) + ' search_panel',
                iconCls: 'info',
                // layout: 'card',
                items: [ searchMainPanel ],
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
                        
                        var newCardTitle = (newCard.title == 'Journal') ? 'journals' : newCard.title.toLowerCase();
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
        
                    Util.logger('After updateRecord vehicle1::', installStep1FormBase.vehicle1);
                    
                }
            } else {
                Ext.each(errors.items, function(rec, i) {
                    message += '<p class="loginErrorMsg">'+rec.message+'</p>';
                });
                Util.logger('ERROR is: ', message);
            }
            
            // BottomTabsInline.setActiveItem(installPanel);
            installStep1Panel.hide();
            installStep3Panel.hide();
            installStep2Panel.show();
            installBackBtn.show();
            
        };
        
        onNextStep2InstallBtnTapCB = function() {
            Util.logger('In onNextStep2InstallBtnTapCB()');

            var current_state = 'select';
            var model = Ext.ModelMgr.create(installStep2Panel.getValues(), 'Vehicle2');
            var message = "", errors = model.validate();
            
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
                    
                }
            } else {
                Ext.each(errors.items, function(rec, i) {
                    message += '<p class="loginErrorMsg">'+rec.message+'</p>';
                });
                Util.logger('ERROR is: ', message);
            }
            
            // BottomTabsInline.setActiveItem(installPanel);
            installStep1Panel.hide();
            installStep2Panel.hide();
            installStep3Panel.show();
            installBackBtn.show();
            
        };
        
        onSubmitStep3InstallBtnTapCB = function() {
            Util.logger('In onSubmitStep3InstallBtnTapCB()');

            var current_state = 'select';
            var model = Ext.ModelMgr.create(installStep3Panel.getValues(), 'Vehicle3');
            var message = "", errors = model.validate();
            
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
                    
                }
            } else {
                Ext.each(errors.items, function(rec, i) {
                    message += '<p class="loginErrorMsg">'+rec.message+'</p>';
                });
                Util.logger('ERROR is: ', message);
            }
            
            // BottomTabsInline.setActiveItem(installPanel);
            installStep1Panel.hide();
            installStep2Panel.hide();
            installStep3Panel.hide();
            installBackBtn.hide();
            
            installConfirmPanel.show();
            
        };
        
        //__VEHICLES action handlers start============================================================

        function resetVehicleFormPanel() {
            installStep1FormBase.vehicle1 = Ext.ModelMgr.create({ id: null, registration: '', make: '', model: '', colour: '', vehicle_id: null,
                                    cl_state: 'insert', /*client_uid: Api.randomString(), */action: 'new'}, 'Vehicle1');
            installStep1Panel.load(installStep1FormBase.vehicle1);
            
            installStep2FormBase.vehicle2 = Ext.ModelMgr.create({ id: null, imei: '', mileage: '', second_ref: '', vehicle_id: null, 
                                    cl_state: 'insert', /*client_uid: Api.randomString(), */action: 'new'}, 'Vehicle2');
            installStep2Panel.load(installStep2FormBase.vehicle2);

            installStep3FormBase.vehicle3 = Ext.ModelMgr.create({ id: null, extension: false, telematics: false, diagnostic: false, 
                                    install_completion: new Date(), installer_name: '', rep_name: '', notes: '', vehicle_id: null, cl_state: 'insert', 
                                    /*client_uid: Api.randomString(), */action: 'new'}, 'Vehicle3');
            installStep3Panel.load(installStep3FormBase.vehicle3);
        };

        
        registerLoginHandler();
        
        // if(Ext.isEmpty(Api.getLocalStorageProp('account_key'))) {
/*            
            form = new Ext.form.FormPanel(loginFormBase);
            form.show();
*/
            renderAllWithDataCB();
/*
        } else {
            renderAllWithDataCB();
        }
*/
	}
});