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
    let wordDisplayPaused = false;

    fetch('words.json')
        .then(response => response.json())
        .then(data => {
            wordsData = data;
        });

    startBtn.addEventListener('click', () => {
        if (gamePaused || startBtn.textContent === "Restart") {
            const restartGame = confirm("Do you want to restart the game?");
            if (restartGame) {
                resetGame();
                startGame();
                startBtn.textContent = "Restart";
            }
        } else {
            resetGame();
            startGame();
            startBtn.textContent = "Restart";
        }
    });

    answerButtons.forEach(button => {
        button.addEventListener('click', () => {
            const selectedAnswer = button.textContent.trim();
            checkAnswer(selectedAnswer);
        });
    });

    function resetGame() {
        clearInterval(TimerInterval);
        TimerElement.textContent = '00:00.00';
        wordsList = [];
        currentWord = "";
        textField.value = "";
        gamePaused = false;
        wordDisplayPaused = false;
        answerButtons.forEach(button => button.disabled = false); // Enable buttons on reset
    }

    function startGame() {
        raceAudio.play();

        setTimeout(() => {
            const startTime = performance.now();

            wordsList = shuffleWords(flattenWords(wordsData));
            if (!wordDisplayPaused) {
                displayNextWord();
            }

            TimerInterval = setInterval(() => {
                const elapsedTime = performance.now() - startTime;
                TimerElement.textContent = formatTime(elapsedTime);
            }, 10);
        }, 4000);
    }

    function flattenWords(wordsData) {
        return Object.values(wordsData).flat();
    }

    function shuffleWords(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function displayNextWord() {
        if (gamePaused || wordDisplayPaused) return; // Prevent word display while paused

        if (wordsList.length === 0) {
            cheersAudio.play();
            textField.value = "EXCELLENT WORK!";
            clearInterval(TimerInterval);
            answerButtons.forEach(button => button.disabled = true); // Disable buttons when game ends
            return;
        }

        currentWord = wordsList.shift();
        console.log(`Current word: "${currentWord}"`);
        console.log(`Group: "${findGroup(currentWord)}"`);
        textField.value = currentWord;
    }

    function findGroup(word) {
        for (const category in wordsData) {
            if (wordsData[category].includes(word)) {
                return category;
            }
        }
        return "Unknown";
    }

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
            dingAudio.play();
            if (!wordDisplayPaused) {
                displayNextWord();
            }
        } else {
            nowantAudio.play();
            gamePaused = true; // Pause game
            wordDisplayPaused = true; // Pause word display
            answerButtons.forEach(button => button.disabled = true);

            textField.value = "";
            textField.style.backgroundImage = 'url("incorrect.png")';
            textField.style.backgroundRepeat = 'no-repeat';
            textField.style.backgroundSize = 'contain';
            textField.style.backgroundPosition = 'center';

            const randomIndex = Math.floor(Math.random() * (wordsList.length + 1));
            wordsList.splice(randomIndex, 0, currentWord);

            setTimeout(() => {
                textField.style.backgroundImage = '';
                answerButtons.forEach(button => button.disabled = false);
                gamePaused = false; // Resume game
                wordDisplayPaused = false; // Resume word display
                displayNextWord();
            }, 999);
        }
    }

    function formatTime(ms) {
        const mins = Math.floor(ms / 60000).toString().padStart(2, '0');
        const secs = Math.floor((ms % 60000) / 1000).toString().padStart(2, '0');
        const hundredths = Math.floor((ms % 1000) / 10).toString().padStart(2, '0');
        return `${mins}:${secs}.${hundredths}`;
    }
});
