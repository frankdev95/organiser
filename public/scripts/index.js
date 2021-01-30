document.addEventListener("DOMContentLoaded", function() {

    /* REGISTER / LOGIN / TABLE PAGE VARIABLES */

    let formGroups = document.querySelectorAll('.register__form .form__group:not(:last-child)');

    /* NAV VARIABLES */

    let navDropdownBtn = document.querySelector(".dropdown__btn-item");
    let navDropdownContent = document.querySelector(".dropdown__content");
    let navDropdownList = document.querySelector(".dropdown__list");
    let navDropdown = document.querySelector(".dropdown");

    /* ORGANISER VARIABLES */

    let organiser = document.querySelector('.organiser');
    let cardExpandBtn = document.querySelectorAll('.expand__svg');

    /* ITEM PAGE VARIABLES */

    let itemSubmitBtn = document.querySelector('.criteria .btn');

    /* REGEX PATTERNS */

    const patterns = {
        name: /^[a-z ,.'-]+$/i,
        email: /^([a-z\d."+\-_]+)@([a-z\d-.[\]]+)\.([a-z\d]{2,8})(\.[a-z]+)?$/i,
        username: /^[a-z\d]{5,12}$/i,
        password: /^(?=.*[a-z])(?=.*[\d])(?=.*[\W])[a-z\d\W]{8,25}$/i,
    }

    function open(container, component) {
        container.style.opacity = "1";
        container.style.pointerEvents = "initial";
        component.style.transform = "translate(-50%, -50%) scale(1)";
    }

    function close(container, component) {
        container.style.opacity = "0";
        container.style.pointerEvents = "none";
        component.style.transform = "translate(-50%, -50%) scale(0)";
    }

    /* REGISTER PAGE TOOLTIP */

    formGroups.forEach((group) => {
        let setProperty;
        const input = group.querySelector('input');
        const tooltip = group.querySelector('.tooltip');

        group.addEventListener('mouseover', () => {
            setProperty = setTimeout(() =>   tooltip.style.setProperty('display', 'initial', 'important'), 700);
        });

        group.addEventListener('mouseout', () => {
            clearTimeout(setProperty);
            tooltip.style.setProperty('display', 'none', 'important');
        });

        input.addEventListener('focus', () => {
            clearTimeout(setProperty);
            tooltip.style.setProperty('display', 'none', 'important');
        });

        input.addEventListener('keyup', registerValidate);
    });

    function registerValidate() {
        const regex = patterns[this.name];
        const value = this.value;

        if(regex.test(value)) {
            this.style.border = '2px solid #28df99';
        } else {
            this.style.border = '2px solid #ff9642';
        }

        if(value === '') {
            this.style.border = '1px solid #868686';
        }
    }

    /* LOGIN / REGISTER / TABLE PAGE MESSAGES */

    // CONFIRMATION MESSAGE VARIABLES

    let loginMessage = document.querySelector('.login .message');
    let registerMessage = document.querySelector('.register .message');
    let tableMessage = document.querySelector('.table__selector .message');
    let passwordMessage = document.querySelector('.password .message');
    let settingsMessage = document.querySelector('.settings .message');
    let passwordMessageShow = true;
    let allowClick, animateMessage, removeMessage, clearText;

    if(document.body.contains(loginMessage)) confirmationMessage(loginMessage);
    if(document.body.contains(registerMessage)) confirmationMessage(registerMessage);
    if(document.body.contains(settingsMessage)) confirmationMessage(settingsMessage);
    if(document.body.contains(tableMessage)) confirmationMessage(tableMessage);
    if(document.body.contains(passwordMessage)) confirmationMessage(passwordMessage);

    function confirmationMessage(el, animateTop = true, top = 0) {
        let elText = el.querySelector('p');

        clearTimeout(allowClick);
        allowClick = setTimeout(() => passwordMessageShow = true, 4000);

        if(elText.textContent.length > 0 && passwordMessageShow)  {
            passwordMessageShow = false;

            clearTimeout(animateMessage);
            clearTimeout(removeMessage);
            clearTimeout(clearText);

            el.style.opacity = "1";

            if(animateTop) {
                animateMessage = setTimeout(() => {
                    el.animate([
                        {top: top, opacity: 0}
                    ], {
                        duration: 500,
                        fill: "forwards"
                    });

                } , 3000)
            }

            removeMessage = setTimeout(() => {
                if(!animateTop) {
                    el.style.opacity = 0;
                    clearText = setTimeout(() => {
                        elText.textContent = '';
                        passwordMessageShow = true;
                    }, 500);
                } else {
                    passwordMessageShow = true;
                    elText.textContent = '';
                };

                clearTimeout(allowClick);
            }, 3500);

        }
    }



    /* HOME PAGE NAV DROPDOWN */

    if(document.body.contains(navDropdownBtn)) navDropdownBtn.addEventListener("click", toggleDropdown);

    function toggleDropdown() {
        navDropdownContent.classList.toggle("show");
        navDropdown.classList.toggle("rotate");
        navDropdownList.classList.add("animated");
    }

    /* HOME PAGE */

    /* SETTINGS MODAL HIDE / SHOW FUNCTIONALITY*/
    let settingsBtn = document.querySelector('.profile__settings');
    let settingsMask = document.querySelector('.settings__mask');
    let settingsContent = document.querySelector('.settings__content');

    if(document.body.contains(settingsBtn)) {
        let settingsCloseBtn = settingsContent.querySelector('svg');

        settingsBtn.addEventListener('click', () => {
            open(settingsMask, settingsContent);
        });

        settingsMask.addEventListener('click', () => {
            close(settingsMask, settingsContent);
        });

        settingsCloseBtn.addEventListener('click', () => {
            close(settingsMask, settingsContent);
        });
    }

    /* ORGANISER EXPAND FUNCTIONALITY */

    if(document.body.contains(organiser)) {
        let clicked = false;
        cardExpandBtn.forEach((btn, i) => {
            let organiserItem = btn.parentElement.parentElement.parentElement.parentElement;
            let contentToHide = organiserItem.querySelectorAll('.content__hide');
            let statContainer = organiserItem.querySelector('.fig__statistics');
            let statCards = statContainer.querySelectorAll('.stat__card');
            let itemHeight = organiserItem.offsetHeight;
            let span;
            organiserItem.style.top = 184.266 + (itemHeight * i) + 'px';
            organiserItem.style.zIndex = `-${i}`;
            organiserItem.style.transition = 'transform .2s';

            // STAT CARDS INFORMATION
            async function getCardInfo() {

                for(let i = 0; i < statCards.length; i++) {
                    let card = statCards[i];

                    let type = card.parentElement.getAttribute('type');

                    if(card.classList.contains('multiple')) {
                        span = card.querySelectorAll('span');
                        let url = `get/${type}/multi`;

                        const response = await fetch(url);
                        const data = await response.json();

                        for(let i = 0; i < span.length; i++) {
                            if(span[i].classList.contains('state')) {
                                span[i].innerText = data[`info${i}`];
                                let indicator = document.createElement('span');

                                if(i === 0) indicator.classList.add('stat__active');
                                if(i === 1) indicator.classList.add('stat__inactive');

                                span[i].appendChild(indicator);
                            } else {
                                span[i].innerText = data[`info${i}`];
                            }

                        }

                    } else {
                        span = card.querySelector('span');
                        let info = span.getAttribute('type');
                        let url = `get/${type}/${info}`;

                        const response = await fetch(url);
                        const data = await response.json();
                        span.innerText = data['info'];
                    }
                }
            }

            getCardInfo()
                .then()
                .catch(err => {
                    console.log(err);
                });

            btn.addEventListener('click', () => {
                clicked = !clicked;

                if(clicked) {
                    let timer = 400;

                    Object.assign(organiserItem.style, {
                        transition: 'top .2s .2s, height .2s .4s',
                        top: '18.3%',
                        height: '40rem',
                    });

                    statContainer.style.display = 'grid';
                    statCards.forEach(card => {
                       setTimeout(() => {
                           card.style.opacity = '1';
                       }, timer);
                       timer += 150;
                    });

                    contentToHide.forEach(el => {
                        el.style.transition = "opacity .3s .4s";
                        el.style.opacity = '0';
                    });

                } else {
                    Object.assign(organiserItem.style, {
                            transition: 'transform .2s, height .2s, top .2s .4s',
                            top: 184.266 + (itemHeight * i) + 'px',
                            height: '10rem'
                    });

                    statContainer.style.display = 'none';
                    statCards.forEach(card => {
                        card.style.opacity = '0';
                    });

                    contentToHide.forEach(el => {
                        el.style.opacity = 'initial';

                        setTimeout(() => {
                            if(el.tagName === 'H1') {
                                el.style.transition = "all .2s";
                            } else if(el.tagName === 'H3') {
                                el.style.transition = "all .2s .2s";
                            } else {

                            }
                        }, 400);

                    });
                }

                organiserItem.classList.toggle('organiser__item');
                organiserItem.classList.toggle('organiser__item--hovered');
                organiserItem.classList.toggle('organiser__content--hovered');

                cardExpander(organiserItem, clicked);
            })
        })

    }

    function cardExpander(item, clicked) {
        cardExpandBtn.forEach((btn) => {
            let organiserItem = btn.parentElement.parentElement.parentElement.parentElement;
            if(organiserItem !== item) {
                if(clicked) {
                    organiserItem.style.transition = 'transform .2s';
                    organiserItem.style.transform = 'translateX(-100%)'
                } else {
                    organiserItem.style.transition = 'transform .2s .4s';
                    organiserItem.style.transform = 'translateX(0)';
                }
            }}
        )
    }

    /* ITEM PAGE */

    if(document.contains(document.querySelector('.main--table'))) {

        /* MODAL */

        let modalWrap = document.querySelector('.main--table .modal__wrap');
        let modalMask = modalWrap.querySelector('.modal__mask');
        let modal = modalWrap.querySelector('.modal');
        let modalForm = document.getElementById('add-item-form');
        let modalCloseBtn = modal.querySelector('svg');

        itemSubmitBtn.addEventListener('click', () => {
           open(modalWrap, modal);
        });

        modalMask.addEventListener('click', () => {
            close(modalWrap, modal);
        });

        modalCloseBtn.addEventListener('click', () => {
            close(modalWrap, modal);
        });
        
        /* SELECTOR DROP DOWN / MODAL CONFIGURATION*/

        let dropdown = document.querySelector('.main--table .select');
        let tableHead = document.querySelector('.table thead tr');
        let tableSelector = document.querySelector('.table__selector');
        let selectorForm = document.querySelector('.selector__form');
        let itemType = document.querySelector('.main--table').getAttribute('type');

        let accounts =  new Item([
            {name: 'Name', type: 'text'}, {name: 'Type', type: 'text'}, {name: 'Account Holder', type: 'text'},
            {name: 'Company', type: 'text'}, {name: 'URL', type: 'text'}, {name: 'Username', type: 'text'},
            {name: 'Password', type: 'password'}, {name: 'states', type: 'select'}
        ], modalForm, tableHead);

        let banking = new Item([
            {name: 'Name', type: 'text'}, {name: 'Type', type: 'text'}, {name: 'Account Holder', type: 'text'},
            {name: 'Bank', type: 'text'}, {name: 'URL', type: 'text'}, {name: 'Username', type: 'text'},
            {name: 'Password(s)', type: 'password'}
        ], modalForm, tableHead);

        let bills = new Item([
            {name: 'Name', type: 'text'}, {name: 'Type', type: 'text'}, {name: 'Creditor', type: 'text'},
            {name: 'Amount', type: 'number'}, {name: 'Date Due', type: 'date'}, {name: 'status', type: 'select'}
        ], modalForm, tableHead);
        let cards = new Item([
            {name: 'Name', type: 'text'}, {name: 'Type', type: 'text'}, {name: 'Account Holder', type: 'text'},
            {name: 'Card Provider', type: 'text'}, {name: 'Card Number', type: 'number'},
            {name: 'Expiry Date', type: 'date'}, {name: 'Security ID', type: 'password'},
            {name: 'Pin', type: 'password'}, {name: 'states', type: 'select'}
        ], modalForm, tableHead);

        loadItemDetails(itemType);

        dropdown.addEventListener('change', (e) => {
            refreshElements();
            selectorForm.setAttribute('action', '/view/' + e.target.value.toLowerCase());
            selectorForm.submit();
        });

        function loadItemDetails(itemType) {

            let item = itemType[0].toUpperCase() + itemType.slice(1, -1);
            dropdown.value = itemType;

            tableSelector.querySelector('.criteria .btn').innerHTML = `Add ${item}`;
            modal.querySelector('h1').innerText = item;
            modalForm.setAttribute('action', `/${itemType}`);

            if(itemType === 'accounts') {
                accounts.createModalElements();
                accounts.createTableRows();
                accounts.drawElements();
            } else if(itemType === 'banks') {
                banking.createModalElements();
                banking.createTableRows();
                banking.drawElements();
            } else if(itemType === 'bills') {
                bills.createModalElements();
                bills.createTableRows();
                bills.drawElements();
            } else {
                cards.createModalElements();
                cards.createTableRows();
                cards.drawElements();
            }

            if(document.contains(modal.querySelector('svg.password__add-btn'))) {
                let i = 1   ;
                modal.querySelector('svg.password__add-btn').addEventListener('click', () => {
                    if(i < 2) {
                        i++;
                        addPasswordInputField();
                    } else {
                        i = 2;
                    }
                });

                function addPasswordInputField() {
                    let input = document.createElement('input');
                    let formGroup = document.createElement('div');
                    let svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
                    let use = document.createElementNS('http://www.w3.org/2000/svg','use');
                    let lastChild = modalForm.children[modalForm.children.length-1]

                    formGroup.setAttribute('class', 'form__group additional-pw');
                    formGroup.setAttribute('name', 'password' + i);

                    input.setAttribute('class', 'form__input');
                    input.setAttribute('name', 'password')
                    input.setAttribute('placeholder', 'Password ' + i);
                    input.setAttribute('autocomplete', 'off');
                    input.setAttribute('type', 'password')

                    use.setAttributeNS('http://www.w3.org/1999/xlink','xlink:href', '/images/sprite.svg#icon-circle-with-cross');
                    svg.setAttribute('class', 'password__add-btn');

                    Object.assign(svg.style,  {
                        width: '.8rem',
                        height: '.8rem',
                        top: '.3rem',
                        right: '.2rem'
                    });

                    svg.addEventListener('click', () => {
                        input.remove();
                        svg.remove();
                        i--;
                    })

                    svg.appendChild(use);
                    formGroup.appendChild(svg);
                    formGroup.appendChild(input);
                    modalForm.insertBefore(formGroup, lastChild);

                }
            }
        }
        
        function refreshElements() {
            modal.querySelector('h1').innerText = "";
            modalForm.innerHTML = "";
            tableHead.innerHTML = "";
        }

        /* CONFIRMATION MESSAGE / DELETE ITEM FUNCTIONALITY */

        let deleteButtons = document.querySelectorAll('.table .delete-btn');
        let confirmContainer = document.querySelector('.confirmation');
        let confirmMask = confirmContainer.querySelector('.confirmation__mask');
        let confirmContent = confirmContainer.querySelector('.confirmation__content');
        let confirmYes = confirmContent.querySelector('.confirmation__buttons button:nth-child(1)');
        let confirmNo = confirmContent.querySelector('.confirmation__buttons button:nth-child(2)');
        let confirmForm = confirmContent.querySelector('form');
        let itemID;

        deleteButtons.forEach(button => {
            button.addEventListener('click', () => {
                itemID = button.getAttribute('itemID');
                open(confirmContainer, confirmContent);
            })
        });

        confirmMask.addEventListener('click', () => {
            close(confirmContainer, confirmContent);
        })

        confirmYes.addEventListener('click', () => {
            close(confirmContainer, confirmContent)
            confirmForm.setAttribute('action', `/${itemType}/${itemID}?_method=DELETE`);
            confirmForm.submit();
        })

        confirmNo.addEventListener('click', () => {
            close(confirmContainer, confirmContent)
        })

        /* PASSWORD SHOW FUNCTIONALITY */

        let passwordShowButtons = document.querySelectorAll('.table .show');
        let passwordMask = document.querySelector('.password__mask');
        let passwordContent = document.querySelector('.password__container');
        let passwordTextBox =  document.querySelector('.password__box p');
        let passwordClose = passwordContent.querySelector('svg');
        let passwordField = passwordContent.querySelector('input[type=password]');
        let passwordSubmit = passwordContent.querySelector('.password__show-btn');
        let currentField;

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        }

        async function fetchPassword() {
            let url =  `${itemType}/${itemID}`;

            options.body = JSON.stringify({
                password: passwordField.value,
                field: currentField,
            })

            const response = await fetch(url, options);
            return await response.json();
        }

        function showPassword(password) {
            if(Array.isArray(password)) {
                password.forEach(password => {
                    if(password !== undefined) {
                        passwordTextBox.innerText += `${password}\n`;
                    }
                });
            } else {
                if(password !== undefined) {
                    passwordTextBox.innerText = password;
                }
            }
            passwordTextBox.style.opacity = '1';
            passwordField.value = '';

        }

        function clearFields() {
            passwordMessage.style.opacity = 0;
            passwordMessageShow = true;
            passwordTextBox.style.opacity = 0;
            passwordTextBox.innerText = '';
            passwordField.value = '';

        }

        passwordShowButtons.forEach(button => {
            button.addEventListener('click', () => {
                if(itemType === 'cards') { // bills items have multiple protected fields
                    currentField = button.getAttribute('field'); // receive the current field to be shown
                }
                itemID = button.getAttribute('itemID');
                open(passwordMask, passwordContent);
            });
        });

        passwordMask.addEventListener('click', () => {
            close(passwordMask, passwordContent);
            clearFields();
        });

        passwordClose.addEventListener('click', () => {
            close(passwordMask, passwordContent);
            clearFields();
        });

        passwordSubmit.addEventListener('click', () => {
            fetchPassword()
                .then(r => {
                    if(r.message) passwordMessage.querySelector('p').innerText = r.message;
                    confirmationMessage(passwordMessage, false);
                    showPassword(r.password);
                })
        });

        passwordField.addEventListener('keydown', (e) => {
            if(e.key === 'Enter') {
                fetchPassword()
                    .then(r => {
                        if(r.message) passwordMessage.querySelector('p').innerText = r.message;
                        confirmationMessage(passwordMessage);
                        showPassword(r.password);
                    })
            }
        });
    }
});
