import { auth, db, isFirebaseConfigured } from './firebase-config.js';
import { signInWithEmailAndPassword, signOut, sendPasswordResetEmail, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js';
import { doc, getDoc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js';
import { $, toast, loading } from './utils.js';

export let currentProfile=null;
export function onSession(callback){return onAuthStateChanged(auth,async user=>{if(!user){currentProfile=null;callback(null,null);return}try{const snap=await getDoc(doc(db,'users',user.uid));if(!snap.exists()){await signOut(auth);toast('Akun Auth ada, tetapi profil users/{uid} belum dibuat.','error',6000);callback(null,null);return}const profile={uid:user.uid,email:user.email,...snap.data()};if(profile.active===false){await signOut(auth);toast('Akun dinonaktifkan admin.','error');callback(null,null);return}currentProfile=profile;try{await setDoc(doc(db,'auditLogs',`${Date.now()}_${user.uid}`),{userId:user.uid,userName:profile.name||user.email,activity:'session',detail:'Sesi pengguna aktif',createdAt:serverTimestamp()})}catch{}callback(user,profile)}catch(e){console.error(e);toast('Gagal membaca role pengguna: '+e.message,'error');callback(null,null)}})}
export function setupLogin(){
  $('#togglePassword').addEventListener('click',()=>{const p=$('#loginPassword');p.type=p.type==='password'?'text':'password';$('#togglePassword i').className=`fa-regular fa-${p.type==='password'?'eye':'eye-slash'}`});
  $('#loginForm').addEventListener('submit',async e=>{e.preventDefault();if(!isFirebaseConfigured)return toast('Isi firebase-config.js terlebih dahulu.','warning',5000);loading(true,'Memeriksa akun...');try{await signInWithEmailAndPassword(auth,$('#loginEmail').value.trim(),$('#loginPassword').value);toast('Login berhasil')}catch(err){console.error(err);const map={'auth/invalid-credential':'Email atau password salah.','auth/user-disabled':'Akun dinonaktifkan.','auth/too-many-requests':'Terlalu banyak percobaan. Coba lagi nanti.','auth/network-request-failed':'Koneksi ke Firebase gagal.'};toast(map[err.code]||`Login gagal: ${err.code||err.message}`,'error',5000)}finally{loading(false)}});
  $('#forgotPasswordBtn').addEventListener('click',async()=>{const email=$('#loginEmail').value.trim();if(!email)return toast('Isi email terlebih dahulu.','warning');try{await sendPasswordResetEmail(auth,email);toast('Email reset password sudah dikirim.')}catch(e){toast(`Gagal mengirim reset: ${e.code||e.message}`,'error')}})
}
export async function logout(){await signOut(auth)}
export const isAdmin=()=>currentProfile?.role==='admin';
