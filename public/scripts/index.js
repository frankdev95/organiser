document.addEventListener("DOMContentLoaded", function() {

    /* NAV VARIABLES*/

    let navDropdownBtn = document.querySelector(".dropdown__btn-item");
    let navDropdownContent = document.querySelector(".dropdown__content");
    let navDropdownList = document.querySelector(".dropdown__list");
    let navDropdown = document.querySelector(".dropdown");

    /* ORGANISER VARIABLES */

    let cards = document.querySelectorAll(".organiser__item")

    navDropdownBtn.addEventListener("click", toggleDropdown);

    for(let i = cards.length -1; i >= 0; i--) {
        cards[i].style.width = 200 + i * 50 + "px";
    }

    function toggleDropdown() {
        navDropdownContent.classList.toggle("show");
        navDropdown.classList.toggle("rotate");
        navDropdownList.classList.add("animated");
    }

    function slipCard(card) {
        card.style.width = "300px";
    }
})

class Card {
    constructor(name, description, borderCol) {
    }
}
