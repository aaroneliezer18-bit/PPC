// Controlador basico de formularios: valida datos, guarda demo en localStorage y muestra feedback
(function () {
  var STORAGE_KEY = "demoUser";
  var WORKER_SESSION_KEY = "demoWorkerSession";

  /**
   * Escribe un mensaje en el elemento de estado.
   * @param {HTMLElement|null} target elemento donde se muestra el texto
   * @param {string} message contenido a mostrar
   * @param {"success"|"error"} type tipo de mensaje para colorear
   */
  function setStatus(target, message, type) {
    if (!target) return;
    target.textContent = message;
    target.classList.remove("success", "error");
    if (type) {
      target.classList.add(type);
    }
  }

  /** Guarda los datos basicos del usuario en localStorage (modo demo). */
  function saveUser(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("No se pudo guardar en localStorage:", error);
    }
  }

  /** Recupera los datos del usuario almacenados. */
  function getUser() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.error("No se pudo leer de localStorage:", error);
      return null;
    }
  }

  /** Limpia la sesion demo. */
  function clearUser() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("No se pudo borrar de localStorage:", error);
    }
  }

  /** Guarda sesion de trabajador (quien inicia como empleado). */
  function saveWorkerSession(worker) {
    try {
      localStorage.setItem(WORKER_SESSION_KEY, JSON.stringify(worker));
    } catch (error) {
      console.error("No se pudo guardar la sesion del trabajador:", error);
    }
  }

  /** Obtiene sesion de trabajador. */
  function getWorkerSession() {
    try {
      var raw = localStorage.getItem(WORKER_SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.error("No se pudo leer la sesion del trabajador:", error);
      return null;
    }
  }

  /** Limpia sesion de trabajador. */
  function clearWorkerSession() {
    try {
      localStorage.removeItem(WORKER_SESSION_KEY);
    } catch (error) {
      console.error("No se pudo borrar la sesion del trabajador:", error);
    }
  }

  /** Agrega un trabajador a la empresa actual. */
  function addWorker(workerData) {
    var user = getUser();
    if (!user) return { ok: false, error: "No hay empresa registrada." };
    if (!user.workers) user.workers = [];

    var exists = user.workers.some(function (w) {
      return w.email.toLowerCase() === workerData.email.toLowerCase();
    });
    if (exists) {
      return { ok: false, error: "Ese correo ya existe como trabajador." };
    }

    user.workers.push(workerData);
    saveUser(user);
    return { ok: true };
  }

  /** Rellena la lista de trabajadores en el perfil de empresa. */
  function renderWorkers(listElement) {
    if (!listElement) return;
    listElement.innerHTML = "";
    var user = getUser();
    var workers = (user && user.workers) || [];
    if (!workers.length) {
      var liEmpty = document.createElement("li");
      liEmpty.textContent = "Sin trabajadores registrados.";
      listElement.appendChild(liEmpty);
      return;
    }
    workers.forEach(function (worker) {
      var li = document.createElement("li");
      li.innerHTML =
        "<strong>" +
        worker.name +
        "</strong> " +
        " (" +
        worker.email +
        ")";
      listElement.appendChild(li);
    });
  }

  // Manejo del formulario de inicio de sesion
  const loginForm = document.querySelector("#login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const status = document.querySelector("#login-status");
      const email = loginForm.email.value.trim();
      const password = loginForm.password.value;

      if (!email || !password) {
        setStatus(status, "Completa correo y contrasena.", "error");
        return;
      }

      const user = getUser();
      if (!user) {
        setStatus(status, "Primero crea una cuenta.", "error");
        return;
      }

      if (user.email !== email || user.password !== password) {
        setStatus(status, "Correo o contrasena incorrectos.", "error");
        return;
      }

      // Inicio de sesion demo correcto
      setStatus(status, "Listo, iniciando sesion para " + email + ".", "success");
      setTimeout(function () {
        window.location.href = "perfil.html";
      }, 500);
    });
  }

  // Manejo del formulario de registro
  const registerForm = document.querySelector("#register-form");
  if (registerForm) {
    registerForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const status = document.querySelector("#register-status");
      const company = registerForm.company.value.trim();
      const name = registerForm.fullname.value.trim();
      const email = registerForm.email.value.trim();
      const password = registerForm.password.value;
      const confirm = registerForm.passwordConfirm.value;

      if (!company || !name || !email || !password || !confirm) {
        setStatus(status, "Completa todos los campos.", "error");
        return;
      }

      if (password.length < 6) {
        setStatus(status, "La contrasena debe tener al menos 6 caracteres.", "error");
        return;
      }

      if (password !== confirm) {
        setStatus(status, "Las contrasenas no coinciden.", "error");
        return;
      }

      // Guarda la cuenta en modo demo y redirige al perfil
      saveUser({ company, name, email, password, workers: [] });
      setStatus(status, "Cuenta creada (demo). Entrando al perfil...", "success");
      setTimeout(function () {
        window.location.href = "perfil.html";
      }, 600);
    });
  }

  // Relleno de la pagina de perfil (empresa)
  const companyLabel = document.querySelector("#profile-company");
  const emailLabel = document.querySelector("#profile-email");
  const nameLabel = document.querySelector("#profile-name");
  const profileStatus = document.querySelector("#profile-status");

  if (companyLabel && emailLabel && nameLabel) {
    const user = getUser();
    if (!user) {
      setStatus(profileStatus, "No hay datos de perfil. Crea una cuenta primero.", "error");
    } else {
      companyLabel.textContent = user.company;
      emailLabel.textContent = user.email;
      nameLabel.textContent = user.name;
      setStatus(profileStatus, "Datos cargados (demo).", "success");
    }
  }

  // Creacion de trabajadores desde el perfil de empresa
  const workerForm = document.querySelector("#worker-create-form");
  if (workerForm) {
    const workerStatus = document.querySelector("#worker-create-status");
    workerForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const fullname = workerForm.fullname.value.trim();
      const email = workerForm.email.value.trim();
      const password = workerForm.password.value;

      if (!fullname || !email || !password) {
        setStatus(workerStatus, "Completa todos los campos.", "error");
        return;
      }
      if (password.length < 6) {
        setStatus(workerStatus, "La contrasena debe tener al menos 6 caracteres.", "error");
        return;
      }

      const result = addWorker({ name: fullname, email, password });
      if (!result.ok) {
        setStatus(workerStatus, result.error, "error");
        return;
      }

      workerForm.reset();
      setStatus(workerStatus, "Trabajador creado (demo).", "success");
      renderWorkers(document.querySelector("#worker-list"));
    });
  }

  // Lista de trabajadores en el perfil de empresa
  const workerList = document.querySelector("#worker-list");
  if (workerList) {
    renderWorkers(workerList);
  }

  // Botones de navegacion/ cierre de sesion en perfil
  const backButton = document.querySelector("#back-to-login");
  if (backButton) {
    backButton.addEventListener("click", function () {
      window.location.href = "index.html";
    });
  }

  const logoutButton = document.querySelector("#logout");
  if (logoutButton) {
    logoutButton.addEventListener("click", function () {
      clearUser();
      window.location.href = "index.html";
    });
  }

  // Login de trabajadores
  const workerLoginForm = document.querySelector("#worker-login-form");
  if (workerLoginForm) {
    workerLoginForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const status = document.querySelector("#worker-login-status");
      const email = workerLoginForm.email.value.trim();
      const password = workerLoginForm.password.value;

      if (!email || !password) {
        setStatus(status, "Completa correo y contrasena.", "error");
        return;
      }

      const user = getUser();
      if (!user || !user.workers || !user.workers.length) {
        setStatus(status, "No hay empresa ni trabajadores registrados.", "error");
        return;
      }

      const worker = user.workers.find(function (w) {
        return w.email.toLowerCase() === email.toLowerCase() && w.password === password;
      });

      if (!worker) {
        setStatus(status, "Credenciales incorrectas.", "error");
        return;
      }

      saveWorkerSession({ name: worker.name, email: worker.email, company: user.company });
      setStatus(status, "Bienvenido, " + worker.name + ".", "success");
      setTimeout(function () {
        window.location.href = "perfil-trabajador.html";
      }, 500);
    });
  }

  // Perfil de trabajador
  const workerName = document.querySelector("#worker-name");
  const workerEmail = document.querySelector("#worker-email");
  const workerCompany = document.querySelector("#worker-company");
  const workerProfileStatus = document.querySelector("#worker-profile-status");

  if (workerName && workerEmail && workerCompany) {
    const session = getWorkerSession();
    if (!session) {
      setStatus(workerProfileStatus, "No hay sesion de trabajador activa.", "error");
    } else {
      workerName.textContent = session.name;
      workerEmail.textContent = session.email;
      workerCompany.textContent = session.company;
      setStatus(workerProfileStatus, "Datos cargados (demo).", "success");
    }
  }

  // Navegacion y cierre en perfil de trabajador
  const workerBack = document.querySelector("#worker-back");
  if (workerBack) {
    workerBack.addEventListener("click", function () {
      window.location.href = "trabajador.html";
    });
  }

  const workerLogout = document.querySelector("#worker-logout");
  if (workerLogout) {
    workerLogout.addEventListener("click", function () {
      clearWorkerSession();
      window.location.href = "trabajador.html";
    });
  }
})();
