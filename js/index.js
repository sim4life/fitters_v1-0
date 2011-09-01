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
            /*
            installPanel = new Ext.Panel();
            deinstallPanel = new Ext.Panel();
            searchPanel = new Ext.Panel();
            
            helpPanel = new Ext.Panel();
            */

            installNavBar = new Ext.Toolbar({
                ui: 'dark',
                dock: 'top',
                title: 'OnBoard Fitters'
            });

            installStep1Panel = Install.createInstallStep1Panel(onNextStep1InstallBtnTapCB);
            installStep2Panel = Install.createInstallStep2Panel(onNextStep2InstallBtnTapCB);
            installStep3Panel = Install.createInstallStep3Panel();
            
            installPanel = new Ext.Panel({
                title: 'Install',
                id: 'tab'+panelIndex.install+1,
                cls: 'card' + (panelIndex.install+1) + ' install_panel',
                iconCls: 'info',
                // layout: 'card',
                items: [ installStep1Panel, installStep2Panel, installStep3Panel ],
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


        onNextStep1InstallBtnTapCB = function() {
            Util.logger('In onNextStep1InstallBtnTapCB()');
            
            // BottomTabsInline.setActiveItem(installPanel);
            installStep1Panel.hide();
            installStep3Panel.hide();
            installStep2Panel.show();
            
        };
        
        onNextStep2InstallBtnTapCB = function() {
            Util.logger('In onNextStep2InstallBtnTapCB()');
            
            BottomTabsInline.setActiveItem(installPanel);
            installStep1Panel.hide();
            installStep2Panel.hide();
            installStep3Panel.show();
            
        };
        
        registerLoginHandler();
        
        if(Ext.isEmpty(Api.getLocalStorageProp('account_key')) || Api.getLocalStorageProp('auto_login') == 0) {
            
            form = new Ext.form.FormPanel(loginFormBase);
            form.show();
        } else {
            renderAllWithDataCB();
        }

	}
});