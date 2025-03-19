import { auth, db } from "./config";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

// Define roles
type UserRole = "admin" | "coordinator" | "teacher";

// Register a user with role-based access
export const registerUser = async (
  name: string,
  email: string,
  password: string,
  role: UserRole,
  managedClasses: string[] = [],
  assignedSubjects: string[] = []
) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Store user details in Firestore
  await setDoc(doc(db, "users", user.uid), {
    name,
    email,
    role,
    managedClasses: role === "coordinator" ? managedClasses : [],
    assignedSubjects: role === "teacher" ? assignedSubjects : [],
  });

  return user;
};

// Login user
export const loginUser = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

// Fetch user details (role & permissions)
export const getUserData = async (user: User | null) => {
  if (!user) return null;

  const userDoc = await getDoc(doc(db, "users", user.uid));
  if (userDoc.exists()) {
    return userDoc.data();
  }

  return null;
};

// Logout user
export const logoutUser = async () => {
  await signOut(auth);
};
