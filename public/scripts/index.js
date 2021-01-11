document.addEventListener("DOMContentLoaded", function() {

    /* REGISTER / LOGIN / TABLE PAGE VARIABLES */

    let formGroups = document.querySelectorAll('.register__form .form__group:not(:last-child)');

    // CONFIRMATION MESSAGE VARIABLES

    let loginMessage = document.querySelector('.login .message');
    let registerMessage = document.querySelector('.register .message');
    let tableMessage = document.querySelector('.table__selector .message');
    let passwordMessage = document.querySelector('.password .message');
    let passwordMessageText, passwordMessageClose;


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

    if(document.body.contains(loginMessage)) {
        let loginMessageText = loginMessage.querySelector('p');
        let loginMessageClose = loginMessage.querySelector('svg');

        confirmationMessage(loginMessage, loginMessageText, loginMessageClose);
    }

    if(document.body.contains(registerMessage)) {
        let registerMessageText = registerMessage.querySelector('p');
        let registerMessageClose = registerMessage.querySelector('svg');

        confirmationMessage(registerMessage, registerMessageText, registerMessageClose);
    }

    if(document.body.contains(tableMessage)) {
        let tableMessageText = tableMessage.querySelector('p');
        let tableMessageClose = tableMessage.querySelector('svg');

        confirmationMessage(tableMessage, tableMessageText, tableMessageClose);
    }

    if(document.body.contains(passwordMessage)) {
        passwordMessageText = passwordMessage.querySelector('p');
        passwordMessageClose = passwordMessage.querySelector('svg');
    }

    function confirmationMessage(el, elText, elClose, animate = true, top = 0) {
        if(elText.textContent.length > 0) {
            el.style.opacity = "1";
            elClose.style.pointerEvents = "initial";

            if(animate) {
                setTimeout(() => {
                    el.animate([
                        {top: top, opacity: 0}
                    ], {
                        duration: 500,
                        fill: "forwards"
                    });

                    el.style.pointerEvents = "none";
                    setTimeout(() => {
                        elText.textContent = '';
                    }, 500);
                } , 3000)
            }

        }

        elClose.addEventListener('click', () => {
            el.style.opacity = "0";
            setTimeout(() => {
                elText.textContent = '';
            }, 500);
            elClose.style.pointerEvents = "none";
        });
    }

    /* HOME PAGE NAV DROPDOWN */

    if(document.body.contains(navDropdownBtn)) {
        navDropdownBtn.addEventListener("click", toggleDropdown);
    }

    function toggleDropdown() {
        navDropdownContent.classList.toggle("show");
        navDropdown.classList.toggle("rotate");
        navDropdownList.classList.add("animated");
    }

    /* HOME PAGE */

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

            getCardInfo();

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
        let modalForm = document.getElementById('itemform');
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
            modalForm.setAttribute('action', '/add/' + itemType);

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
                itemID = button.parentElement.parentElement.querySelector('.item-id').getAttribute('itemID');
                open(confirmContainer, confirmContent);
            })
        });

        confirmMask.addEventListener('click', () => {
            close(confirmContainer, confirmContent);
        })

        confirmYes.addEventListener('click', () => {
            close(confirmContainer, confirmContent)
            confirmForm.setAttribute('action', '/delete/' + itemType + '/' + itemID);
            confirmForm.submit();
        })

        confirmNo.addEventListener('click', () => {
            close(confirmContainer, confirmContent)
        })

        /* PASSWORD SHOW FUNCTIONALITY */

        let tableRow, protectedFields, currentField;
        let tableShowButtons = document.querySelectorAll('.table .show');
        let passwordContainer = document.querySelector('.password');
        let passwordMask = passwordContainer.querySelector('.password__mask');
        let passwordContent = passwordContainer.querySelector('.password__container');
        let passwordBox = passwordContent.querySelector('.password__box');
        let textBox =  passwordBox.querySelector('p');
        let passwordClose = passwordContent.querySelector('svg');
        let passwordField = passwordContent.querySelector('input[type=password]');
        let passwordSubmit = passwordContent.querySelector('.password__show-btn');

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        }

        async function fetchPassword() {
            let url =  `/password/${itemType}`;

            options.body = JSON.stringify({
                password: passwordField.value,
                itemID: itemID
            })

            if(protectedFields.length > 1) url += '/' + currentField;

            const response = await fetch(url, options);
            return await response.json();
        }

        function showPassword(password) {
            if(password !== undefined) {
                textBox.innerText = password;
                textBox.style.opacity = '1';
                passwordField.value = '';
            }
        }

        function clearFields() {
            textBox.innerText = '';
            passwordField.value = '';

        }

        tableShowButtons.forEach(button => {
            button.addEventListener('click', () => {
                tableRow = button.parentElement.parentElement;
                protectedFields = tableRow.querySelectorAll('.show');
                itemID = tableRow.querySelector('.item-id').getAttribute('itemID');

                if(protectedFields.length > 1) currentField = button.parentElement.getAttribute('field');

                open(passwordContainer, passwordContent);
            });
        });

        passwordMask.addEventListener('click', () => {
            close(passwordContainer, passwordContent);
            textBox.style.opacity = '0';
            clearFields();
        });

        passwordClose.addEventListener('click', () => {
            close(passwordContainer, passwordContent);
            textBox.style.opacity = '0';
            clearFields();
        });

        passwordSubmit.addEventListener('click', () => {
            fetchPassword()
                .then(r => {
                    if(r.message !== undefined) passwordMessageText.innerText = r.message;
                    confirmationMessage(passwordMessage, passwordMessageText, passwordMessageClose);
                    showPassword(r.password);
                })
        });

        passwordField.addEventListener('keydown', (e) => {
            if(e.key === 'Enter') {
                fetchPassword()
                    .then(r => {
                        if(r.message !== undefined) passwordMessageText.innerText = r.message;
                        showPassword(r.password);
                    })
            }
        });
    }
});
