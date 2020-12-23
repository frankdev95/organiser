document.addEventListener("DOMContentLoaded", function() {

    /* REGISTER / LOGIN PAGE VARIABLES */

    let formGroups = document.querySelectorAll('.register__form .form__group:not(:last-child)');
    let loginMessage = document.querySelector('.login .message');
    let loginMessageText = document.querySelector('.login .message p');
    let loginMessageClose = document.querySelector('.login .message svg');

    /* NAV VARIABLES */

    let navDropdownBtn = document.querySelector(".dropdown__btn-item");
    let navDropdownContent = document.querySelector(".dropdown__content");
    let navDropdownList = document.querySelector(".dropdown__list");
    let navDropdown = document.querySelector(".dropdown");

    /* ORGANISER VARIABLES */

    let cards = document.querySelectorAll(".organiser__item")

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

    /* LOGIN PAGE MESSAGE */

    if(document.body.contains(loginMessage)) {
        if(loginMessageText.textContent.length > 0) {
            loginMessage.style.opacity = "1";
            loginMessageClose.style.pointerEvents = "initial";
        } else {
            loginMessage.style.opacity = "0";
            loginMessageClose.style.pointerEvents = "none";
        }

        loginMessageClose.addEventListener('click', () => {
            loginMessage.style.opacity = "0";
            loginMessageClose.style.pointerEvents = "none";
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
})
