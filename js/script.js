document.addEventListener('DOMContentLoaded', function() {
    const adminSection = document.getElementById('admin-section');
    const adminLoginForm = document.getElementById('admin-login-form');
    const adminForm = document.getElementById('admin-form');
    const articleList = document.getElementById('article-list').querySelector('ul');
    const startGameButton = document.getElementById('start-game');
    const categoriesList = document.getElementById('categories').querySelector('ul');
    const adminPassword = 'lonelydreamer'; // Set your admin password here
    let articles = [];
    let categories = [];

    adminLoginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const passwordInput = document.getElementById('admin-password').value;
        if (passwordInput === adminPassword) {
            adminSection.classList.remove('hidden');
            adminLoginForm.classList.add('hidden');
        } else {
            alert('Incorrect password. Please try again.');
        }
    });

    adminForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const articleUrl = document.getElementById('article-url').value;
        if (articleUrl && articles.length < 10) {
            articles.push(articleUrl);
            const listItem = document.createElement('li');
            listItem.textContent = articleUrl;
            articleList.appendChild(listItem);
            document.getElementById('article-url').value = '';
        }
    });

    startGameButton.addEventListener('click', function() {
        if (articles.length === 10) {
            categories = [];
            categoriesList.innerHTML = '';
            articles.forEach(articleUrl => {
                fetchCategories(articleUrl);
            });
        } else {
            alert('Please add 10 articles before starting the game.');
        }
    });

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
                        if (!categories.includes(categoryName)) {
                            categories.push(categoryName);
                            const listItem = document.createElement('li');
                            listItem.textContent = categoryName;
                            categoriesList.appendChild(listItem);
                        }
                    });
                }
            })
            .catch(error => console.error('Error fetching categories:', error));
    }
});