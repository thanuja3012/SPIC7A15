// profile.js - Handles fetching and updating user profile from Firebase Firestore

import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

// DOM Elements
const avatarEl = document.getElementById('profile-avatar');
const nameHeaderEl = document.getElementById('profile-name-header');
const taglineEl = document.getElementById('profile-tagline');
const formEl = document.getElementById('profile-form');

const nameInput = document.getElementById('profile-name');
const emailInput = document.getElementById('profile-email');
const phoneInput = document.getElementById('profile-phone');
const bloodSelect = document.getElementById('profile-blood');
const organInput = document.getElementById('profile-organ');

let currentUserUid = null;

// Helper to get initials
function getInitials(name) {
  if (!name) return "--";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0].substring(0, 2).toUpperCase();
}

// Observe auth state
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUserUid = user.uid;
    console.log("Logged in user UID:", currentUserUid);
    await loadUserProfile(user.uid);
  } else {
    // If not logged in, redirect to login page
    alert("Please log in to view your profile.");
    window.location.href = "login.html";
  }
});

// Load profile data from Firestore
async function loadUserProfile(uid) {
  try {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();

      // Set input values
      nameInput.value = data.fullName || "";
      emailInput.value = data.email || auth.currentUser.email || "";
      emailInput.disabled = true; // Email shouldn't be edited normally
      phoneInput.value = data.phone || "";
      organInput.value = data.organ || "";
      
      if (data.bloodGroup) {
        bloodSelect.value = data.bloodGroup;
      } else {
        bloodSelect.selectedIndex = 0; // Select default option
      }

      // Update avatar and header details
      avatarEl.textContent = getInitials(data.fullName);
      nameHeaderEl.textContent = data.fullName || "Donor";
      
      let registeredYear = "2026";
      if (data.createdAt) {
        try {
          const date = new Date(data.createdAt);
          registeredYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        } catch (e) {
          console.error("Error parsing date:", e);
        }
      }
      taglineEl.textContent = `Registered Donor since ${registeredYear}`;

    } else {
      console.warn("No Firestore user document found. Initializing with default auth details.");
      // Fallback if firestore document doesn't exist yet
      nameInput.value = auth.currentUser.displayName || "";
      emailInput.value = auth.currentUser.email || "";
      emailInput.disabled = true;
      nameHeaderEl.textContent = auth.currentUser.displayName || "Donor";
      avatarEl.textContent = getInitials(auth.currentUser.displayName || "Donor");
      taglineEl.textContent = "Registered Donor";
    }
  } catch (error) {
    console.error("Error loading user profile:", error);
    alert("Error loading profile details: " + error.message);
  }
}

// Handle profile update submit
formEl.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentUserUid) return;

  const submitBtn = formEl.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = "Saving changes...";

  try {
    const docRef = doc(db, "users", currentUserUid);
    const updatedData = {
      fullName: nameInput.value.trim(),
      phone: phoneInput.value.trim(),
      bloodGroup: bloodSelect.value,
      organ: organInput.value.trim()
    };

    await updateDoc(docRef, updatedData);
    
    // Update live page elements
    avatarEl.textContent = getInitials(updatedData.fullName);
    nameHeaderEl.textContent = updatedData.fullName;
    
    alert("Profile updated successfully!");
  } catch (error) {
    console.error("Error updating profile:", error);
    alert("Error updating profile: " + error.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Save Profile Changes";
  }
});
