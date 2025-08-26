import React, { useState, useEffect, Suspense, lazy } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import './App.css';
import './adminclub.css';
import './home.css';
import './firebase/firebase'; // Import the Firebase configuration

// Lazy load the components
const AdminView = lazy(() => import('./screens/AdminView'));
const UserView = lazy(() => import('./screens/UserView'));

function App() {
	const [user, setUser] = useState(null);
	const [stylesLoaded, setStylesLoaded] = useState(false);

	useEffect(() => {
		const auth = getAuth();
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			setUser(user);
		});

		// Cleanup subscription on unmount
		return () => unsubscribe();
	}, []);

	useEffect(() => {
		const checkStylesLoaded = () => {
			const styles = document.styleSheets;
			if (styles.length > 0) {
				setStylesLoaded(true);
			}
		};

		// Check if styles are already loaded
		checkStylesLoaded();

		// Add an event listener to check when styles are loaded
		document.addEventListener('readystatechange', checkStylesLoaded);

		// Cleanup event listener on unmount
		return () => {
			document.removeEventListener('readystatechange', checkStylesLoaded);
		};
	}, []);

	if (!stylesLoaded) {
		return <div className='loading'>Cargando estilos...</div>;
	}

	return (
		<div className='App'>
			<Suspense fallback={<div className='loading'>Cargando...</div>}>{user ? <AdminView user={user} /> : <UserView />}</Suspense>
		</div>
	);
}

export default App;
