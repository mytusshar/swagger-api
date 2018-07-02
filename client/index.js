/***
 * author: Tushar Bochare
 * Email: mytusshar@gmail.com
 */

// buttons 
var buttonUserLogin;
var buttonAdminLogin;
var buttonOpenUserLogin;
var buttonOpenAdminLogin;
var userBlock;
var adminBlock;
var modalContainer;
var modal;
var closeButton;
var alertText;

window.onload = function() {
    buttonUserLogin = document.getElementById("button-userLogin");
    buttonUserLogin.addEventListener("click", userLoginFunction);

    buttonAdminLogin = document.getElementById("button-adminLogin");
    buttonAdminLogin.addEventListener("click", adminLoginFunction);

    buttonOpenUserLogin = document.getElementById("button-displayUser");
    buttonOpenUserLogin.addEventListener("click", displayUserLogin);

    buttonOpenAdminLogin = document.getElementById("button-displayAdmin");
    buttonOpenAdminLogin.addEventListener("click", displayAdminLogin);

    userBlock = document.getElementById("user-login");
    adminBlock = document.getElementById("admin-login");

    initModal();
}

function displayAdminLogin() {
    userBlock.style.display = "none";
    adminBlock.style.display = "block";
}
function displayUserLogin() {
    userBlock.style.display = "block";
    adminBlock.style.display = "none";
}

function adminLoginFunction() {
    var userCreden = getAdminFormData();
    if(userCreden) {
        console.log(userCreden);
        // serverInteraction(token);
        getJWTToken(userCreden);
    }
}

/** admin dashboard login function **/
function getJWTToken(data) {
    const URL_LOGIN_ADMIN = "http://localhost:3000/prospects/login/admin";
    var bodyJSON = "username=" + data.username + "&password=" + data.password;
    var headerJSON = {
        "Content-type": "application/x-www-form-urlencoded"
    };
    fetch(URL_LOGIN_ADMIN, {
        method: 'POST',
        headers: headerJSON,
        body: bodyJSON
    })
    .then(response => response.json())
    .then((data) => {
        console.log("recievedData ", data);
        if(data) {
            sessionStorage.setItem('token', data.token);
            sessionStorage.setItem('appID', data.appID);
            sessionStorage.setItem('appURL', data.appURL);
            window.open("admin.html", "_self");
        }
    })
    .catch((err) => console.log(err))
}

/** invite validate function **/
function userLoginFunction() {
    var token = getUserFormData();
    if(token) {
        console.log("userLoginFunction function");
        const URL_LOGIN_WITH_INVITE_TOKEN = "http://localhost:3000/prospects/invite/validate";
        if(token) {
            var bodyJSON = "inviteToken=" + token;
            var headerJSON = {
                "Content-type": "application/x-www-form-urlencoded"
            };
            fetch(URL_LOGIN_WITH_INVITE_TOKEN, {
                method: 'POST',
                body: bodyJSON,
                headers: headerJSON            
            })
            .then(response => response.json())
            .then((data) => {
                console.log("recievedData ", data);
                openModal(JSON.stringify(data.message));
            })
            .catch((err) => console.log(err))
        }
    }
}

function getAdminFormData() {
    var name = document.getElementById("input-name").value.trim();
    var errorName = document.getElementById("error-name");
    var password = document.getElementById("input-password").value.trim();
    var errorPassword = document.getElementById("error-password");

    if(name == "") {
        errorName.innerHTML = "Enter username!";
        errorName.style.display = "block";
        errorPassword.style.display = "none";
    } else if(password == "") {
        errorPassword.innerHTML = "Enter password!";
        errorPassword.style.display = "block";
        errorName.style.display = "none";
    } else {
        errorName.style.display = "none";
        errorPassword.style.display = "none";
        return {username: name, password: password};
    }
    return;
}

function getUserFormData() {
    var inputToken = document.getElementById("input-token").value.trim();
    var errorToken = document.getElementById("error-input");

    if(inputToken == "") {
        errorToken.innerHTML = "Enter Token!";
        errorToken.style.display = "block";
    } else {
        errorToken.style.display = "none";
        return inputToken;
    }
    return;
}

function initModal() {
    closeButton = document.getElementById("close");    
    closeButton.addEventListener("click", closeModal);

    modalContainer = document.getElementById("modal-container");
    modal = document.getElementById("modal");
    alertText = document.getElementById("alert-text");    
}

function openModal(message) {
    modalContainer.style.display = "block";
    modal.style.display = "block";
    alertText.innerHTML = message;
}

function closeModal() {
    modalContainer.style.display = "none";
    modal.style.display = "none";
}