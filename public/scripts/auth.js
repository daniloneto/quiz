const authToken = localStorage.getItem('authToken'); 

if (!authToken) {        
    window.location.href = 'login.html';    
}
else{
const p = await fetch('/protected', {
    method: 'GET',
    headers: {
        'Authorization': authToken
    }
});
const data = await p.json();
    if (!p.ok) {
        window.location.href = 'login.html';
    }
}