import { fetchVersionInfo, fetchUnwantedKeywords, fetchArticles } from './fetchData.js';
import { startGame, nextArticle, getArticle } from './gameLogic.js';
import { displayArticle, checkAnswer, showCorrectAnswer, endGame, copyScore } from './utils.js';

document.addEventListener('DOMContentLoaded', async function() {
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

    await fetchVersionInfo(versionNumberElement, lastUpdatedElement);
    unwantedKeywords = await fetchUnwantedKeywords();
    const articleGroups = await fetchArticles();
    articles = articleGroups['1']; // Default to group 1
    console.log('Loaded articles:', articles); // Add this line to verify articles are loaded
    startGameButton.disabled = false; // Enable the start button after loading articles

    startGameButton.addEventListener('click', function() {
        const selectedGroup = articleGroupSelector.value;
        articles = articleGroups[selectedGroup];
        startGame(articles, gameArea, startGameButton, displayArticle, articleNumberElement, userScoreElement, correctAnswerElement, categoriesContainer);
    });

    answerForm.addEventListener('submit', function(event) {
        event.preventDefault();
        checkAnswer();
    });

    nextArticleButton.addEventListener('click', function() {
        nextArticle(articles, currentArticleIndex, userAnswerInput, resultDiv, correctAnswerElement, articleLink, categoriesContainer, displayArticle, endGame);
    });

    iGotItButton.addEventListener('click', function() {
        score++;
        results[currentArticleIndex] = 'right';
        nextArticle(articles, currentArticleIndex, userAnswerInput, resultDiv, correctAnswerElement, articleLink, categoriesContainer, displayArticle, endGame);
    });

    closeEnoughButton.addEventListener('click', function() {
        score += 0.5;
        results[currentArticleIndex] = 'close';
        nextArticle(articles, currentArticleIndex, userAnswerInput, resultDiv, correctAnswerElement, articleLink, categoriesContainer, displayArticle, endGame);
    });

    copyScoreButton.addEventListener('click', function() {
        copyScore();
    });
});