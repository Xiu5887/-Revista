// Juego.js - Input/Output Challenge Game

const IOChallenge = (() => {
    // Game state
    let score = 0;
    let timeRemaining = 60;
    let timer = null;
    let isPlaying = false;
    let highScore = localStorage.getItem('ioHighScore') || 0;
    
    // Game configuration
    const levels = [
      {
        name: "Nivel 1: Básico",
        pairs: [
          { input: "Teclado", output: "Texto en pantalla" },
          { input: "Micrófono", output: "Archivo de audio" },
          { input: "Cámara", output: "Imagen digital" },
          { input: "Mouse", output: "Movimiento del cursor" },
          { input: "Sensor táctil", output: "Coordenadas de posición" }
        ]
      },
      {
        name: "Nivel 2: Intermedio",
        pairs: [
          { input: "Formulario web", output: "Base de datos" },
          { input: "API request", output: "JSON response" },
          { input: "Lector biométrico", output: "Perfil de autenticación" },
          { input: "Sensor de temperatura", output: "Gráfica de calor" },
          { input: "Voz humana", output: "Comando del sistema" },
          { input: "Acelerómetro", output: "Datos de movimiento" }
        ]
      },
      {
        name: "Nivel 3: Avanzado",
        pairs: [
          { input: "Algoritmo de ML", output: "Predicción" },
          { input: "Sensor LiDAR", output: "Modelo 3D" },
          { input: "Patrón cerebral", output: "Interfaz neuronal" },
          { input: "Datos biométricos", output: "Identificación única" },
          { input: "Gestos", output: "Comando holográfico" },
          { input: "Señal IoT", output: "Automatización" },
          { input: "Blockchain input", output: "Smart contract" }
        ]
      }
    ];
    
    let currentLevel = 0;
    let selectedCards = [];
    let matchedPairs = 0;
    let currentPairs = [];
    
    // DOM Elements to be initialized
    let gameContainer, scoreDisplay, timerDisplay, levelDisplay, startButton;
    
    // Initialize the game
    const init = () => {
      // Create game UI if it doesn't exist
      if (!document.getElementById('io-game-container')) {
        createGameUI();
      }
      
      // Get DOM references
      gameContainer = document.getElementById('io-game-board');
      scoreDisplay = document.getElementById('io-game-score');
      timerDisplay = document.getElementById('io-game-timer');
      levelDisplay = document.getElementById('io-game-level');
      startButton = document.getElementById('io-game-start');
      highScoreDisplay = document.getElementById('io-game-highscore');
      
      // Update high score display
      highScoreDisplay.textContent = `Record: ${highScore}`;
      
      // Set up event listeners
      startButton.addEventListener('click', startGame);
      
      // Initialize displays
      updateScore();
      updateTimer();
      levelDisplay.textContent = levels[currentLevel].name;
    };
    
    // Create the game UI
    const createGameUI = () => {
      const gameUI = document.createElement('div');
      gameUI.id = 'io-game-container';
      gameUI.innerHTML = `
        <div class="io-game-header">
          <h2>Desafío de Entradas y Salidas</h2>
          <p>Conecta cada entrada con su salida correspondiente</p>
        </div>
        <div class="io-game-status">
          <div class="io-game-info">
            <span id="io-game-level">Nivel 1</span>
            <span id="io-game-score">Puntos: 0</span>
            <span id="io-game-highscore">Record: 0</span>
          </div>
          <div class="io-game-controls">
            <span id="io-game-timer">Tiempo: 60s</span>
            <button id="io-game-start" class="btn-primary">Iniciar Juego</button>
          </div>
        </div>
        <div id="io-game-board" class="io-game-board"></div>
        <div id="io-game-message" class="io-game-message hidden"></div>
      `;
      
      // Add custom styles
      const styles = document.createElement('style');
      styles.textContent = `
        #io-game-container {
          background: linear-gradient(135deg, #f6f8f9 0%, #e5ebee 50%, #d7dee3 100%);
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          margin: 20px auto;
          max-width: 800px;
          overflow: hidden;
          padding: 20px;
          font-family: Arial, sans-serif;
        }
        
        .io-game-header {
          text-align: center;
          margin-bottom: 20px;
          color: #2c3e50;
        }
        
        .io-game-header h2 {
          margin: 0;
          font-size: 24px;
          color: #3498db;
        }
        
        .io-game-status {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding: 10px;
          background: rgba(255,255,255,0.8);
          border-radius: 8px;
        }
        
        .io-game-info, .io-game-controls {
          display: flex;
          gap: 15px;
        }
        
        .io-game-board {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 15px;
          margin-bottom: 20px;
        }
        
        .io-card {
          height: 80px;
          background-color: #fff;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 10px;
          text-align: center;
          font-weight: bold;
          cursor: pointer;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          transform-style: preserve-3d;
        }
        
        .io-card.input {
          background: linear-gradient(135deg, #3498db, #2980b9);
          color: white;
        }
        
        .io-card.output {
          background: linear-gradient(135deg, #2ecc71, #27ae60);
          color: white;
        }
        
        .io-card.selected {
          transform: scale(1.05);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
        }
        
        .io-card.matched {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .io-game-message {
          background-color: rgba(52, 152, 219, 0.9);
          border-radius: 8px;
          color: white;
          padding: 20px;
          text-align: center;
          margin-top: 20px;
        }
        
        .io-game-message h3 {
          margin-top: 0;
        }
        
        .hidden {
          display: none;
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #3498db, #2980b9);
          border: none;
          border-radius: 4px;
          color: white;
          cursor: pointer;
          font-weight: bold;
          padding: 8px 16px;
          transition: all 0.3s ease;
        }
        
        .btn-primary:hover {
          background: linear-gradient(135deg, #2980b9, #3498db);
          transform: translateY(-2px);
        }
        
        @media (max-width: 600px) {
          .io-game-status {
            flex-direction: column;
            gap: 10px;
          }
          
          .io-game-board {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `;
      
      // Add to document
      document.body.appendChild(styles);
      
      // Buscar la sección de gamificación o la página activa
      const gameTarget = document.querySelector('#art15') || document.querySelector('.page.active');
      
      if (gameTarget) {
        console.log(`Insertando juego en la sección: ${gameTarget.id || 'página activa'}`);
        // Insertar el juego en la sección apropiada
        gameTarget.appendChild(gameUI);
      } else {
        console.log('No se encontró la sección de gamificación, insertando en el body');
        document.body.appendChild(gameUI);
      }
    };
    
    // Start the game
    const startGame = () => {
      // Reset game state
      score = 0;
      timeRemaining = 60;
      matchedPairs = 0;
      selectedCards = [];
      currentPairs = [...levels[currentLevel].pairs];
      isPlaying = true;
      
      // Update UI
      updateScore();
      updateTimer();
      createGameBoard();
      
      // Start timer
      clearInterval(timer);
      timer = setInterval(() => {
        timeRemaining--;
        updateTimer();
        
        if (timeRemaining <= 0) {
          endGame(false);
        }
      }, 1000);
      
      // Update button
      startButton.textContent = "Reiniciar";
      
      // Hide any previous messages
      const messageEl = document.getElementById('io-game-message');
      messageEl.classList.add('hidden');
    };
    
    // Create game board
    const createGameBoard = () => {
      gameContainer.innerHTML = '';
      
      // Create shuffled array of all inputs and outputs
      const allCards = [];
      
      currentPairs.forEach(pair => {
        allCards.push({ type: 'input', value: pair.input, pairId: currentPairs.indexOf(pair) });
        allCards.push({ type: 'output', value: pair.output, pairId: currentPairs.indexOf(pair) });
      });
      
      // Shuffle cards
      shuffleArray(allCards);
      
      // Create card elements
      allCards.forEach(card => {
        const cardEl = document.createElement('div');
        cardEl.className = `io-card ${card.type}`;
        cardEl.dataset.type = card.type;
        cardEl.dataset.pairId = card.pairId;
        cardEl.textContent = card.value;
        
        cardEl.addEventListener('click', () => handleCardClick(cardEl, card));
        
        gameContainer.appendChild(cardEl);
      });
    };
    
    // Handle card click
    const handleCardClick = (cardEl, card) => {
      // Ignore if game not playing or card already matched/selected
      if (!isPlaying || cardEl.classList.contains('matched') || cardEl.classList.contains('selected')) {
        return;
      }
      
      // Select card
      cardEl.classList.add('selected');
      selectedCards.push({ element: cardEl, data: card });
      
      // Check for pair if we have two cards
      if (selectedCards.length === 2) {
        const [first, second] = selectedCards;
        
        // Check if pair matches (same pairId but different types)
        if (first.data.pairId === second.data.pairId && first.data.type !== second.data.type) {
          // Matched!
          setTimeout(() => {
            first.element.classList.add('matched');
            second.element.classList.add('matched');
            first.element.classList.remove('selected');
            second.element.classList.remove('selected');
            
            // Increment score and matched pairs
            score += 10;
            matchedPairs++;
            updateScore();
            
            // Check if level complete
            if (matchedPairs === currentPairs.length) {
              handleLevelComplete();
            }
            
            // Reset selected cards
            selectedCards = [];
          }, 500);
        } else {
          // Not matched
          setTimeout(() => {
            first.element.classList.remove('selected');
            second.element.classList.remove('selected');
            
            // Penalty
            score = Math.max(0, score - 2);
            updateScore();
            
            // Reset selected cards
            selectedCards = [];
          }, 1000);
        }
      }
    };
    
    // Handle level complete
    const handleLevelComplete = () => {
      // Add time bonus
      const timeBonus = timeRemaining * 2;
      score += timeBonus;
      updateScore();
      
      // Check if there are more levels
      if (currentLevel < levels.length - 1) {
        // Next level
        currentLevel++;
        
        // Show level complete message
        const messageEl = document.getElementById('io-game-message');
        messageEl.innerHTML = `
          <h3>¡Nivel completado!</h3>
          <p>Has ganado un bono de tiempo de ${timeBonus} puntos</p>
          <p>Preparándose para el nivel ${currentLevel + 1}...</p>
        `;
        messageEl.classList.remove('hidden');
        
        // Update level display
        levelDisplay.textContent = levels[currentLevel].name;
        
        // Start next level after delay
        setTimeout(() => {
          messageEl.classList.add('hidden');
          startGame();
        }, 3000);
      } else {
        // Game complete
        endGame(true);
      }
    };
    
    // End the game
    const endGame = (success) => {
      clearInterval(timer);
      isPlaying = false;
      
      // Check for high score
      if (score > highScore) {
        highScore = score;
        localStorage.setItem('ioHighScore', highScore);
        highScoreDisplay.textContent = `Record: ${highScore}`;
      }
      
      // Show message
      const messageEl = document.getElementById('io-game-message');
      
      if (success) {
        messageEl.innerHTML = `
          <h3>¡Juego completado!</h3>
          <p>Puntuación final: ${score}</p>
          <p>${score > highScore / 2 ? '¡Excelente trabajo!' : '¡Sigue practicando!'}</p>
        `;
      } else {
        messageEl.innerHTML = `
          <h3>¡Tiempo agotado!</h3>
          <p>Puntuación final: ${score}</p>
          <p>¡Inténtalo de nuevo para superar tu récord!</p>
        `;
      }
      
      messageEl.classList.remove('hidden');
      startButton.textContent = "Reiniciar";
    };
    
    // Helper: Update score display
    const updateScore = () => {
      if (scoreDisplay) {
        scoreDisplay.textContent = `Puntos: ${score}`;
      }
    };
    
    // Helper: Update timer display
    const updateTimer = () => {
      if (timerDisplay) {
        timerDisplay.textContent = `Tiempo: ${timeRemaining}s`;
        
        // Visual warning when time is low
        if (timeRemaining <= 10) {
          timerDisplay.style.color = 'red';
        } else {
          timerDisplay.style.color = '';
        }
      }
    };
    
    // Helper: Shuffle array
    const shuffleArray = (array) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    };
    
    // Public API
    return {
      init,
      startGame
    };
  })();
  
// Crear un botón flotante que muestre el juego al hacer clic
document.addEventListener('DOMContentLoaded', () => {
  console.log('Juego.js: Documento cargado, creando botón del juego...');
  
  // Crear botón flotante para abrir el juego
  const createGameButton = () => {
    // Si ya existe el botón, no crear otro
    if (document.getElementById('game-launcher-btn')) return;
    
    const gameButton = document.createElement('button');
    gameButton.id = 'game-launcher-btn';
    gameButton.innerHTML = '🎮 Jugar';
    gameButton.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9999;
      background: linear-gradient(135deg, #3498db, #2980b9);
      color: white;
      border: none;
      border-radius: 50px;
      padding: 10px 20px;
      font-weight: bold;
      cursor: pointer;
      box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      transition: all 0.3s ease;
    `;
    
    // Añadir estilos al pasar el mouse
    gameButton.onmouseover = () => {
      gameButton.style.transform = 'translateY(-5px)';
      gameButton.style.boxShadow = '0 6px 15px rgba(0,0,0,0.3)';
    };
    gameButton.onmouseout = () => {
      gameButton.style.transform = '';
      gameButton.style.boxShadow = '0 4px 10px rgba(0,0,0,0.3)';
    };
    
    // Añadir al documento
    document.body.appendChild(gameButton);
    
    // Al hacer clic en el botón, mostrar el juego
    gameButton.onclick = showGame;
    
    console.log('Botón de juego creado');
  };
  
  // Mostrar el juego en un modal más amigable
  const showGame = () => {
    // Limpiar juegos anteriores si existen
    const existingGames = document.querySelectorAll('#io-game-container, #io-challenge-container');
    existingGames.forEach(game => {
      if (game.parentNode) game.parentNode.removeChild(game);
    });
    
    // Crear contenedor del juego
    const gameContainer = document.createElement('div');
    gameContainer.id = 'io-challenge-container';
    gameContainer.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 90%;
      max-width: 900px;
      max-height: 90vh;
      background: white;
      z-index: 10000;
      border-radius: 15px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      overflow: auto;
      padding: 20px;
    `;
    
    // Crear fondo oscuro
    const overlay = document.createElement('div');
    overlay.id = 'io-game-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.7);
      z-index: 9999;
    `;
    
    // Añadir botón para cerrar
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.style.cssText = `
      position: absolute;
      top: 15px;
      right: 15px;
      background: #f44336;
      color: white;
      border: none;
      border-radius: 50%;
      width: 30px;
      height: 30px;
      font-size: 16px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    
    // Función para cerrar el juego
    const closeGame = () => {
      if (document.contains(overlay)) document.body.removeChild(overlay);
      if (document.contains(gameContainer)) document.body.removeChild(gameContainer);
    };
    
    closeBtn.onclick = closeGame;
    
    // Evitar que clicks en el contenedor del juego cierren el modal
    gameContainer.onclick = (e) => {
      e.stopPropagation();
    };
    
    // Pero sí permitir que clicks en el overlay cierren el modal
    overlay.onclick = closeGame;
    
    // Añadir elementos al documento
    document.body.appendChild(overlay);
    document.body.appendChild(gameContainer);
    gameContainer.appendChild(closeBtn);
    
    // Crear el HTML del juego directamente en lugar de usar IOChallenge.init()
    gameContainer.innerHTML += `
      <div id="io-game-container">
        <div class="io-game-header">
          <h2>Desafío de Entradas y Salidas</h2>
          <p>Conecta cada entrada con su salida correspondiente</p>
        </div>
        <div class="io-game-status">
          <div class="io-game-info">
            <span id="io-game-level">Nivel 1</span>
            <span id="io-game-score">Puntos: 0</span>
            <span id="io-game-highscore">Record: 0</span>
          </div>
          <div class="io-game-controls">
            <span id="io-game-timer">Tiempo: 60s</span>
            <button id="io-game-start" class="btn-primary">Iniciar Juego</button>
          </div>
        </div>
        <div id="io-game-board" class="io-game-board"></div>
        <div id="io-game-message" class="io-game-message hidden"></div>
      </div>
    `;
    
    // Aplicar estilos inmediatamente
    const styles = document.createElement('style');
    styles.textContent = `
      #io-game-container {
        background: linear-gradient(135deg, #f6f8f9 0%, #e5ebee 50%, #d7dee3 100%);
        border-radius: 12px;
        margin: 20px auto;
        max-width: 800px;
        overflow: hidden;
        padding: 20px;
        font-family: Arial, sans-serif;
      }
      
      .io-game-header {
        text-align: center;
        margin-bottom: 20px;
        color: #2c3e50;
      }
      
      .io-game-header h2 {
        margin: 0;
        font-size: 24px;
        color: #3498db;
      }
      
      .io-game-status {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding: 10px;
        background: rgba(255,255,255,0.8);
        border-radius: 8px;
      }
      
      .io-game-info, .io-game-controls {
        display: flex;
        gap: 15px;
      }
      
      .io-game-board {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 15px;
        margin-bottom: 20px;
      }
      
      .io-card {
        height: 80px;
        background-color: #fff;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 10px;
        text-align: center;
        font-weight: bold;
        cursor: pointer;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        transition: all 0.3s ease;
        transform-style: preserve-3d;
      }
      
      .io-card.input {
        background: linear-gradient(135deg, #3498db, #2980b9);
        color: white;
      }
      
      .io-card.output {
        background: linear-gradient(135deg, #2ecc71, #27ae60);
        color: white;
      }
      
      .io-card.selected {
        transform: scale(1.05);
        box-shadow: 0 6px 12px rgba(0,0,0,0.15);
      }
      
      .io-card.matched {
        opacity: 0.7;
        cursor: not-allowed;
      }
      
      .io-game-message {
        background-color: rgba(52, 152, 219, 0.9);
        border-radius: 8px;
        color: white;
        padding: 20px;
        text-align: center;
        margin-top: 20px;
      }
      
      .io-game-message h3 {
        margin-top: 0;
      }
      
      .hidden {
        display: none;
      }
      
      .btn-primary {
        background: linear-gradient(135deg, #3498db, #2980b9);
        border: none;
        border-radius: 4px;
        color: white;
        cursor: pointer;
        font-weight: bold;
        padding: 8px 16px;
        transition: all 0.3s ease;
      }
      
      .btn-primary:hover {
        background: linear-gradient(135deg, #2980b9, #3498db);
        transform: translateY(-2px);
      }
      
      @media (max-width: 600px) {
        .io-game-status {
          flex-direction: column;
          gap: 10px;
        }
        
        .io-game-board {
          grid-template-columns: repeat(2, 1fr);
        }
      }
    `;
    
    document.head.appendChild(styles);
    
    // Inicializar el juego
    setTimeout(() => {
      try {
        IOChallenge.init();
        console.log('✅ Juego inicializado correctamente');
      } catch (error) {
        console.error('Error al inicializar el juego:', error);
        // Mostrar un mensaje de error al usuario
        gameContainer.innerHTML += `<div style="color: red; text-align: center; margin-top: 20px;">Hubo un problema al iniciar el juego. Por favor, intenta de nuevo.</div>`;
      }
    }, 100);
  };
  
  // Crear el botón inmediatamente
  createGameButton();
  
  // Recrear el botón si se navega (por si acaso se pierde)
  document.addEventListener('navigationEnd', createGameButton);
});
  
  console.log('✅ Juego.js cargado correctamente');