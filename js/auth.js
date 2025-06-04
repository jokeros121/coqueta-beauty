document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;
  const token = localStorage.getItem('token');
  const expiration = localStorage.getItem('token_expiration');
  const isExpired = expiration && Date.now() > parseInt(expiration);

  // PROTECCIÓN DEL DASHBOARD
  if (path.includes('dashboard.html')) {
    if (!token || isExpired) {
      logoutAndRedirect();
      return;
    } else {
      const username = localStorage.getItem('user') || 'Usuario';
      document.getElementById('username-display').textContent = username;
    }
  }

  // REDIRECCIÓN AL DASHBOARD SI YA INICIÓ SESIÓN
  if ((path.includes('login.html') || path.endsWith('/')) && token && !isExpired) {
    window.location.href = 'dashboard.html';
    return;
  }

  // LOGIN
  const loginForm = document.getElementById('formLogin');
  if (loginForm) {
    const loginBtn = document.getElementById('loginBtn');
    
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const usuario = document.getElementById('usuario').value.trim();
      const clave = document.getElementById('clave').value.trim();

      // Validación básica
      if (!usuario || !clave) {
        showError('Por favor complete todos los campos');
        return;
      }

      // Mostrar estado de carga
      loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Ingresando...';
      loginBtn.disabled = true;

      try {
        const res = await fetch('https://coqueta.fluxis.com.co/api/sesion', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ usuario, clave })
        });

        const json = await res.json();

        if (res.ok && json.accessToken) {
          const expirationTime = Date.now() + 60 * 60 * 1000; // 1 hora

          localStorage.setItem('token', json.accessToken);
          localStorage.setItem('user', usuario);
          localStorage.setItem('token_expiration', expirationTime);

          await Swal.fire({
            icon: 'success',
            title: '¡Bienvenido!',
            text: 'Inicio de sesión exitoso. Serás dirigido al panel...',
            timer: 2000,
            showConfirmButton: false
          });
          
          window.location.href = 'dashboard.html';
        } else {
          throw new Error(json.message || 'Credenciales incorrectas');
        }
      } catch (err) {
        console.error('Error en login:', err);
        showError(err.message || 'Hubo un problema con la conexión. Intenta más tarde.');
      } finally {
        // Restaurar estado del botón
        loginBtn.innerHTML = '<i class="fas fa-sign-in-alt mr-2"></i> Ingresar';
        loginBtn.disabled = false;
      }
    });

    // Mostrar/ocultar contraseña
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('clave');
    
    if (togglePassword && passwordInput) {
      togglePassword.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        togglePassword.classList.toggle('fa-eye');
        togglePassword.classList.toggle('fa-eye-slash');
      });
    }
  }

  // LOGOUT
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      logoutAndRedirect();
    });
  }

  // FUNCIÓN DE LOGOUT
  function logoutAndRedirect() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('token_expiration');
    window.location.href = 'login.html';
  }

  // FUNCIÓN PARA MOSTRAR ERRORES
  function showError(message) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: message,
      confirmButtonColor: '#db2777'
    });

    // Animación de error en los inputs
    const inputs = document.querySelectorAll('.input-group');
    inputs.forEach(input => {
      input.classList.add('error');
      setTimeout(() => input.classList.remove('error'), 500);
    });
  }
});