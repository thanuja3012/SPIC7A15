import { db, auth } from './firebase-config.js';
import { collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
  const adminNameDisplay = document.getElementById('admin-name-display');
  const adminAvatar = document.getElementById('admin-avatar');

  // Stat boxes
  const donorsCount = document.getElementById('stat-donors');
  const hospitalsCount = document.getElementById('stat-hospitals');

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        let nameToDisplay = "Admin User";
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.role !== 'admin') {
            // Unauth redirect
            window.location.href = "login.html";
            return;
          }
          nameToDisplay = data.fullName || user.displayName || "Admin User";
        } else {
          nameToDisplay = user.displayName || "Admin User";
        }
        
        if (adminNameDisplay) adminNameDisplay.textContent = nameToDisplay;
        if (adminAvatar) adminAvatar.textContent = nameToDisplay.charAt(0).toUpperCase();

        // Load live counts
        fetchLiveCounts();

      } catch (error) {
        console.error("Error fetching admin user data:", error);
      }
    } else {
      window.location.href = "login.html";
    }
  });

  async function fetchLiveCounts() {
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      let dCount = 0;
      const userListTbody = document.getElementById('admin-user-list');
      if (userListTbody) userListTbody.innerHTML = '';
      
      usersSnap.forEach(doc => {
        const data = doc.data();
        if(data.role !== 'admin') dCount++;
        
        // Inject user into User Management table
        if (userListTbody) {
          const tr = document.createElement('tr');
          tr.style.borderBottom = '1px solid #e2e8f0';
          const name = data.fullName || data.name || 'Unknown User';
          const email = data.email || doc.id;
          const role = (data.role || 'user').charAt(0).toUpperCase() + (data.role || 'user').slice(1);
          tr.innerHTML = `
            <td style="padding:1rem; font-weight:600;">${name}</td>
            <td style="padding:1rem; color:var(--color-muted);">${email}</td>
            <td style="padding:1rem;">${role}</td>
            <td style="padding:1rem;"><span style="background:#dcfce7; color:#166534; padding:0.2rem 0.6rem; border-radius:999px; font-size:0.8rem; font-weight:700;">Verified</span></td>
            <td style="padding:1rem;">
              <button style="background:#ef4444; color:#fff; border:none; padding:0.4rem 0.8rem; border-radius:6px; font-weight:600; cursor:pointer; font-size:0.9rem;">Ban User</button>
            </td>
          `;
          userListTbody.appendChild(tr);
        }
      });
      
      const hospSnap = await getDocs(collection(db, 'hospitals'));
      let hCount = hospSnap.size;

      const pendingSnap = await getDocs(collection(db, 'organ_requests'));
      let pCount = pendingSnap.size;

      const transplantsSnap = await getDocs(collection(db, 'surgeries'));
      let tCount = transplantsSnap.size;

      const statDonors = document.getElementById('stat-donors');
      const statHospitals = document.getElementById('stat-hospitals');
      const statPending = document.getElementById('stat-pending');
      const statTransplants = document.getElementById('stat-transplants');

      if (statDonors) statDonors.textContent = dCount.toLocaleString();
      if (statHospitals) statHospitals.textContent = hCount.toLocaleString();
      if (statPending) statPending.textContent = pCount.toLocaleString();
      if (statTransplants) statTransplants.textContent = tCount.toLocaleString();
      
    } catch(err) {
      console.error("Error fetching live counts:", err);
    }
  }
});
