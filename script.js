// 페이지 전환 함수
function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
}

// 회원가입 로직
function signup() {
    const id = document.getElementById('signup-id').value;
    const pw = document.getElementById('signup-pw').value;
    const name = document.getElementById('signup-name').value;

    if (!id || !pw || !name) {
        alert('모든 정보를 입력해주세요.');
        return;
    }

    // 로컬 스토리지에 사용자 저장 (실제 서버가 없으므로 브라우저에 저장)
    const users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.find(u => u.id === id)) {
        alert('이미 존재하는 아이디입니다.');
        return;
    }

    users.push({ id, pw, name });
    localStorage.setItem('users', JSON.stringify(users));
    alert('가입이 완료되었습니다! 로그인해주세요.');
    showPage('login');
}

// 로그인 로직
function login() {
    const id = document.getElementById('login-id').value;
    const pw = document.getElementById('login-pw').value;
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    const user = users.find(u => u.id === id && u.pw === pw);

    if (user) {
        alert(user.name + '님 환영합니다!');
        localStorage.setItem('currentUser', JSON.stringify(user));
        updateUIState();
        showPage('home');
    } else {
        alert('아이디 또는 비밀번호가 틀렸습니다.');
    }
}

// 로그아웃
function logout() {
    localStorage.removeItem('currentUser');
    alert('로그아웃 되었습니다.');
    updateUIState();
    showPage('home');
}

// 로그인 상태에 따른 UI 변경
function updateUIState() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const navLogin = document.getElementById('nav-login');
    const navSignup = document.getElementById('nav-signup');
    const navLogout = document.getElementById('nav-logout');
    const writeArea = document.getElementById('write-area');

    if (user) {
        navLogin.classList.add('hidden');
        navSignup.classList.add('hidden');
        navLogout.classList.remove('hidden');
        writeArea.classList.remove('hidden'); // 로그인 한 사람만 글쓰기 가능
    } else {
        navLogin.classList.remove('hidden');
        navSignup.classList.remove('hidden');
        navLogout.classList.add('hidden');
        writeArea.classList.add('hidden');
    }
}

// 가정통신문 글쓰기 (간이 기능)
function addNotice() {
    const title = document.getElementById('notice-title').value;
    const content = document.getElementById('notice-content').value;
    
    if(!title || !content) return alert('내용을 입력하세요');

    const list = document.getElementById('notice-list');
    const today = new Date().toISOString().split('T')[0];
    
    const html = `
        <div class="notice-item">
            <span class="notice-date">${today}</span>
            <div class="notice-title">${title}</div>
            <p>${content}</p>
        </div>
    `;
    
    list.insertAdjacentHTML('afterbegin', html);
    
    // 입력창 초기화
    document.getElementById('notice-title').value = '';
    document.getElementById('notice-content').value = '';
}

// 초기 실행
updateUIState();