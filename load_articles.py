import json

def load_articles(group_number):
    with open('articles.json', 'r') as file:
        data = json.load(file)
        return data['articleGroups'].get(str(group_number), [])

# Example usage
group_number = 1  # This would be set based on user input
articles = load_articles(group_number)
print(articles)