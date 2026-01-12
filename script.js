// Firebase SDK 라이브러리 가져오기 (CDN 방식)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-analytics.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

// Firebase 설정 (제공해주신 코드)
const firebaseConfig = {
  apiKey: "AIzaSyA6cWZ4aNx-H2h3-qUQMkvwBbWNueDhYI8",
  authDomain: "homepage-7d350.firebaseapp.com",
  projectId: "homepage-7d350",
  storageBucket: "homepage-7d350.firebasestorage.app",
  messagingSenderId: "118674982714",
  appId: "1:118674982714:web:b71dd915ed34b46ddc7203",
  measurementId: "G-HE0WTCEV0H"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// 페이지 전환 함수 (전역 객체 window에 연결)
window.showPage = function(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
}

// 회원가입 로직
window.signup = async function() {
    const id = document.getElementById('signup-id').value;
    const pw = document.getElementById('signup-pw').value;
    const name = document.getElementById('signup-name').value;

    if (!id || !pw || !name) {
        alert('모든 정보를 입력해주세요.');
        return;
    }

    try {
        // 아이디를 이메일 형식으로 변환 (예: kim123 -> kim123@ourclass.com)
        const email = id + "@ourclass.com";
        const userCredential = await createUserWithEmailAndPassword(auth, email, pw);
        
        // 사용자 이름(닉네임) 저장
        await updateProfile(userCredential.user, { displayName: name });

        alert('가입이 완료되었습니다! 로그인해주세요.');
        window.showPage('login');
    } catch (error) {
        let msg = "가입 실패: " + error.message;
        if (error.code === 'auth/email-already-in-use') {
            msg = "이미 존재하는 아이디입니다.";
        } else if (error.code === 'auth/weak-password') {
            msg = "비밀번호는 6자리 이상이어야 합니다.";
        }
        alert(msg);
    }
}

// 로그인 로직
window.login = async function() {
    const id = document.getElementById('login-id').value;
    const pw = document.getElementById('login-pw').value;
    
    if (!id || !pw) return alert("아이디와 비밀번호를 입력하세요.");

    try {
        const email = id + "@ourclass.com";
        await signInWithEmailAndPassword(auth, email, pw);
        alert("로그인 성공!");
        window.showPage('home');
    } catch (error) {
        alert('로그인 실패: 아이디 또는 비밀번호를 확인하세요.');
    }
}

// 로그아웃
window.logout = async function() {
    await signOut(auth);
    alert('로그아웃 되었습니다.');
    window.showPage('home');
}

// 로그인 상태 감지 및 UI 변경 (실시간)
onAuthStateChanged(auth, (user) => {
    const navLogin = document.getElementById('nav-login');
    const navSignup = document.getElementById('nav-signup');
    const navLogout = document.getElementById('nav-logout');
    const writeArea = document.getElementById('write-area');

    if (user) {
        // 로그인 상태
        navLogin.classList.add('hidden');
        navSignup.classList.add('hidden');
        navLogout.classList.remove('hidden');
        writeArea.classList.remove('hidden');
    } else {
        // 로그아웃 상태
        navLogin.classList.remove('hidden');
        navSignup.classList.remove('hidden');
        navLogout.classList.add('hidden');
        writeArea.classList.add('hidden');
    }
});

// 가정통신문 글쓰기 (Firestore 저장)
window.addNotice = async function() {
    const title = document.getElementById('notice-title').value;
    const content = document.getElementById('notice-content').value;
    
    if(!title || !content) return alert('내용을 입력하세요');

    try {
        await addDoc(collection(db, "notices"), {
            title: title,
            content: content,
            date: new Date().toISOString().split('T')[0],
            timestamp: new Date() // 정렬을 위한 시간
        });
        
        // 입력창 초기화
        document.getElementById('notice-title').value = '';
        document.getElementById('notice-content').value = '';
    } catch (e) {
        alert("글쓰기 실패: " + e.message);
    }
}

// 가정통신문 목록 실시간 동기화
const q = query(collection(db, "notices"), orderBy("timestamp", "desc"));
onSnapshot(q, (snapshot) => {
    const list = document.getElementById('notice-list');
    list.innerHTML = ""; // 기존 목록 초기화

    snapshot.forEach((doc) => {
        const data = doc.data();
        const html = `
            <div class="notice-item">
                <span class="notice-date">${data.date}</span>
                <div class="notice-title">${data.title}</div>
                <p>${data.content}</p>
            </div>
        `;
        list.insertAdjacentHTML('beforeend', html);
    });
});