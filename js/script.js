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
    const articleLink = document.getElementById('article-link');
    const nextArticleButton = document.getElementById('next-article');
    const iGotItButton = document.getElementById('i-got-it');
    const closeEnoughButton = document.getElementById('close-enough');
    const versionNumberElement = document.getElementById('version-number');
    const lastUpdatedElement = document.getElementById('last-updated');
    const copyScoreButton = document.getElementById('copy-score');
    const articleGroupSelector = document.getElementById('article-group-selector');

    let articles = [];
    let unwantedKeywords = [];
    let currentArticleIndex = 0;
    let score = 0;
    let results = [];

    // Fetch version info from JSON file
    fetch('version.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (versionNumberElement && lastUpdatedElement) {
                versionNumberElement.textContent = data.version;
                lastUpdatedElement.textContent = data.lastUpdated;
            }
        })
        .catch(error => console.error('Error fetching version info:', error));

    // Fetch unwanted keywords from JSON file
    fetch('unwanted_keywords.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            unwantedKeywords = data.unwanted_keywords;
            return fetch('articles.json');
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            articles = data.articleGroups['1']; // Default to group 1
            startGameButton.disabled = false; // Enable the start button after loading articles
        })
        .catch(error => console.error('Error fetching data:', error));

    startGameButton.addEventListener('click', function() {
        const selectedGroup = articleGroupSelector.value;
        loadArticles(selectedGroup, startGame);
    });

    answerForm.addEventListener('submit', function(event) {
        event.preventDefault();
        checkAnswer();
    });

    nextArticleButton.addEventListener('click', function() {
        nextArticle();
    });

    iGotItButton.addEventListener('click', function() {
        score++;
        results[currentArticleIndex] = 'right';
        nextArticle();
    });

    closeEnoughButton.addEventListener('click', function() {
        score += 0.5;
        results[currentArticleIndex] = 'close';
        nextArticle();
    });

    copyScoreButton.addEventListener('click', function() {
        copyScore();
    });

    function loadArticles(groupNumber, callback) {
        fetch('articles.json')
            .then(response => response.json())
            .then(data => {
                articles = data.articleGroups[groupNumber];
                if (articles) {
                    callback();
                } else {
                    console.error("Article group not found");
                }
            })
            .catch(error => {
                console.error("Error loading articles:", error);
            });
    }
    
    function getArticle() {
        if (currentArticleIndex < articles.length) {
            return articles[currentArticleIndex];
        } else {
            return null;
        }
    }

    function startGame() {
        currentArticleIndex = 0;
        score = 0;
        results = [];
        gameArea.classList.remove('hidden');
        startGameButton.classList.add('hidden');
        const article = getArticle(); // Ensure getArticle() returns a valid article
        displayArticle(article);
    }

    function nextArticle() {
        currentArticleIndex++;
        if (currentArticleIndex < articles.length) {
            userAnswerInput.value = '';
            resultDiv.classList.add('hidden');
            correctAnswerElement.innerHTML = '';
            articleLink.classList.add('hidden');
            categoriesContainer.innerHTML = '';
            categoriesContainer.parentElement.classList.remove('hidden'); // Ensure the categories container is visible
            displayArticle();
        } else {
            endGame();
        }
    }

    function displayArticle(article) {
        if (article && article.length) {
            if (currentArticleIndex < articles.length) {
                const articleUrl = articles[currentArticleIndex];
                articleNumberElement.textContent = `Article ${currentArticleIndex + 1} of ${articles.length}`;
                userScoreElement.textContent = `Score: ${score}/${currentArticleIndex}`;
                correctAnswerElement.innerHTML = '';
                categoriesContainer.innerHTML = '';
                fetchCategories(articleUrl);
            } else {
                endGame();
            }
        } else {
            console.error("Article is undefined or empty");
        }
    }

    async function fetchCategories(articleUrl, clcontinue = null) {
        const articleTitle = decodeURIComponent(articleUrl.split('/').pop().replace(/_/g, ' '));
        let apiUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(articleTitle)}&prop=categories|extracts&exintro&format=json&origin=*`;
        if (clcontinue) {
            apiUrl += `&clcontinue=${clcontinue}`;
        }

        try {
            const response = await fetch(apiUrl);
            const data = await response.json();
            console.log('API Response:', data); // Log the API response

            const page = Object.values(data.query.pages)[0];

            if (page.categories) {
                console.log('Categories before filtering:', page.categories); // Log categories before filtering

                const filteredCategories = page.categories.filter(category => {
                    const categoryName = category.title.replace('Category:', '').toLowerCase();
                    return (
                        !unwantedKeywords.some(keyword => categoryName.includes(keyword)) && 
                        !category.hidden
                    );
                });

                console.log('Categories after filtering:', filteredCategories); // Log categories after filtering

                filteredCategories.forEach(category => {
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

            categoriesContainer.parentElement.classList.remove('hidden'); // Ensure this is called

            // Check if there are more categories to fetch
            if (data.continue && data.continue.clcontinue) {
                await fetchCategories(articleUrl, data.continue.clcontinue);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    }

    function checkAnswer() {
        const userAnswer = userAnswerInput.value.trim().toLowerCase();
        const correctAnswer = decodeURIComponent(articles[currentArticleIndex].split('/').pop()).replace(/_/g, ' ').toLowerCase();
        if (correctAnswer && correctAnswer[0]) {
            const distance = levenshteinDistance(userAnswer, correctAnswer);
            const threshold = 4; // Adjust this threshold as needed

            if (distance <= threshold) {
                score++;
                results[currentArticleIndex] = 'right';
                showCorrectAnswer(true);
            } else {
                results[currentArticleIndex] = 'wrong';
                showCorrectAnswer(false);
            }

            userScoreElement.textContent = `Score: ${score}/${currentArticleIndex + 1}`;
            resultDiv.classList.remove('hidden');
        } else {
            console.error("Correct answer is undefined or empty");
        }
    }

    function showCorrectAnswer(isCorrect) {
        const title = correctAnswerElement.dataset.title;
        const url = correctAnswerElement.dataset.url;
        const extract = correctAnswerElement.dataset.extract;
        correctAnswerElement.innerHTML = `<h2 style="color: ${isCorrect ? 'green' : 'red'};">${title}</h2><p>${extract}</p>`;
        articleLink.href = url;
        articleLink.classList.remove('hidden');

        if (isCorrect) {
            iGotItButton.classList.add('hidden');
            closeEnoughButton.classList.add('hidden');
        } else {
            iGotItButton.classList.remove('hidden');
            closeEnoughButton.classList.remove('hidden');
        }
    }

    function endGame() {
        const finalScore = `Rise Catfishing #1 - ${score}/${articles.length}`;
        gameArea.innerHTML = `<h2>Game Over</h2><p>${finalScore}</p>`;
        const resultsDiv = document.createElement('div');
        resultsDiv.id = 'results-div';
        let resultRow1 = '';
        let resultRow2 = '';
        results.forEach((result, index) => {
            const resultEmoji = result === 'right' ? '🔥' : result === 'wrong' ? '🐟' : '🥚';
            if (index < 5) {
                resultRow1 += resultEmoji;
            } else {
                resultRow2 += resultEmoji;
            }
        });
        resultsDiv.innerHTML = `<p>${resultRow1}</p><p>${resultRow2}</p>`;
        gameArea.appendChild(resultsDiv);
        gameArea.appendChild(copyScoreButton);
        copyScoreButton.classList.remove('hidden');
    }

    function copyScore() {
        const finalScore = `Rise Catfishing #1 - ${score}/${articles.length}\n${results.slice(0, 5).map(result => result === 'right' ? '🔥' : result === 'wrong' ? '🐟' : '🥚').join('')}\n${results.slice(5).map(result => result === 'right' ? '🔥' : result === 'wrong' ? '🐟' : '🥚').join('')}`;
        navigator.clipboard.writeText(finalScore).then(() => {
            alert('Score copied to clipboard!');
        }).catch(err => {
            console.error('Could not copy text: ', err);
        });
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

    function loadData(callback) {
        fetch('articles.json')
            .then(response => response.json())
            .then(data => {
                callback(data);
            })
            .catch(error => {
                console.error("Error loading data:", error);
            });
    }

    // Example usage
    loadData(data => {
        const articles = data.articleGroups['1']; // Ensure the group exists
        if (articles) {
            startGame(articles);
        } else {
            console.error("Article group not found");
        }
    });
});