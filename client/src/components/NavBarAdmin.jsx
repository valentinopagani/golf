import { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import Container from '@mui/material/Container';
import MenuItem from '@mui/material/MenuItem';
import { CgMenuLeft } from 'react-icons/cg';
import firebaseApp from '../firebase/firebase';
import { getAuth, signOut } from 'firebase/auth';
import Typography from '@mui/material/Typography';
import { TbGolfOff } from 'react-icons/tb';
import { Link } from 'react-router-dom';
const auth = getAuth(firebaseApp);

function NavBarAdmin() {
	const [anchorElNav, setAnchorElNav] = useState(null);

	const handleOpenNavMenu = (event) => {
		setAnchorElNav(event.currentTarget);
	};
	const handleCloseNavMenu = () => {
		setAnchorElNav(null);
	};

	return (
		<AppBar className='nav' sx={{ backgroundColor: 'green', padding: '0 30px' }}>
			<Container sx={{ maxWidth: '1600px !important' }}>
				<Toolbar disableGutters>
					<Typography
						noWrap
						sx={{
							color: '#ffffab',
							fontSize: 20,
							fontWeight: 'bold',
							mr: 5,
							display: { xs: 'none', md: 'flex' }
						}}
					>
						Administrador
					</Typography>
					<Box
						sx={{
							flexGrow: 1,
							display: { xs: 'flex', md: 'none' }
						}}
					>
						<IconButton size='large' aria-label='account of current user' aria-controls='menu-appbar' aria-haspopup='true' onClick={handleOpenNavMenu} color='inherit'>
							<CgMenuLeft size={30} />
						</IconButton>
						<Menu
							id='menu-appbar'
							anchorEl={anchorElNav}
							anchorOrigin={{
								vertical: 'bottom',
								horizontal: 'left'
							}}
							keepMounted
							transformOrigin={{
								vertical: 'top',
								horizontal: 'left'
							}}
							open={Boolean(anchorElNav)}
							onClose={handleCloseNavMenu}
							sx={{
								display: {
									xs: 'block',
									md: 'none'
								}
							}}
						>
							<MenuItem>
								<span className='nav_a'>Añadir y Ver Torneos</span>
							</MenuItem>
							<MenuItem>
								<span className='nav_a'>Inscripciones</span>
							</MenuItem>
							<MenuItem>
								<span className='nav_a'>Tu Cancha</span>
							</MenuItem>
							<MenuItem>
								<span className='nav_a'>Jugadores</span>
							</MenuItem>
						</Menu>
					</Box>
					<Box
						sx={{
							flexGrow: 1,
							display: {
								xs: 'none',
								md: 'flex'
							}
						}}
					>
						<Link to='/administrador' className='nav_a' sx={{ my: 2, display: 'block' }}>
							Añadir y Ver Torneos
						</Link>
						<Link to='/administrador/inscripciones' className='nav_a' sx={{ my: 2, display: 'block' }}>
							Inscripciones
						</Link>
						<Link to='/administrador' className='nav_a' sx={{ my: 2, display: 'block' }}>
							Tu Cancha
						</Link>
						<Link to='/' className='nav_a' sx={{ my: 2, display: 'block' }}>
							Jugadores
						</Link>
					</Box>
					<Box sx={{ flexGrow: 0 }}>
						<IconButton onClick={() => signOut(auth)} title='Cerrar Sesion'>
							<TbGolfOff color='white' fontSize='30' />
						</IconButton>
					</Box>
				</Toolbar>
			</Container>
		</AppBar>
	);
}
export default NavBarAdmin;
