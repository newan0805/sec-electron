const { ipcRenderer } = require("electron");

user = {};

// const err = document.getElementById("error");
function showAlert(message, status) {
    var errDiv = document.getElementById("err");
    var existingAlert = errDiv.querySelector(".alert");
    if (existingAlert) {
        existingAlert.innerHTML = message;
        existingAlert.className = `alert alert-${status}`;
    } else {
        var alertDiv = document.createElement("div");
        alertDiv.className = `alert alert-${status}`;
        alertDiv.setAttribute("role", "alert");
        alertDiv.innerHTML = message;
        errDiv.appendChild(alertDiv);
    }
    setTimeout(() => {
        errDiv.removeChild(existingAlert || alertDiv);
    }, 8000);
}


const login = async () => {
    try {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        let data = { "username": username, "password": password }
        let res = await ipcRenderer.invoke('login', { ...data });

        if (res && res.msg) {
            console.log(res);
            // console.log(res.status);
            showAlert(res.msg, res.status);
            if (res.msg == 'Login successful' || res.status == 'success' && res.userData) {
                user = (res.userData);
                profile(res.userData);
                window.location = './profile.html';
            }
            // err.
        } else {
            console.log('Invalid username or password');
            showAlert('Invalid username or password', 'danger');
        }
    } catch (error) {
        console.error('Error sending request:', error);
        showAlert('Error sending request!', 'danger');
    }
};

const signup = async () => {
    try {
        username = localStorage.getItem('username');
        email = localStorage.getItem('email');
        password = localStorage.getItem('password');
        otp = localStorage.getItem('otp');
        userOTP = document.getElementById('otp').value;
        userCaptcha = document.getElementById('captcha').value;
        captcha = localStorage.getItem('captcha');

        let data = {"username": username, "email": email, "password": password}

        console.log(otp,userOTP, )

        if(otp === userOTP && userCaptcha === captcha) {
            let res = await ipcRenderer.invoke('signup', { ...data });
            if (res && res.msg) {
                console.log(res);
                showAlert(res.msg, res.status);
                profile(res.userData);
                window.location = './profile.html';
                // err.
            } else {
                console.log('Invalid username or password');
                showAlert('Invalid username or password', 'danger');
            }
        }
        else {
            showAlert('Invalid captcha or OTP', 'danger');
        }

    } catch (error) {
        console.error('Error sending request:', error);
        showAlert('Error sending request', 'danger');
    }
}

const profile = (userData) => {
    console.log(userData);

    // Set user data to localStorage
    localStorage.setItem('username', userData.username || '');
    localStorage.setItem('email', userData.email || '');
    localStorage.setItem('password', userData.passwordHash || '');

}

const logout = () => {
    localStorage.clear();
    window.location = './index.html'
}


const sendOTP = async () => {
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const rePassword = document.getElementById('re-password').value
    // const otp = document.getElementById('otp').value;

    const isStrongPassword = (pass) => {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        return passwordRegex.test(pass);
    };

    const isValidEmail = (em) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(em);
    };

    if (username == '' || password == '' || email == '' || rePassword == '') {
        showAlert('Plese fill all the fields.', 'danger');
        return
    }

    if (!isValidEmail(email)) {
        showAlert('Please enter a valid email address.', 'danger');
        return
    }

    if (password.length < 8 && rePassword.length < 8) {
        showAlert('Password length is not enough. Please use a longer password.', 'danger');
        return
    }
    if (!isStrongPassword(password)) {
        showAlert('Weak password. Please use a stronger password.', 'danger');
        return
    }
    if (password !== rePassword) {
        showAlert('Passwords doesnt match.', 'danger');
        return
    }


    const userEmail = document.getElementById('email').value;
    console.log(userEmail);

    let data = { "email": userEmail }
    let res = await ipcRenderer.invoke('send-otp', { ...data });
    showAlert(res.msg, res.status);
    console.log('Res:', res);
    console.log(res.userData.otp)

    localStorage.setItem('username', username);
    localStorage.setItem('email', userEmail);
    localStorage.setItem('password', password);
    localStorage.setItem('otp', res.userData.otp);

    setTimeout(() => {
        window.location = './captcha.html';
    }, 2000);

    // return res;
}

// Frontend code
// let currentCaptcha = ""; // Global variable to store the current CAPTCHA image path

let currentCaptcha = "";

// Function to load a random CAPTCHA
const loadCaptcha = async () => {
    try {
        const captchaList = await ipcRenderer.invoke('get-captcha-list');
        console.log(captchaList);
        if (captchaList.userData.length === 0) {
            showAlert('No captchas available.', 'warning');
            window.location.reload();
            return;
        }
        const randomCaptcha = captchaList.userData[Math.floor(Math.random() * captchaList.userData.length)];
        console.log(randomCaptcha);
        currentCaptcha = randomCaptcha;
        localStorage.setItem('captcha', randomCaptcha.value);


        // Create an <img> element
        const captchaImageElement = document.createElement('img');
        captchaImageElement.src = `../Captchas/${randomCaptcha.filePath}`;
        captchaImageElement.alt = 'Captcha Image';
        const captchaDiv = document.getElementById('captcha-img');
        captchaDiv.innerHTML = '';
        captchaDiv.appendChild(captchaImageElement);
    } catch (error) {
        console.error('Error loading CAPTCHA:', error);
    }
};



// Call loadCaptcha when the page loads
document.addEventListener('DOMContentLoaded', () => {
    loadCaptcha();
});

// Function to validate user response
const validateCaptcha = async () => {
    const userResponse = document.getElementById('captcha').value;
    try {
        let data = { captcha: currentCaptcha, response: userResponse }
        const result = await ipcRenderer.invoke('validate-captcha', { ...data });
        console.log(result);
        // console.log(currentCaptcha.value);
        if (result.status == 'success') {
            console.log('CAPTCHA verification successful');
            showAlert('CAPTCHA verification successful', 'success');
            // let cap = currentCaptcha.value
            // localStorage.setItem('captcha', currentCaptcha.value)
        } else {
            console.error('CAPTCHA verification failed:', result.status);
            showAlert(res.msg, res.status);
        }
    } catch (error) {
        console.error('Error during CAPTCHA verification:', error);
        showAlert('Error during CAPTCHA verification', 'danger');
    }
};
