 // ============================
// 1️⃣ SIGNUP
// ============================
const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        let users = JSON.parse(localStorage.getItem('users')) || [];
        const userExists = users.some(user => user.email === email);
        if (userExists) {
            alert('Email already registered!');
            return;
        }

        users.push({ name, email, password });
        localStorage.setItem('users', JSON.stringify(users));

        alert('Signup successful! Please login.');
        window.location.href = 'login.html';
    });
}

// ============================
// 2️⃣ LOGIN
// ============================
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        let users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(user => user.email === email && user.password === password);

        if (user) {
            localStorage.setItem('loggedInUser', JSON.stringify(user)); // save current user
            alert('Login successful! Welcome ' + user.name);
            window.location.href = 'dashboard.html';
        } else {
            alert('Invalid email or password!');
        }
    });
}

// ============================
// 3️⃣ EDITOR (Fabric.js)
// ============================
const canvas = new fabric.Canvas('canvas');

// Add Text
const addTextBtn = document.getElementById('addText');
if(addTextBtn){
    addTextBtn.onclick = () => {
        const text = new fabric.IText('New Text', { left: 100, top: 100, fill: 'black', fontSize: 24 });
        canvas.add(text);
    };
}

// Upload Image
const uploadImageInput = document.getElementById('uploadImage');
if(uploadImageInput){
    uploadImageInput.onchange = function(e){
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = function(f){
            const imgObj = new Image();
            imgObj.src = f.target.result;
            imgObj.onload = function() {
                const image = new fabric.Image(imgObj);
                image.set({ left: 100, top: 100, scaleX: 0.5, scaleY: 0.5 });
                canvas.add(image);
            }
        }
        reader.readAsDataURL(file);
    };
}

// ============================
// 4️⃣ SHAPES
// ============================
const addRectBtn = document.getElementById('addRect');
if(addRectBtn){
    addRectBtn.onclick = () => {
        const rect = new fabric.Rect({ left: 100, top: 100, fill: 'blue', width: 100, height: 60 });
        canvas.add(rect);
    };
}

const addCircleBtn = document.getElementById('addCircle');
if(addCircleBtn){
    addCircleBtn.onclick = () => {
        const circle = new fabric.Circle({ left: 150, top: 150, fill: 'green', radius: 50 });
        canvas.add(circle);
    };
}

const addTriangleBtn = document.getElementById('addTriangle');
if(addTriangleBtn){
    addTriangleBtn.onclick = () => {
        const triangle = new fabric.Triangle({ left: 200, top: 200, fill: 'red', width: 100, height: 100 });
        canvas.add(triangle);
    };
}

// ============================
// 5️⃣ DOWNLOAD CANVAS
// ============================
const downloadBtn = document.getElementById('download');
if(downloadBtn){
    downloadBtn.onclick = () => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL({format: 'png'});
        link.download = 'design.png';
        link.click();
    };
}