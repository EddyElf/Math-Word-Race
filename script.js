document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('start-btn');
    const TimerElement = document.getElementById('timer');
    const raceAudio = document.getElementById('race-audio');
    const cheersAudio = document.getElementById('cheers-audio');
    const dingAudio = document.getElementById('ding-audio');
    const nowantAudio = document.getElementById('nowant-audio');
    const answerButtons = document.querySelectorAll('.answer-btn');
    const textField = document.getElementById('centered-text');

    let TimerInterval;
    let wordsData;
    let wordsList = [];
    let currentWord = "";
    let gamePaused = false;

    // Fetch JSON data
    fetch('words.json')
        .then(response => response.json())
        .then(data => {
            wordsData = data;
        });

    // Start button event listener
    startBtn.addEventListener('click', () => {
        if (gamePaused || startBtn.textContent === "Restart") {
            // Confirm restart only if game is active or game is paused
            const restartGame = confirm("Do you want to restart the game?");
            if (restartGame) {
                resetGame();
                startGame();
                startBtn.textContent = "Restart"; // Change the button to "Restart"
            }
        } else {
            // Start the game if it's not paused or restarted yet
            resetGame();
            startGame();
            startBtn.textContent = "Restart"; // Change the button to "Restart"
        }
    });

    // Add event listeners to answer buttons
    answerButtons.forEach(button => {
        button.addEventListener('click', () => {
            const selectedAnswer = button.textContent.trim();
            checkAnswer(selectedAnswer);
        });
    });

    // Reset game state
    function resetGame() {
        clearInterval(TimerInterval); // Stop the timer
        TimerElement.textContent = '00:00.00';
        wordsList = [];
        currentWord = "";
        textField.value = "";
        gamePaused = false; // Reset gamePaused when game is reset
    }

    // Start the game
    function startGame() {
        raceAudio.play(); // Play race start sound

        setTimeout(() => {
            const startTime = performance.now();

            wordsList = shuffleWords(flattenWords(wordsData));
            displayNextWord();

            TimerInterval = setInterval(() => {
                const elapsedTime = performance.now() - startTime;
                TimerElement.textContent = formatTime(elapsedTime);
            }, 10);
        }, 4000); // Delay for race start audio
    }

    // Resume the game (if paused)
    function resumeGame() {
        const startTime = performance.now();
        TimerInterval = setInterval(() => {
            const elapsedTime = performance.now() - startTime;
            TimerElement.textContent = formatTime(elapsedTime);
        }, 10);
    }

    // Flatten the wordsData object into a single array of words
    function flattenWords(wordsData) {
        return Object.values(wordsData).flat();
    }

    // Shuffle an array using Fisher-Yates algorithm
    function shuffleWords(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Display the next word from the list
    function displayNextWord() {
        if (wordsList.length === 0) {
            cheersAudio.play();
            textField.value = "EXCELLENT WORK!";
            clearInterval(TimerInterval);
            return;
        }

        currentWord = wordsList.shift();
        console.log(`Current word: "${currentWord}"`);
        console.log(`Group: "${findGroup(currentWord)}"`);
        textField.value = currentWord;
    }

    // Find the group a word belongs to
    function findGroup(word) {
        for (const category in wordsData) {
            if (wordsData[category].includes(word)) {
                return category;
            }
        }
        return "Unknown";
    }

    // Check the player's answer
    function checkAnswer(selectedAnswer) {
        const correctCategory = findGroup(currentWord);
        const normalizedAnswer = selectedAnswer.trim().toUpperCase();
        const buttonCategoryMapping = {
            "ADDITION": "Add",
            "MULTIPLICATION": "Mult",
            "SUBTRACTION": "Sub",
            "DIVISION": "Div"
        };
    
        if (buttonCategoryMapping[normalizedAnswer] === correctCategory) {
            dingAudio.play(); // Play correct sound
            displayNextWord();
        } else {
            nowantAudio.play(); // Play incorrect sound
    
            // Display the incorrect image
            textField.value = ""; // Clear the text field
            textField.style.backgroundImage = 'url("incorrect.png")';
            textField.style.backgroundRepeat = 'no-repeat';
            textField.style.backgroundSize = 'contain';
            textField.style.backgroundPosition = 'center';
    
            // Insert the word at a random position in the list
            const randomIndex = Math.floor(Math.random() * (wordsList.length + 1));
            wordsList.splice(randomIndex, 0, currentWord);
    
            // Wait for 0.5 seconds before displaying the next word
            setTimeout(() => {
                textField.style.backgroundImage = ''; // Clear the image
                displayNextWord();
            }, 999);
        }
    }
    

    // Format time for display
    function formatTime(ms) {
        const mins = Math.floor(ms / 60000).toString().padStart(2, '0');
        const secs = Math.floor((ms % 60000) / 1000).toString().padStart(2, '0');
        const hundredths = Math.floor((ms % 1000) / 10).toString().padStart(2, '0');
        return `${mins}:${secs}.${hundredths}`;
    }
});
