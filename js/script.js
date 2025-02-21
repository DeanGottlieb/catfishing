document.addEventListener('DOMContentLoaded', function() {
    const startGameButton = document.getElementById('start-game');
    const gameArea = document.getElementById('game-area');
    const articleNumberElement = document.getElementById('article-number');
    const userScoreElement = document.getElementById('user-score');
    const categoriesContainer = document.getElementById('categories-container');
    const answerForm = document.getElementById('answer-form');
    const userAnswerInput = document.getElementById('user-answer');
    const resultDiv = document.getElementById('result');
    const correctAnswerElement = document.getElementById('correct-answer');
    const nextArticleButton = document.getElementById('next-article');
    const iGotItButton = document.getElementById('i-got-it');
    const closeEnoughButton = document.getElementById('close-enough');

    let articles = [
        "https://en.wikipedia.org/wiki/JavaScript",
        "https://en.wikipedia.org/wiki/Node.js",
        "https://en.wikipedia.org/wiki/React_(web_framework)",
        "https://en.wikipedia.org/wiki/Angular_(web_framework)",
        "https://en.wikipedia.org/wiki/Vue.js",
        "https://en.wikipedia.org/wiki/Python_(programming_language)",
        "https://en.wikipedia.org/wiki/Ruby_(programming_language)",
        "https://en.wikipedia.org/wiki/Java_(programming_language)",
        "https://en.wikipedia.org/wiki/C_Sharp_(programming_language)",
        "https://en.wikipedia.org/wiki/Go_(programming_language)"
    ]; // Predefined list of articles

    let currentArticleIndex = 0;
    let score = 0;

    startGameButton.addEventListener('click', function() {
        startGame();
    });

    answerForm.addEventListener('submit', function(event) {
        event.preventDefault();
        checkAnswer();
    });

    nextArticleButton.addEventListener('click', function() {
        currentArticleIndex++;
        userAnswerInput.value = '';
        resultDiv.classList.add('hidden');
        correctAnswerElement.innerHTML = '';
        displayArticle();
    });

    iGotItButton.addEventListener('click', function() {
        score++;
        currentArticleIndex++;
        userAnswerInput.value = '';
        resultDiv.classList.add('hidden');
        correctAnswerElement.innerHTML = '';
        displayArticle();
    });

    closeEnoughButton.addEventListener('click', function() {
        score += 0.5;
        currentArticleIndex++;
        userAnswerInput.value = '';
        resultDiv.classList.add('hidden');
        correctAnswerElement.innerHTML = '';
        displayArticle();
    });

    function startGame() {
        currentArticleIndex = 0;
        score = 0;
        gameArea.classList.remove('hidden');
        startGameButton.classList.add('hidden');
        displayArticle();
    }

    function displayArticle() {
        if (currentArticleIndex < articles.length) {
            const articleUrl = articles[currentArticleIndex];
            articleNumberElement.textContent = `Article ${currentArticleIndex + 1} of ${articles.length}`;
            userScoreElement.textContent = `Score: ${score}/${currentArticleIndex}`;
            categoriesContainer.innerHTML = '';
            fetchCategories(articleUrl);
        } else {
            endGame();
        }
    }

    function fetchCategories(articleUrl) {
        const articleTitle = articleUrl.split('/').pop();
        const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${articleTitle}&prop=categories|extracts&exintro&format=json&origin=*`;

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                const page = Object.values(data.query.pages)[0];
                if (page.categories) {
                    page.categories.forEach(category => {
                        const categoryName = category.title.replace('Category:', ''); // Remove 'Category:' prefix
                        const categoryItem = document.createElement('div');
                        categoryItem.className = 'category-item';
                        categoryItem.textContent = categoryName;
                        categoriesContainer.appendChild(categoryItem);
                    });
                }

                if (page.extract) {
                    const extract = page.extract;
                    correctAnswerElement.dataset.extract = extract;
                    correctAnswerElement.dataset.title = page.title;
                    correctAnswerElement.dataset.url = articleUrl;
                }
            })
            .catch(error => console.error('Error fetching categories:', error));
    }

    function checkAnswer() {
        const userAnswer = userAnswerInput.value.trim().toLowerCase();
        const correctAnswer = articles[currentArticleIndex].split('/').pop().replace(/_/g, ' ').toLowerCase();
        const distance = levenshteinDistance(userAnswer, correctAnswer);
        const threshold = 3; // Adjust this threshold as needed

        if (distance <= threshold) {
            score++;
            showCorrectAnswer(true);
        } else {
            showCorrectAnswer(false);
        }

        userScoreElement.textContent = `Score: ${score}/${currentArticleIndex + 1}`;
        resultDiv.classList.remove('hidden');
    }

    function showCorrectAnswer(isCorrect) {
        const title = correctAnswerElement.dataset.title;
        const url = correctAnswerElement.dataset.url;
        const extract = correctAnswerElement.dataset.extract;
        correctAnswerElement.innerHTML = `<h2><a href="${url}" target="_blank">${title}</a></h2><p>${extract}</p>`;
        correctAnswerElement.style.fontSize = '1.2em';
        correctAnswerElement.style.marginTop = '20px';

        if (isCorrect) {
            iGotItButton.classList.add('hidden');
            closeEnoughButton.classList.add('hidden');
        } else {
            iGotItButton.classList.remove('hidden');
            closeEnoughButton.classList.remove('hidden');
        }
    }

    function endGame() {
        gameArea.innerHTML = `<h2>Game Over</h2><p>Your final score is ${score} out of ${articles.length}</p>`;
    }

    function levenshteinDistance(a, b) {
        const matrix = [];

        // increment along the first column of each row
        for (let i = 0; i <= b.length; i++) {
            matrix[i] = [i];
        }

        // increment each column in the first row
        for (let j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
        }

        // fill in the rest of the matrix
        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1, // substitution
                        Math.min(
                            matrix[i][j - 1] + 1, // insertion
                            matrix[i - 1][j] + 1 // deletion
                        )
                    );
                }
            }
        }

        return matrix[b.length][a.length];
    }
});