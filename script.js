// Quiz Module Pattern
const Quiz = (() => {
  const questions = [
    {
      question: "¿Cuál es el máximo recomendado de campos en un formulario simple?",
      options: ["5-7", "10-12", "15-20"],
      answer: 0
    },
    {
      question: "¿Qué principio establece que las opciones deben ser mínimas?",
      options: ["Ley de Hick", "Principio de Pareto", "Ley de Fitts"],
      answer: 0
    },
    {
      question: "¿Qué color es mejor para mensajes de error?",
      options: ["Azul", "Rojo", "Verde"],
      answer: 1
    },
    {
      question: "¿Qué elemento NO mejora un formulario?",
      options: ["Autocompletado", "Validación en tiempo real", "Submenús anidados"],
      answer: 2
    },
    {
      question: "¿Qué técnica reduce la fatiga de formularios?",
      options: ["Multi-step", "Campos largos", "Letra pequeña"],
      answer: 0
    }
  ];

  let currentQuestion = 0;
  let score = 0;

  const showQuestion = () => {
    const q = questions[currentQuestion];
    document.getElementById('question').innerHTML = `<h4>${q.question}</h4>`;
    
    const optionsHTML = q.options.map((option, i) => `
      <button class="quiz-option" onclick="Quiz.checkAnswer(${i})">${option}</button>
    `).join('');
    
    document.getElementById('options').innerHTML = optionsHTML;
    document.getElementById('quiz-progress').style.width = 
      `${(currentQuestion/questions.length)*100}%`;
  };

  const checkAnswer = (selected) => {
    const buttons = document.querySelectorAll('#options button');
    const q = questions[currentQuestion];
    
    buttons.forEach((btn, i) => {
      btn.disabled = true;
      btn.classList.remove('correct', 'incorrect');
      if(i === q.answer) btn.classList.add('correct');
      else if(i === selected) btn.classList.add('incorrect');
    });

    if(selected === q.answer) score++;
    
    setTimeout(() => {
      updateScore();
      currentQuestion++;
      currentQuestion < questions.length ? showQuestion() : showResult();
    }, 1500);
  };

  const updateScore = () => {
    document.getElementById('score').textContent = `Puntuación: ${score}/${questions.length}`;
  };

  const showResult = () => {
    document.getElementById('quiz-container').style.display = 'none';
    const result = document.getElementById('result');
    result.style.display = 'block';
    
    const percentage = (score/questions.length)*100;
    result.innerHTML = `
      <h3 id="result-title">${
        percentage >= 80 ? '🎉 ¡Excelente!' : 
        percentage >= 50 ? '👍 ¡Bien hecho!' : 
        '💡 ¡Sigue practicando!'
      }</h3>
      <p>Obtuviste ${score} de ${questions.length} correctas</p>
      <button class="btn-secondary" onclick="Quiz.resetQuiz()">Reintentar</button>
    `;
  };

  const resetQuiz = () => {
    currentQuestion = 0;
    score = 0;
    document.getElementById('quiz-container').style.display = 'block';
    document.getElementById('result').style.display = 'none';
    updateScore();
    showQuestion();
  };

  return {
    checkAnswer,
    resetQuiz,
    showQuestion
  };
})();

// Sistema Principal
document.addEventListener('DOMContentLoaded', () => {
  console.log('Documento cargado, inicializando navegación...');
  
  // Obtener referencias a todos los elementos importantes
  const allPages = document.querySelectorAll('.page');
  const navLeft = document.getElementById('nav-left');
  const navRight = document.getElementById('nav-right');
  const menuToggle = document.getElementById('menu-toggle');
  const menuClose = document.getElementById('menu-close');
  const navMenu = document.getElementById('nav-menu');
  const progressIndicator = document.getElementById('progress-indicator');
  const pageCounter = document.getElementById('page-counter');
  
  console.log(`Total de páginas encontradas: ${allPages.length}`);
  
  // Estado actual
  let currentPageIndex = 0;
  
  // Función para inicializar la navegación
  function initNavigation() {
    // Posicionar todas las páginas
    allPages.forEach((page, index) => {
      page.style.transform = `translateX(${index * 100}%)`;
      page.style.zIndex = 999 - index;
      
      // Quitar clase active de todas las páginas excepto la primera
      if (index === 0) {
        page.classList.add('active');
      } else {
        page.classList.remove('active');
      }
    });
    
    // Actualizar contador e indicador
    updatePageCounter();
    updateProgressIndicator();
    
    console.log('Navegación inicializada correctamente');
  }
  
  // Navegar a una página específica
  function goToPage(pageIndex) {
    if (pageIndex < 0 || pageIndex >= allPages.length || pageIndex === currentPageIndex) {
      console.log(`Navegación ignorada: ${pageIndex} (actual: ${currentPageIndex}, total: ${allPages.length})`);
      return;
    }
    
    console.log(`Navegando a página ${pageIndex + 1} de ${allPages.length}`);
    
    // Detectar si es móvil
    const isMobile = window.innerWidth <= 768;
    
    // Primero reseteamos el scroll vertical del contenedor antes de cambiar de página
    // Esto evita problemas con el desplazamiento vertical al navegar
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    
    // Para dispositivos móviles, también aseguramos que la página actual se resetea
    if (isMobile && allPages[currentPageIndex]) {
      allPages[currentPageIndex].scrollTop = 0;
    }
    
    // Mover todas las páginas según el nuevo índice
    allPages.forEach((page, index) => {
      const offset = (index - pageIndex) * 100;
      page.style.transform = `translateX(${offset}%)`;
      
      // Forzar un reflow para asegurar que la transformación se aplica correctamente
      page.offsetWidth;
      
      // Hacer que sólo la página activa tenga overflow-y: auto
      if (index === pageIndex) {
        page.style.overflowY = 'auto';
      } else {
        page.style.overflowY = 'hidden';
      }
    });
    
    // Actualizar clases active
    allPages[currentPageIndex].classList.remove('active');
    allPages[pageIndex].classList.add('active');
    
    // Actualizar índice actual
    currentPageIndex = pageIndex;
    
    // Actualizar UI
    updatePageCounter();
    updateProgressIndicator();
    
    // Cerrar menú si está abierto
    if (navMenu.classList.contains('visible')) {
      toggleMenu();
    }
    
    // Disparar evento de navegación completada
    setTimeout(() => {
      const event = new CustomEvent('navigationEnd');
      document.dispatchEvent(event);
      console.log('Evento navigationEnd disparado');
    }, 400);
  }
  
  // Navegar a la siguiente o anterior página
  function navigate(direction) {
    console.log(`Petición de navegación: ${direction}`);
    const newIndex = direction === 'next' 
      ? Math.min(currentPageIndex + 1, allPages.length - 1)
      : Math.max(currentPageIndex - 1, 0);
      
    goToPage(newIndex);
  }
  
  // Actualizar contador de páginas
  function updatePageCounter() {
    pageCounter.textContent = `${currentPageIndex + 1}/${allPages.length}`;
  }
  
  // Actualizar indicador de progreso
  function updateProgressIndicator() {
    const progressWidth = ((currentPageIndex + 1) / allPages.length) * 100;
    progressIndicator.style.width = `${progressWidth}%`;
  }
  
  // Mostrar/ocultar menú de navegación
  function toggleMenu() {
    navMenu.classList.toggle('visible');
    navMenu.classList.toggle('hidden');
  }
  
  // Inicializar navegación
  initNavigation();
  
  // Configurar manejadores de eventos
  navLeft.addEventListener('click', () => {
    console.log('Clic en flecha izquierda');
    const navArrow = navLeft.querySelector('.nav-arrow');
    navArrow.classList.add('nav-pulse');
    setTimeout(() => navArrow.classList.remove('nav-pulse'), 300);
    navigate('prev');
  });
  
  navRight.addEventListener('click', () => {
    console.log('Clic en flecha derecha');
    const navArrow = navRight.querySelector('.nav-arrow');
    navArrow.classList.add('nav-pulse');
    setTimeout(() => navArrow.classList.remove('nav-pulse'), 300);
    navigate('next');
  });

  menuToggle.addEventListener('click', toggleMenu);
  menuClose.addEventListener('click', toggleMenu);
  
  // Navegación con teclado
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      console.log('Tecla: flecha izquierda');
      navigate('prev');
      const navArrow = navLeft.querySelector('.nav-arrow');
      navArrow.classList.add('nav-pulse');
      setTimeout(() => navArrow.classList.remove('nav-pulse'), 300);
    } else if (e.key === 'ArrowRight') {
      console.log('Tecla: flecha derecha');
      navigate('next');
      const navArrow = navRight.querySelector('.nav-arrow');
      navArrow.classList.add('nav-pulse');
      setTimeout(() => navArrow.classList.remove('nav-pulse'), 300);
    } else if (e.key === 'Escape' && navMenu.classList.contains('visible')) {
      toggleMenu();
    }
  });

  // Recalcular páginas al cambiar tamaño de ventana
  window.addEventListener('resize', () => {
    console.log('Ventana redimensionada, recalculando páginas...');
    goToPage(currentPageIndex);
  });

  // Navegación desde el menú
  const menuLinks = document.querySelectorAll('.nav-menu a');
  menuLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const pageIndex = parseInt(link.getAttribute('data-page'));
      console.log(`Clic en enlace de menú para página: ${pageIndex}`);
      if (!isNaN(pageIndex)) {
        goToPage(pageIndex);
      } else {
        // Navegación por hash como fallback
        const targetId = link.getAttribute('href');
        console.log(`Navegación por hash: ${targetId}`);
        const targetSection = document.querySelector(targetId);
        if (targetSection) {
          const targetIndex = Array.from(allPages).indexOf(targetSection);
          if (targetIndex >= 0) {
            console.log(`Encontrado elemento, navegando a índice: ${targetIndex}`);
            goToPage(targetIndex);
          }
        }
      }
    });
  });

  // Manejo de formularios
  const form = document.getElementById('feedback-form');
  form?.addEventListener('submit', (e) => {
    if(!form.checkValidity()) {
      e.preventDefault();
      form.reportValidity();
    } else {
      e.preventDefault();
      alert('¡Gracias por tu feedback! Lo tendremos en cuenta para la próxima edición.');
      form.reset();
    }
  });
  
  // Verificar páginas especiales
  function checkSpecialPages() {
    console.log(`Verificando páginas especiales. Página actual: ${currentPageIndex + 1}`);
    
    // Verificar quiz
    const quizPage = document.getElementById('art6');
    if (quizPage && quizPage.classList.contains('active')) {
      console.log('Página de Quiz activa');
      // Añadir animación de entrada al quiz
      const quizContainer = document.querySelector('.quiz-game');
      if (quizContainer) {
        quizContainer.classList.add('bounce-in');
        setTimeout(() => {
          quizContainer.classList.remove('bounce-in');
        }, 1000);
      }
      setTimeout(() => Quiz.showQuestion(), 50);
    }
    
    // Animar elementos cuando se navega a la página de validación
    const validationPage = document.getElementById('art15');
    if (validationPage && validationPage.classList.contains('active')) {
      // Activar animaciones específicas
      const elementsToAnimate = validationPage.querySelectorAll('.animated-entrance');
      elementsToAnimate.forEach((el, index) => {
        setTimeout(() => {
          el.classList.add('animated-visible');
        }, 100 * index);
      });
    }
  };

  // Verificar páginas especiales al inicio y después de cada navegación
  checkSpecialPages();
  document.addEventListener('navigationEnd', checkSpecialPages);
  
  // Implementar gestos táctiles para navegación móvil
  function setupTouchNavigation() {
    const container = document.querySelector('.page-container');
    let touchStartX = 0;
    let touchEndX = 0;
    let touchStartY = 0;
    let touchEndY = 0;
    
    // Detectar inicio de toque
    container.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    }, {passive: true});
    
    // Detectar fin de toque y determinar dirección
    container.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      touchEndY = e.changedTouches[0].screenY;
      handleSwipe();
    }, {passive: true});
    
    function handleSwipe() {
      const diffX = touchStartX - touchEndX;
      const diffY = touchStartY - touchEndY;
      
      // Verificar que el movimiento horizontal es mayor que el vertical
      // y que tiene suficiente distancia para considerarlo un swipe
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        if (diffX > 0) {
          // Swipe a la izquierda → ir a la siguiente página
          console.log('Swipe detectado: izquierda');
          navigate('next');
        } else {
          // Swipe a la derecha → ir a la página anterior
          console.log('Swipe detectado: derecha');
          navigate('prev');
        }
      }
    }
    
    console.log('Navegación táctil configurada');
  }
  
  // Inicializar navegación táctil para dispositivos móviles
  setupTouchNavigation();
  
  // Añadir efecto de hover 3D a las tarjetas
  function addHoverEffect() {
    const cards = document.querySelectorAll('.card, .stat-card, .anatomy-card');
    console.log(`Añadiendo efecto hover 3D a ${cards.length} tarjetas`);
    
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        // Solo en dispositivos desktop (no táctiles)
        if (window.innerWidth <= 768) return;
        
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
      });
      
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }
  
  // Ejecutar después de la carga completa
  setTimeout(addHoverEffect, 1000);
  
  // Añadir emoji aleatorios que flotan en la contraportada
  function addFloatingEmojis() {
    const backCover = document.querySelector('.back-cover');
    if (!backCover) {
      console.log('No se encontró el elemento back-cover para los emojis flotantes');
      return;
    }
    
    console.log('Añadiendo emojis flotantes a la contraportada');
    const emojis = ['✨', '🚀', '💻', '🌟', '📱', '🔍', '💡', '⚡', '🎯', '🎨', '🔧'];
    
    for (let i = 0; i < 10; i++) {
      const emoji = document.createElement('div');
      emoji.className = 'floating-emoji';
      emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      emoji.style.left = `${Math.random() * 90}%`;
      emoji.style.animationDuration = `${5 + Math.random() * 10}s`;
      emoji.style.animationDelay = `${Math.random() * 5}s`;
      backCover.appendChild(emoji);
    }
  }
  
    // Manejo de formularios de feedback
  const feedbackForm = document.getElementById('feedback-form');
  if (feedbackForm) {
    feedbackForm.addEventListener('submit', (e) => {
      e.preventDefault();
      console.log('Formulario de feedback enviado');
      alert('¡Gracias por tu feedback! Lo tendremos en cuenta para la próxima edición.');
      feedbackForm.reset();
    });
  }

  // Ejecutar efectos visuales después de la carga completa
  setTimeout(() => {
    addHoverEffect();
    addFloatingEmojis();
    console.log('Efectos visuales inicializados');
  }, 1000);
});

// Notificar que el script se ha cargado completamente
console.log('✅ Script cargado completamente');

