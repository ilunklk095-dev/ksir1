import { db } from './firebase-config.js';
import { currentProfile } from './auth.js';
import { addDoc, collection, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js';
export async function audit(activity,detail=''){try{await addDoc(collection(db,'auditLogs'),{userId:currentProfile?.uid||null,userName:currentProfile?.name||currentProfile?.email||'Unknown',activity,detail,createdAt:serverTimestamp()})}catch(e){console.warn('Audit gagal',e)}}
