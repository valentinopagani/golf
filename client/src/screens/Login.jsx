import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import firebaseApp from '../firebase/firebase';

const auth = getAuth(firebaseApp);

function Login() {
	const [errorMessage, setErrorMessage] = useState('');

	const handleLogin = async (email, pass) => {
		try {
			await signInWithEmailAndPassword(auth, email, pass);
		} catch (error) {
			setErrorMessage('Inicio de sesión incorrecto. Por favor, verifica tus credenciales.');
		}
	};

	return (
		<div className='login'>
			<Formik
				initialValues={{
					mail: '',
					password: ''
				}}
				validate={(val) => {
					let err = {};
					if (!val.mail) {
						err.mail = 'Por favor ingresá tu correo electronico';
					} else if (!/^[a-zA-Z0-9_.+-]+@[a-z-]+\.[a-z-.]+$/.test(val.mail)) {
						err.mail = 'Formato de email incorrecto';
					}

					if (!val.password) {
						err.password = 'Por favor ingresá tu contraseña';
					} else if (!/^[a-zA-Z0-9_.+-]{5,15}[^'\s]/.test(val.password)) {
						err.password = 'Debe tener al menos 6 caracteres';
					}

					return err;
				}}
				onSubmit={(val, { resetForm }) => {
					handleLogin(val.mail, val.password);
					resetForm();
					setTimeout(() => setErrorMessage(false), 8000);
				}}
			>
				{({ errors }) => (
					<Form className='formulario' autoComplete='off'>
						<h2>Ingresá a tu Club:</h2>
						<p>ingrese su email y contraseña</p>
						<div>
							<Field type='text' name='mail' id='email' placeholder='email' />

							<ErrorMessage name='mail' component={() => <div className='error_login'>{errors.mail}</div>} />
						</div>
						<div>
							<Field type='password' id='password' name='password' placeholder='********' />
							<ErrorMessage name='password' component={() => <div className='error_login'>{errors.password}</div>} />
						</div>
						<button type='submit' className='submit'>
							Iniciar Sesión
						</button>
						{errorMessage && <div className='error_login'>{errorMessage}</div>}
					</Form>
				)}
			</Formik>
		</div>
	);
}

export default Login;
