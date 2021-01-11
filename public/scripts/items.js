class Item {
    modalElements = [];
    tableElements = [];

    constructor(categories = [{name: '', type: ''}], modal, tableHead) {
        this.categories = categories;
        this.modal = modal;
        this.tableHead = tableHead;
    }

    createModalElements() {
        for(let i = 0; i < this.categories.length; i++) {
            let formGroup = document.createElement('div');

            if(this.categories[i].type !== 'select') {
                let input = document.createElement('input');

                formGroup.setAttribute('class', 'form__group');
                formGroup.setAttribute('name', this.categories[i].name.toLowerCase());
                input.setAttribute('class', 'form__input');
                input.setAttribute('name', this.categories[i].name.toLowerCase())
                input.setAttribute('placeholder', this.categories[i].name);
                input.setAttribute('autocomplete', 'off');
                input.setAttribute('type', this.categories[i].type)
                input.required = true

                if(this.categories[i].name === 'Password(s)') {
                    input.setAttribute('name', 'password');
                    let svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
                    let use = document.createElementNS('http://www.w3.org/2000/svg','use');
                    use.setAttributeNS('http://www.w3.org/1999/xlink','xlink:href', '/images/sprite2.svg#icon-add');
                    svg.setAttribute('class', 'password__add-btn');
                    svg.appendChild(use);
                    formGroup.appendChild(svg);
                }

                formGroup.appendChild(input);
            } else {
                let select = document.createElement('select');
                select.name = this.categories[i].name;
                select.id = this.categories[i].name;
                select.classList.add('form__select');
                select.required = true;

                let optionPlaceholder = document.createElement('option');
                optionPlaceholder.value = '';
                optionPlaceholder.disabled = true;
                optionPlaceholder.selected = true;
                let options;

                if(this.categories[i].name === 'states') {
                    optionPlaceholder.innerText = 'Select State';
                    this.categories[i].name = 'State';
                    options = ['Active', 'Inactive'];
                } else {
                    optionPlaceholder.innerText = 'Select Status';
                    this.categories[i].name = 'Status';
                    options = ['Paid', 'Unpaid'];
                }

                select.appendChild(optionPlaceholder);
                options.forEach(option => {
                    let optionEl = document.createElement('option');
                    optionEl.value = option;
                    optionEl.text = option;
                    select.appendChild(optionEl);
                });

                formGroup.appendChild(select);
                console.log(formGroup);
            }

            this.modalElements.push(formGroup);
        }

        let button = document.createElement('div');
        let input = document.createElement('input');

        button.setAttribute('class', 'form__group');
        input.setAttribute('class', 'submit-btn');
        input.setAttribute('type', 'submit');
        input.setAttribute('value', 'Add Item');

        button.appendChild(input);

        this.modalElements.push(button);
    }

    createTableRows() {
        for(let i = 0; i < this.categories.length; i++) {
            let th = document.createElement('th');
            th.innerText = this.categories[i].name;
            this.tableElements.push(th);
        }
        let th = document.createElement('th');
        th.innerText = 'Delete';
        this.tableElements.push(th);
    }

    drawElements() {
        this.modalElements.forEach((el) => {
            this.modal.appendChild(el);
        });

        this.tableElements.forEach((el) => {
            this.tableHead.appendChild(el);
        });
    }

    getModalElements() {
        return this.modalElements;
    }

    getModal() {
        return this.modal;
    }
}

