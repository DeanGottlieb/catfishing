import { fetchCategories } from './utils.js';

export function startGame(articles, gameArea, startGameButton, displayArticle) {
    let currentArticleIndex = 0;
    let score = 0;
    let results = [];

    gameArea.classList.remove('hidden');
    startGameButton.classList.add('hidden');
    const article = getArticle(articles, currentArticleIndex);
    console.log('Starting game with article:', article); // Add this line to verify the article
    displayArticle(article, articles, currentArticleIndex, score, results, fetchCategories);
}

export function nextArticle(articles, currentArticleIndex, userAnswerInput, resultDiv, correctAnswerElement, articleLink, categoriesContainer, displayArticle, endGame) {
    currentArticleIndex++;
    if (currentArticleIndex < articles.length) {
        userAnswerInput.value = '';
        resultDiv.classList.add('hidden');
        correctAnswerElement.innerHTML = '';
        articleLink.classList.add('hidden');
        categoriesContainer.innerHTML = '';
        categoriesContainer.parentElement.classList.remove('hidden');
        displayArticle();
    } else {
        endGame();
    }
}

export function getArticle(articles, currentArticleIndex) {
    if (currentArticleIndex < articles.length) {
        return articles[currentArticleIndex];
    } else {
        return null;
    }
}