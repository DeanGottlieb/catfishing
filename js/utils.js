export async function fetchCategories(articleUrl, clcontinue = null) {
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

export function displayArticle(article, articles, currentArticleIndex, score, results, fetchCategories) {
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

export function checkAnswer() {
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

export function showCorrectAnswer(isCorrect) {
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

export function endGame() {
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

export function copyScore() {
    const finalScore = `Rise Catfishing #1 - ${score}/${articles.length}\n${results.slice(0, 5).map(result => result === 'right' ? '🔥' : result === 'wrong' ? '🐟' : '🥚').join('')}\n${results.slice(5).map(result => result === 'right' ? '🔥' : result === 'wrong' ? '🐟' : '🥚').join('')}`;
    navigator.clipboard.writeText(finalScore).then(() => {
        alert('Score copied to clipboard!');
    }).catch(err => {
        console.error('Could not copy text: ', err);
    });
}

export function levenshteinDistance(a, b) {
    const matrix = [];

    // increment along the first column of each row
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    // increment each column in the first row
    for (let j = 0, j <= a.length; j++) {
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