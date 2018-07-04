
/***
 * author: Tushar Bochare
 * Email: mytusshar@gmail.com
 */

var buttonCreateToken;
var buttonInvalidateToken;
var buttonLoginPage;
var buttonLogout;
var navButtonHome;
var navButtonDevTools;
var modalContainer;
var modal;
var closeButton;
var alertText;
var homePage;
var devToolsPage;

const URL_GET_ALL_TOKEN = "http://localhost:3000/prospects/invite/getall";
const URL_CREATE_INVITE_TOKEN = "http://localhost:3000/prospects/invite/generate";
const URL_INVALIDATE_TOKEN = "http://localhost:3000/prospects/invite/disable";

window.onload = function() {

    buttonCreateToken = document.getElementById("button-createToken");    
    buttonCreateToken.addEventListener("click", createInviteToken);

    buttonInvalidateToken = document.getElementById("button-invalidateToken");
    buttonInvalidateToken.addEventListener("click", invalidateToken);

    buttonLogout = document.getElementById("button-logout");
    buttonLogout.addEventListener("click", logoutUser);

    navButtonDevTools = document.getElementById("developer-tools");
    navButtonDevTools.addEventListener("click", showDevTools);

    navButtonHome = document.getElementById("home");
    navButtonHome.addEventListener("click", showHomePage);

    homePage = document.getElementById("main-home");
    devToolsPage = document.getElementById("dev-tools");

    initModal();

    if(sessionStorage.getItem("appID") && sessionStorage.getItem("appURL")) {
        document.getElementById('app-url').innerHTML = "APP-URL = " + sessionStorage.getItem("appURL");
        document.getElementById('app-id').innerHTML = "APP-ID = " + sessionStorage.getItem("appID");
    }

    if(!sessionStorage.getItem("token")) {
        modalContainer.style.display = "block";
        modal.style.display = "block";
        // closeButton.style.display = "none";
        buttonLoginPage.style.display = "block";
        alertText.innerHTML = "You are not logged in. Please login first.";
    }

    getAllTokens();
}

function displayNewToken(data) {
    var inputBox = document.getElementById("created-token");
    inputBox.value = data.newInviteToken;
}

function displayInTextArea(data) {
    var textArea = document.getElementById("text-area");
    textArea.innerHTML = JSON.stringify(data);
}

function getSessionToken() {
    return sessionStorage.getItem("token");
}

function getToken() {
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

function getCreateTokenParam() {
    var clientID = document.getElementById("client-id").value.trim();
    var errorClientID = document.getElementById("error-client-id");
    var userID = document.getElementById("user-id").value.trim();
    var errorUserID = document.getElementById("error-user-id");

    if(clientID == "") {
        errorClientID.innerHTML = "Enter Client ID!";
        errorClientID.style.display = "block";
        errorUserID.style.display = "none";
    } else if(userID == "") {
        errorUserID.innerHTML = "Enter User ID!";
        errorUserID.style.display = "block";
        errorClientID.style.display = "none";
    } 
    else {
        errorUserID.style.display = "none";
        errorClientID.style.display = "none";
        return {
            appId: sessionStorage.getItem('appID'),
            appUrl: sessionStorage.getItem('appURL'),
            clientId: clientID,
            userId: userID
        };
    }
    return;
}

function createInviteToken() {
    console.log("createInviteToken function");
    var sessionToken = getSessionToken();
    var bodyJSON = getCreateTokenParam();
    if(!bodyJSON) {
        return;
    }
    var headerJSON = {
        "Content-type": "application/x-www-form-urlencoded",
        "Authorization": "Bearer " + sessionToken
    };
    fetch(URL_CREATE_INVITE_TOKEN, {
        method: 'POST',
        headers: headerJSON,
        body: JSON.stringify(bodyJSON)
    })
    .then(response => response.json())
    .then((data) => {
        console.log("getProtected ", data);
        displayNewToken(data);
        displayInTextArea(data);
        getAllTokens();
    })
    .catch((err) => console.log(err))
}

function getAllTokens() {
    var sessionToken = getSessionToken();
    var headerJSON = {
        "Content-type": "application/x-www-form-urlencoded",
        "Authorization": "Bearer " + sessionToken
    };
    fetch(URL_GET_ALL_TOKEN, {
        method: 'GET',
        headers: headerJSON
    })
    .then(response => response.json())
    .then((data) => {
        // console.log("getAllTokens ", data.data);
        // displayInTextArea(data);
        sortActiveAndInactiveTokens(data.allTokens);
        // sortActiveAndInactiveTokens(data.data);
    })
    .catch((err) => console.log(err))
}

function sortActiveAndInactiveTokens(data) {
    var activeTable = document.getElementById("active-table");
    var inactiveTable = document.getElementById("inactive-table");
    var length = data.length;

    deleteRows(activeTable);
    deleteRows(inactiveTable);

    var countActive = 0;
    var countInactive = 0;
    for(var i=0; i<length; i++) {
        var expDate = Date.parse(data[i].expiry_date);
        var curDate = new Date();
        var row;
        if(expDate < curDate) {
            row = inactiveTable.insertRow();
            count = ++countInactive;
        } else {
            row = activeTable.insertRow();
            count = ++countActive;
        }
        var cell0 = row.insertCell(0);
        var cell1 = row.insertCell(1);
        var cell2 = row.insertCell(2);
        var temp = new Date(expDate);
        cell0.innerHTML = count;
        cell1.innerHTML = data[i].token;
        cell2.innerHTML = temp.getFullYear() + '-' + (temp.getMonth()+1) + '-' + temp.getDate();
    }
}

function deleteRows(table) {
    var rowCount = table.rows.length;

    for (var x=rowCount-1; x>0; x--) {
        table.deleteRow(x);
    }
}

function invalidateToken() {
    console.log("invalidateToken function");
    var token = getToken();
    var sessionToken = getSessionToken();
    if(token) {
        var bodyJSON = "inviteToken=" + token;
        var headerJSON = {
            "Content-type": "application/x-www-form-urlencoded",
            "Authorization": "Bearer " + sessionToken
        };
        fetch(URL_INVALIDATE_TOKEN, {
            method: 'POST',
            body: bodyJSON,
            headers: headerJSON            
        })
        .then(response => response.json())
        .then((data) => {
            console.log("recievedData ", data);
            displayInTextArea(data);
            getAllTokens();
        })
        .catch((err) => console.log(err))
    }
}

function getToken() {
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

function showDevTools() {
    homePage.style.display = "none";
    devToolsPage.style.display = "block";
}

function showHomePage() {
    homePage.style.display = "block";
    devToolsPage.style.display = "none";
}

function initModal() {
    buttonLoginPage = document.getElementById("button-loginPage");    
    buttonLoginPage.addEventListener("click", logoutUser);

    modalContainer = document.getElementById("modal-container");
    modal = document.getElementById("modal");
    alertText = document.getElementById("alert-text");    
}

function logoutUser() {
    sessionStorage.removeItem("token");
    window.open("index.html", "_self");
}


// function sortActiveAndInactiveTokens(data) {
//     var activeTable = document.getElementById("active-table");
//     var inactiveTable = document.getElementById("inactive-table");
    
//     var keys = Object.keys(data);
//     var length = keys.length;
//     console.log("******* total toakens: ", length);

//     deleteRows(activeTable);
//     deleteRows(inactiveTable);

//     var countActive = 0;
//     var countInactive = 0;
//     for(var i=0; i<length; i++) {
//         var expDate = Date.parse(data[keys[i]]);
//         var curDate = new Date();
//         var row;
//         if(expDate < curDate) {
//             row = inactiveTable.insertRow();
//             count = ++countInactive;
//         } else {
//             row = activeTable.insertRow();
//             count = ++countActive;
//         }
//         var cell0 = row.insertCell(0);
//         var cell1 = row.insertCell(1);
//         var cell2 = row.insertCell(2);
//         var temp = new Date(expDate);
//         cell0.innerHTML = count;
//         cell1.innerHTML = keys[i];
//         cell2.innerHTML = temp.getFullYear() + '-' + (temp.getMonth()+1) + '-' + temp.getDate();
//     }
// }
