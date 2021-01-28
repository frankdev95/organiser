const patterns = {
    name: /^[a-z ,.'-]+$/i,
    email: /^([a-z\d."+\-_]+)@([a-z\d-.[\]]+)\.([a-z\d]{2,8})(\.[a-z]+)?$/i,
    username: /^[a-z\d]{5,12}$/i,
    password: /^(?=.*[a-z])(?=.*[\d])(?=.*[\W])[a-z\d\W]{8,25}$/i,
}

module.exports = patterns;
