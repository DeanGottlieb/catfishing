document.addEventListener('DOMContentLoaded', function() {
    const startGameButton = document.getElementById('start-game');
    const gameArea = document.getElementById('game-area');
    const articleNumberElement = document.getElementById('article-number');
    const userScoreElement = document.getElementById('user-score');
    const categoriesList = document.getElementById('categories').querySelector('ul');
    const answerForm = document.getElementById('answer-form');
    const userAnswerInput = document.getElementById('user-answer');

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
            categoriesList.innerHTML = '';
            fetchCategories(articleUrl);
        } else {
            endGame();
        }
    }

    function fetchCategories(articleUrl) {
        const articleTitle = articleUrl.split('/').pop();
        const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${articleTitle}&prop=categories&format=json&origin=*`;

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                const page = Object.values(data.query.pages)[0];
                if (page.categories) {
                    page.categories.forEach(category => {
                        const categoryName = category.title;
                        const listItem = document.createElement('li');
                        listItem.textContent = categoryName;
                        categoriesList.appendChild(listItem);
                    });
                }
            })
            .catch(error => console.error('Error fetching categories:', error));
    }

    function checkAnswer() {
        const userAnswer = userAnswerInput.value.trim().toLowerCase();
        const correctAnswer = articles[currentArticleIndex].split('/').pop().replace(/_/g, ' ').toLowerCase();
        if (userAnswer === correctAnswer) {
            score++;
        }
        currentArticleIndex++;
        userAnswerInput.value = '';
        displayArticle();
    }

    function endGame() {
        gameArea.innerHTML = `<h2>Game Over</h2><p>Your final score is ${score} out of ${articles.length}</p>`;
    }
});