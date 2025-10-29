document.addEventListener('DOMContentLoaded', () => {
    // --- Lógica del Menú Hamburguesa ---
    const hamburger = document.querySelector('.hamburger-menu');
    const navMenu = document.querySelector('.main-nav');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }

    // --- Lógica del Carrusel (Página de Inicio) ---
    const carousel = document.querySelector('.carousel-container');
    if (carousel) {
        const slide = carousel.querySelector('.carousel-slide');
        const items = carousel.querySelectorAll('.carousel-item');
        const nextBtn = carousel.querySelector('.next');
        const prevBtn = carousel.querySelector('.prev');
        
        let currentIndex = 0;
        const totalItems = items.length;

        function updateCarousel() {
            // Mueve el slide a la posición correcta
            slide.style.transform = `translateX(-${currentIndex * 100}%)`;
        }

        nextBtn.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % totalItems;
            updateCarousel();
        });

        prevBtn.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + totalItems) % totalItems;
            updateCarousel();
        });

        // Se ha desactivado el avance automático. Para reactivarlo, descomenta las siguientes líneas.
        // setInterval(() => {
        //     nextBtn.click();
        // }, 5000);
    }

    // --- Lógica de Autenticación y UI ---
    const loggedInUser = localStorage.getItem('loggedInUser');
    const loginLink = document.querySelector('a[href$="login.html"]');

    if (loggedInUser && loginLink) {
        // Cambiar "Iniciar Sesión" por el email del usuario y un botón de "Cerrar Sesión"
        const userMenuLi = document.createElement('li');
        userMenuLi.classList.add('user-menu');

        const userDisplay = document.createElement('span');
        userDisplay.textContent = loggedInUser;
        userDisplay.classList.add('user-display');

        const dropdownMenu = document.createElement('div');
        dropdownMenu.classList.add('user-dropdown');

        const logoutButton = document.createElement('a');
        logoutButton.textContent = 'Cerrar Sesión';
        logoutButton.href = '#';
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('loggedInUser');
            window.location.href = window.location.origin + '/index.html'; // Redirección robusta al inicio
        });

        dropdownMenu.appendChild(logoutButton);
        userMenuLi.appendChild(userDisplay);
        userMenuLi.appendChild(dropdownMenu);

        loginLink.parentElement.replaceWith(userMenuLi);
    }

    // --- Lógica del Formulario de Login ---
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = e.target.email.value;
            const password = e.target.password.value;

            // Simulación de credenciales
            if (email === 'alumno@eest5.com' && password === '1234') {
                localStorage.setItem('loggedInUser', email);
                window.location.href = '../index.html';
            } else {
                alert('Credenciales incorrectas. Inténtalo de nuevo.');
            }
        });
    }

    // --- Lógica para Proteger Rutas ---
    const isCreateTopicPage = window.location.pathname.includes('/temas/crear-tema.html');
    if (isCreateTopicPage && !loggedInUser) {
        alert('Debes iniciar sesión para crear un nuevo tema.');
        window.location.href = '../registros/login.html';
    }

    // --- Lógica para Guardar y Mostrar Temas ---
    const createTopicForm = document.getElementById('create-topic-form');
    if (createTopicForm) {
        createTopicForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const title = e.target['topic-title'].value;
            const content = e.target['topic-content'].value;
            const category = e.target['topic-category'].value;

            const newTopic = {
                id: Date.now(), // ID único
                title,
                content,
                category,
                author: loggedInUser,
                date: new Date().toLocaleString('es-ES')
            };

            // Guardar en localStorage
            const topics = JSON.parse(localStorage.getItem('topics')) || [];
            topics.push(newTopic);
            localStorage.setItem('topics', JSON.stringify(topics));

            // Redirigir a la página de la categoría
            window.location.href = `../especialidades/${category}.html`;
        });
    }

    // --- Lógica para Cargar Temas en las páginas de especialidades ---
    const forumList = document.querySelector('.forum-list');
    if (forumList) {        
        // Primero, clona los temas de ejemplo que ya están en el HTML
        const exampleTopics = Array.from(forumList.querySelectorAll('.topic'));
        forumList.innerHTML = ''; // Limpia la lista para re-dibujar

        const topics = JSON.parse(localStorage.getItem('topics')) || [];
        const currentPageCategory = window.location.pathname.split('/').pop().replace('.html', '');

        const categoryTopics = topics.filter(topic => topic.category === currentPageCategory);

        categoryTopics.forEach(topic => {
            const topicElement = document.createElement('div');
            topicElement.classList.add('topic');
            topicElement.innerHTML = `
                <div class="topic-icon">📝</div>
                <div class="topic-details">
                    <h3><a href="../temas/tema.html?id=${topic.id}">${topic.title}</a></h3>
                    <div class="topic-info">Iniciado por <a href="#">${topic.author}</a> el ${topic.date}</div>
                </div>
                <div class="topic-stats">
                    <div><strong>0</strong> respuestas</div>
                    <div><strong>0</strong> vistas</div>
                </div>
            `;
            forumList.appendChild(topicElement);
        });

        // Vuelve a añadir los temas de ejemplo al final
        exampleTopics.forEach(topic => forumList.appendChild(topic));
    }

    // --- Lógica para Cargar un Tema específico en tema.html ---
    const isTopicPage = window.location.pathname.includes('/temas/tema.html');
    if (isTopicPage) {
        const urlParams = new URLSearchParams(window.location.search);
        const topicId = parseInt(urlParams.get('id'));

        const topics = JSON.parse(localStorage.getItem('topics')) || [];
        const topic = topics.find(t => t.id === topicId);

        // Si no se encuentra un tema dinámico, no hacer nada y dejar que la página muestre el contenido de ejemplo.
        if (!topicId) {
             // Esto permite que los enlaces de ejemplo que no tienen ID sigan funcionando y muestren el tema de ejemplo.
            return; 
        }

        const replyFormWrapper = document.getElementById('reply-form-wrapper');

        if (!loggedInUser) {
            replyFormWrapper.style.display = 'none'; // Ocultar formulario de respuesta si no ha iniciado sesión
        }

        if (topic) {
            // Actualizar la página con la información del tema
            document.title = `${topic.title} - Foro E.E.S.T. N°5`;
            document.getElementById('topic-title').textContent = topic.title;
            document.getElementById('original-post-author').textContent = topic.author;
            document.getElementById('original-post-date').textContent = `Publicado el ${topic.date}`;
            document.getElementById('original-post-content').innerHTML = `<p>${topic.content.replace(/\n/g, '</p><p>')}</p>`;
            
            const authorInitial = topic.author.charAt(0).toUpperCase();
            document.getElementById('author-avatar').textContent = authorInitial;

            document.getElementById('original-post-container').style.display = 'flex';

            // Cargar respuestas
            loadReplies(topic);

        } else {
            document.getElementById('topic-header').innerHTML = '<h1>Error: Tema no encontrado</h1><p>El tema que buscas no existe o ha sido eliminado.</p>';
        }

        // Manejar el envío de nuevas respuestas
        const replyForm = document.getElementById('reply-form');
        if (replyForm) {
            replyForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const replyContent = e.target.querySelector('textarea').value;

                const newReply = {
                    author: loggedInUser,
                    content: replyContent,
                    date: new Date().toLocaleString('es-ES')
                };

                // Inicializar el array de respuestas si no existe
                if (!topic.replies) {
                    topic.replies = [];
                }
                topic.replies.push(newReply);

                // Actualizar el tema en el array de temas
                const topicIndex = topics.findIndex(t => t.id === topicId);
                topics[topicIndex] = topic;

                // Guardar de nuevo en localStorage
                localStorage.setItem('topics', JSON.stringify(topics));

                // Recargar la página para mostrar la nueva respuesta
                window.location.reload();
            });
        }
    }

    function loadReplies(topic) {
        const responsesContainer = document.getElementById('responses-container');
        responsesContainer.innerHTML = ''; // Limpiar respuestas existentes

        if (topic.replies && topic.replies.length > 0) {
            topic.replies.forEach(reply => {
                const replyElement = document.createElement('div');
                replyElement.classList.add('post');
                
                const authorInitial = reply.author.charAt(0).toUpperCase();

                replyElement.innerHTML = `
                    <div class="post-author">
                        <div class="author-avatar">${authorInitial}</div>
                        <div class="author-details">
                            <strong>${reply.author}</strong>
                            <small>Publicado el ${reply.date}</small>
                        </div>
                    </div>
                    <div class="post-content">
                        <p>${reply.content.replace(/\n/g, '</p><p>')}</p>
                    </div>
                `;
                responsesContainer.appendChild(replyElement);
            });
        } else {
            responsesContainer.innerHTML = '<p>Aún no hay respuestas. ¡Sé el primero en comentar!</p>';
        }
    }
});