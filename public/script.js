let socket;
let userType = null;
let userId = 'user_' + Math.random().toString(36).substr(2, 9);
let chatId = 'chat_111111'// + Math.random().toString(36).substr(2, 9);

function setUserType(type) {
    userType = type;
    document.querySelector('.user-select').style.display = 'none';
    document.querySelector('.chat-container').style.display = 'block';
    
    const userInfo = {
        name: type === 'employer' ? 'John Smith' : 'Alice Johnson',
        role: type === 'employer' ? 'Hiring Manager' : 'Developer',
        company: type === 'employer' ? 'Tech Corp Inc.' : undefined,
        type: type
    };

    document.getElementById('user-name').textContent = userInfo.name;
    document.getElementById('user-role').textContent = userInfo.role + (userInfo.company ? ` at ${userInfo.company}` : '');
    
    initializeSocket(userInfo);
}

function initializeSocket(userInfo) {
    socket = io();
    
    socket.on('connect', () => {
        updateStatus('Connected');
        socket.emit('setUserInfo', { userId, userInfo });
        socket.emit('joinChat', { chatId, userId });
    });
    
    socket.on('message', (data) => {
        addMessage(data);
    });
    
    socket.on('jobAccepted', (data) => {
        addSystemMessage(data.message);
        updateStatus('Active');
    });
    
    socket.on('jobDeclined', (data) => {
        addSystemMessage(data.message);
        updateStatus('Declined');
        disableChat();
    });
    
    socket.on('contractSent', (data) => {
        addSystemMessage(data.message);
        if (userType === 'worker') {
            showContractButtons();
        }
    });
    
    socket.on('contractSigned', (data) => {
        addSystemMessage(data.message);
        updateStatus('Completed');
    });
    
    socket.on('contractDeclined', (data) => {
        addSystemMessage(data.message);
        updateStatus('Declined');
        disableChat();
    });
    
    if (userType === 'employer') {
        showJobButtons();
    }
}

function formatTimeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' years ago';
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutes ago';
    
    return Math.floor(seconds) + ' seconds ago';
}

function sendMessage() {
    const input = document.getElementById('message-input');
    const message = input.value.trim();
    
    if (message) {
        socket.emit('sendMessage', { chatId, message, userId });
        input.value = '';
    }
}

function addMessage(data) {
    const messagesDiv = document.getElementById('messages');
    const messageElement = document.createElement('div');
    const isSent = data.userId === userId;
    
    messageElement.className = `message-wrapper ${isSent ? 'sent' : 'received'}`;
    
    const timeAgo = formatTimeAgo(data.timestamp);
    
    messageElement.innerHTML = `
        <div class="message">
            <div class="message-content">${data.message}</div>
            <div class="message-time">${timeAgo}</div>
        </div>
    `;
    
    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function addSystemMessage(message) {
    const messagesDiv = document.getElementById('messages');
    const messageElement = document.createElement('div');
    messageElement.className = 'system-message';
    messageElement.textContent = message;
    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function showJobButtons() {
    const buttonsDiv = document.getElementById('action-buttons');
    buttonsDiv.innerHTML = `
        <button class="accept" onclick="acceptJob()">Accept</button>
        <button class="decline" onclick="declineJob()">Decline</button>
    `;
}

function showContractButtons() {
    const buttonsDiv = document.getElementById('action-buttons');
    buttonsDiv.innerHTML = `
        <button class="accept" onclick="signContract()">Sign Contract</button>
        <button class="decline" onclick="declineContract()">Decline Contract</button>
    `;
}

function acceptJob() {
    socket.emit('acceptJob', { chatId, userId });
    document.getElementById('action-buttons').innerHTML = `
        <button onclick="sendContract()">Send Contract</button>
    `;
}

function declineJob() {
    socket.emit('declineJob', { chatId, userId });
}

function sendContract() {
    socket.emit('sendContract', { chatId, userId });
}

function signContract() {
    socket.emit('signContract', { chatId, userId });
}

function declineContract() {
    socket.emit('declineContract', { chatId, userId });
}

function updateStatus(status) {
    document.getElementById('status-badge').textContent = `Status: ${status}`;
}

function disableChat() {
    document.getElementById('message-input').disabled = true;
    document.querySelector('.input-area button').disabled = true;
    document.getElementById('action-buttons').innerHTML = '';
}

document.getElementById('message-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});