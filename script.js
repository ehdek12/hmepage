// Firebase SDK 라이브러리 가져오기 (CDN 방식)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-analytics.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

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
window.showPage = function (pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');

    // 네비게이션 버튼 활성화 스타일 업데이트
    const navButtons = document.querySelectorAll('#main-nav button');
    navButtons.forEach(btn => {
        btn.classList.remove('active-nav');
        // 버튼의 onclick 속성에 해당 pageId가 포함되어 있는지 확인
        if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(`'${pageId}'`)) {
            btn.classList.add('active-nav');
        }
    });
}

// 회원가입 로직
window.signup = async function () {
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

        // Firestore에 사용자 정보 저장 (관리자 관리용)
        await addDoc(collection(db, "users"), {
            name: name,
            email: email,
            uid: userCredential.user.uid,
            joinedAt: new Date().toISOString().split('T')[0]
        });

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
window.login = async function () {
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

// 구글 로그인 로직
window.googleLogin = async function () {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // 구글 로그인 성공 시 Firestore에 사용자 정보 저장 (없을 경우)
        // (간단하게 구현하기 위해 중복 체크 없이 추가하거나, 필요 시 체크 로직 추가 가능)
        // 여기서는 로그인 성공 메시지만 띄웁니다.
        alert(`구글 로그인 성공! 환영합니다, ${user.displayName}님.`);
        window.showPage('home');
    } catch (error) {
        console.error(error);
        alert("구글 로그인 실패: " + error.message);
    }
}

// 로그아웃
window.logout = async function () {
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
    const navAdmin = document.getElementById('nav-admin');
    const welcomeMsg = document.getElementById('welcome-msg');

    if (user) {
        // 로그인 상태
        navLogin.classList.add('hidden');
        navSignup.classList.add('hidden');
        navLogout.classList.remove('hidden');

        // 홈 화면에 로그인 정보 표시 (디버깅용)
        welcomeMsg.innerText = `환영합니다! ${user.displayName || '친구'} (${user.email}) 👋`;

        // 관리자(ehdek) 계정인지 확인하여 글쓰기 권한 부여
        if (user.email && (user.email.toLowerCase() === 'ehdek@ourclass.com' || user.email.toLowerCase() === 'ehdek12345@gmail.com')) {
            writeArea.classList.remove('hidden');
            navAdmin.classList.remove('hidden');
        } else {
            writeArea.classList.add('hidden');
            navAdmin.classList.add('hidden');
        }
    } else {
        // 로그아웃 상태
        navLogin.classList.remove('hidden');
        navSignup.classList.remove('hidden');
        navLogout.classList.add('hidden');
        writeArea.classList.add('hidden');
        navAdmin.classList.add('hidden');
        welcomeMsg.innerText = "환영합니다! 👋";
    }
});

// 가정통신문 글쓰기 (Firestore 저장)
window.addNotice = async function () {
    // 관리자 권한 체크
    const userEmail = auth.currentUser ? auth.currentUser.email.toLowerCase() : '';
    if (userEmail !== 'ehdek@ourclass.com' && userEmail !== 'ehdek12345@gmail.com') {
        return alert("관리자만 작성할 수 있습니다.");
    }

    const title = document.getElementById('notice-title').value;
    const content = document.getElementById('notice-content').value;

    if (!title || !content) return alert('내용을 입력하세요');

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
                <span class="notice-date"><i class="far fa-calendar-alt"></i> ${data.date}</span>
                <div class="notice-title">${data.title}</div>
                <div class="notice-content">${data.content.replace(/\n/g, '<br>')}</div>
            </div>
        `;
        list.insertAdjacentHTML('beforeend', html);
    });
});

// 회원 관리 목록 실시간 동기화 (관리자용)
const userQ = query(collection(db, "users"), orderBy("joinedAt", "desc"));
onSnapshot(userQ, (snapshot) => {
    const list = document.getElementById('user-list');
    if (!list) return;
    list.innerHTML = "";

    snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const html = `
            <div class="user-item">
                <div>
                    <span class="notice-date">${data.joinedAt} 가입</span>
                    <div class="notice-title" style="font-size: 1.1rem;">${data.name} <span style="font-weight:400; color:var(--text-muted); font-size:0.9rem;">(${data.email.split('@')[0]})</span></div>
                </div>
                <button onclick="deleteUser('${docSnap.id}')" class="delete-btn"><i class="fas fa-trash-alt"></i> 삭제</button>
            </div>
        `;
        list.insertAdjacentHTML('beforeend', html);
    });
});

window.deleteUser = async function (docId) {
    if (!confirm("정말 이 회원 정보를 목록에서 삭제하시겠습니까?")) return;
    try {
        await deleteDoc(doc(db, "users", docId));
        alert("삭제되었습니다.");
    } catch (e) {
        alert("삭제 실패: " + e.message);
    }
}