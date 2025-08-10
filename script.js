// Variables globales
let meals = [];
let weightHistory = [];
let measurements = {};

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadData();
});

function initializeApp() {
    setupNavigation();
    setupModals();
    setupEventListeners();
    setupMobileMenu();
}

function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Retirer la classe active de tous les liens
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Ajouter la classe active au lien cliqué
            this.classList.add('active');
            
            // Masquer toutes les sections
            sections.forEach(section => section.classList.remove('active'));
            
            // Afficher la section correspondante
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });
}

function setupMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            // Toggle du menu mobile
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }
    
    // Fermer le menu mobile quand on clique sur un lien
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            }
        });
    });
    
    // Fermer le menu mobile quand on clique en dehors
    document.addEventListener('click', function(e) {
        if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        }
    });
}

function setupModals() {
    const modals = document.querySelectorAll('.modal');
    const closeButtons = document.querySelectorAll('.close');
    
    // Fermer les modales en cliquant sur le bouton de fermeture
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            modal.style.display = 'none';
        });
    });
    
    // Fermer les modales en cliquant en dehors
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.style.display = 'none';
            }
        });
    });
}

function setupEventListeners() {
    // Gestion des verres d'eau
    const waterGlasses = document.querySelectorAll('.glass');
    waterGlasses.forEach((glass, index) => {
        glass.addEventListener('click', () => toggleWaterGlass(index));
    });
}

function showNutritionModal() {
    const modal = document.getElementById('nutritionModal');
    modal.style.display = 'block';
}

function showWorkoutModal() {
    // Modal pour les entraînements (à implémenter)
    alert('Fonctionnalité d\'entraînement à venir !');
}

function showWeightModal() {
    const modal = document.getElementById('weightModal');
    modal.style.display = 'block';
    displayWeightHistory();
}

function saveWeight() {
    const currentWeight = document.getElementById('current-weight').value;
    
    if (!currentWeight || isNaN(currentWeight)) {
        alert('Veuillez entrer un poids valide');
        return;
    }
    
    const weight = parseFloat(currentWeight);
    addWeightEntry(weight);
    
    // Vider le champ
    document.getElementById('current-weight').value = '';
    
    // Fermer la modale
    document.getElementById('weightModal').style.display = 'none';
}

function displayWeightHistory() {
    const weightList = document.getElementById('weight-list');
    if (!weightList) return;
    
    weightList.innerHTML = '';
    
    if (weightHistory.length === 0) {
        weightList.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Aucun poids enregistré</p>';
        return;
    }
    
    // Trier par date (plus récent en premier)
    const sortedHistory = weightHistory
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10); // Afficher les 10 derniers
    
    sortedHistory.forEach((entry, index) => {
        const weightElement = document.createElement('div');
        weightElement.className = 'weight-item';
        
        // Calculer la variation
        let changeText = '';
        let changeClass = 'neutral';
        
        if (index < sortedHistory.length - 1) {
            const currentWeight = entry.weight;
            const previousWeight = sortedHistory[index + 1].weight;
            const change = currentWeight - previousWeight;
            
            if (change > 0) {
                changeText = `+${change.toFixed(1)} kg`;
                changeClass = 'positive';
            } else if (change < 0) {
                changeText = `${change.toFixed(1)} kg`;
                changeClass = 'negative';
            } else {
                changeText = '0 kg';
                changeClass = 'neutral';
            }
        }
        
        weightElement.innerHTML = `
            <div class="weight-info">
                <div class="weight-value">${entry.weight} kg</div>
                <div class="weight-date">${formatDate(entry.date)}</div>
            </div>
            ${changeText ? `<span class="weight-change ${changeClass}">${changeText}</span>` : ''}
            <button class="delete-weight" onclick="deleteWeightEntry('${entry.date}')">
                <i class="fas fa-trash"></i>
            </button>
        `;
        
        weightList.appendChild(weightElement);
    });
}

function deleteWeightEntry(dateString) {
    weightHistory = weightHistory.filter(entry => entry.date !== dateString);
    saveWeightHistory();
    displayWeightHistory();
    updateWeightChart();
    showNotification('Poids supprimé !', 'info');
}

function addWeightEntry(weight) {
    const entry = {
        date: new Date().toISOString(),
        weight: parseFloat(weight)
    };
    
    weightHistory.push(entry);
    saveWeightHistory();
    updateWeightChart();
    showNotification('Poids enregistré !', 'success');
}

function saveWeightHistory() {
    localStorage.setItem('weightHistory', JSON.stringify(weightHistory));
}

function calculateCalories() {
    const age = document.getElementById('age').value;
    const weight = document.getElementById('weight').value;
    const height = document.getElementById('height').value;
    const activity = document.getElementById('activity').value;
    
    if (!age || !weight || !height) {
        alert('Veuillez remplir tous les champs');
        return;
    }
    
    // Demander le genre
    const gender = prompt('Êtes-vous un homme (H) ou une femme (F) ?').toUpperCase();
    if (gender !== 'H' && gender !== 'F') {
        alert('Veuillez entrer H pour homme ou F pour femme');
        return;
    }
    
    // Calcul avec la formule de Mifflin-St Jeor
    let bmr;
    if (gender === 'H') {
        bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
        bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }
    
    const tdee = bmr * parseFloat(activity);
    
    // Sauvegarder dans localStorage
    localStorage.setItem('userProfile', JSON.stringify({
        age, weight, height, activity, gender, bmr, tdee
    }));
    
    // Afficher les résultats
    const resultDiv = document.getElementById('calorie-result');
    resultDiv.innerHTML = `
        <div class="calorie-result-content">
            <h4>Vos besoins caloriques quotidiens</h4>
            <div class="calorie-breakdown">
                <div class="calorie-item">
                    <div class="calorie-label">Métabolisme de base</div>
                    <div class="calorie-value">${Math.round(bmr)} cal</div>
                </div>
                <div class="calorie-item">
                    <div class="calorie-label">Besoins totaux</div>
                    <div class="calorie-value">${Math.round(tdee)} cal</div>
                </div>
                <div class="calorie-item">
                    <div class="calorie-label">Pour perdre 0.5kg/semaine</div>
                    <div class="calorie-value">${Math.round(tdee - 500)} cal</div>
                </div>
                <div class="calorie-item">
                    <div class="calorie-label">Pour perdre 1kg/semaine</div>
                    <div class="calorie-value">${Math.round(tdee - 1000)} cal</div>
                </div>
            </div>
        </div>
    `;
}

function addMeal() {
    const mealName = document.getElementById('meal-name').value;
    const mealCalories = document.getElementById('meal-calories').value;
    
    if (!mealName || !mealCalories) {
        alert('Veuillez remplir tous les champs');
        return;
    }
    
    const meal = {
        id: Date.now(),
        name: mealName,
        calories: parseInt(mealCalories),
        date: new Date().toISOString()
    };
    
    meals.push(meal);
    displayMeals();
    saveMeals();
    
    // Vider les champs
    document.getElementById('meal-name').value = '';
    document.getElementById('meal-calories').value = '';
    
    showNotification('Repas ajouté avec succès !', 'success');
}

function displayMeals() {
    const mealsList = document.getElementById('meals-list');
    if (!mealsList) return;
    
    mealsList.innerHTML = '';
    
    meals.forEach(meal => {
        const mealElement = document.createElement('div');
        mealElement.className = 'meal-item';
        mealElement.innerHTML = `
            <div class="meal-info">
                <div class="meal-name">${meal.name}</div>
                <div class="meal-calories">${meal.calories} calories</div>
            </div>
            <button class="delete-meal" onclick="deleteMeal(${meal.id})">
                <i class="fas fa-trash"></i>
            </button>
        `;
        mealsList.appendChild(mealElement);
    });
    
    updateDashboardCalories();
}

function deleteMeal(mealId) {
    meals = meals.filter(meal => meal.id !== mealId);
    displayMeals();
    saveMeals();
    showNotification('Repas supprimé !', 'info');
}

function saveMeal() {
    const mealType = document.getElementById('meal-type').value;
    const foodItems = document.getElementById('food-items').value;
    const calories = document.getElementById('meal-calories-modal').value;
    
    if (!foodItems || !calories) {
        alert('Veuillez remplir tous les champs');
        return;
    }
    
    const meal = {
        id: Date.now(),
        type: mealType,
        name: foodItems,
        calories: parseInt(calories),
        date: new Date().toISOString()
    };
    
    meals.push(meal);
    displayMeals();
    saveMeals();
    
    // Fermer la modale
    document.getElementById('nutritionModal').style.display = 'none';
    
    // Vider les champs
    document.getElementById('food-items').value = '';
    document.getElementById('meal-calories-modal').value = '';
    
    showNotification('Repas enregistré avec succès !', 'success');
}

function saveMeasurements() {
    const waist = document.getElementById('waist').value;
    const hips = document.getElementById('hips').value;
    const arms = document.getElementById('arms').value;
    
    measurements = {
        waist: parseFloat(waist) || 0,
        hips: parseFloat(hips) || 0,
        arms: parseFloat(arms) || 0,
        date: new Date().toISOString()
    };
    
    localStorage.setItem('measurements', JSON.stringify(measurements));
    showNotification('Mesures sauvegardées !', 'success');
}

function toggleWaterGlass(index) {
    const glasses = document.querySelectorAll('.glass');
    const waterText = document.querySelector('.water-text');
    
    if (index < glasses.length) {
        glasses[index].classList.toggle('filled');
        
        // Compter les verres remplis
        const filledGlasses = document.querySelectorAll('.glass.filled').length;
        waterText.textContent = `${filledGlasses}/${glasses.length} verres`;
        
        // Sauvegarder l'état
        localStorage.setItem('waterGlasses', filledGlasses.toString());
    }
}

function updateDashboardCalories() {
    const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
    const calorieElements = document.querySelectorAll('.stat-number');
    
    if (calorieElements.length > 0) {
        calorieElements[0].textContent = totalCalories;
    }
}

function initializeCharts() {
    updateWeightChart();
}

function updateWeightChart() {
    const canvas = document.getElementById('weightChart');
    if (!canvas || weightHistory.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Effacer le canvas
    ctx.clearRect(0, 0, width, height);
    
    // Préparer les données
    const sortedData = weightHistory
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(-10); // Dernières 10 entrées
    
    if (sortedData.length < 2) return;
    
    const minWeight = Math.min(...sortedData.map(d => d.weight));
    const maxWeight = Math.max(...sortedData.map(d => d.weight));
    const weightRange = maxWeight - minWeight || 1;
    
    // Dessiner le graphique
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    sortedData.forEach((entry, index) => {
        const x = (index / (sortedData.length - 1)) * (width - 40) + 20;
        const y = height - 20 - ((entry.weight - minWeight) / weightRange) * (height - 40);
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    ctx.stroke();
    
    // Ajouter les points
    ctx.fillStyle = '#667eea';
    sortedData.forEach((entry, index) => {
        const x = (index / (sortedData.length - 1)) * (width - 40) + 20;
        const y = height - 20 - ((entry.weight - minWeight) / weightRange) * (height - 40);
        
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
    });
}

function saveMeals() {
    localStorage.setItem('meals', JSON.stringify(meals));
}

function loadData() {
    // Charger les repas
    const savedMeals = localStorage.getItem('meals');
    if (savedMeals) {
        meals = JSON.parse(savedMeals);
        displayMeals();
    }
    
    // Charger l'historique du poids
    const savedWeightHistory = localStorage.getItem('weightHistory');
    if (savedWeightHistory) {
        weightHistory = JSON.parse(savedWeightHistory);
    }
    
    // Charger les mesures
    const savedMeasurements = localStorage.getItem('measurements');
    if (savedMeasurements) {
        measurements = JSON.parse(savedMeasurements);
    }
    
    // Charger l'état des verres d'eau
    const savedWaterGlasses = localStorage.getItem('waterGlasses');
    if (savedWaterGlasses) {
        const filledCount = parseInt(savedWaterGlasses);
        const glasses = document.querySelectorAll('.glass');
        const waterText = document.querySelector('.water-text');
        
        glasses.forEach((glass, index) => {
            if (index < filledCount) {
                glass.classList.add('filled');
            }
        });
        
        if (waterText) {
            waterText.textContent = `${filledCount}/${glasses.length} verres`;
        }
    }
    
    // Initialiser les graphiques
    initializeCharts();
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
}

function showNotification(message, type = 'info') {
    // Créer une notification simple
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 1rem 2rem;
        border-radius: 10px;
        z-index: 3000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function startWorkout(workoutType) {
    showNotification(`Entraînement ${workoutType} démarré !`, 'success');
}

function showRecipe(recipeName) {
    showNotification(`Recette ${recipeName} à venir !`, 'info');
}

// Export des fonctions pour l'utilisation dans HTML
window.showNutritionModal = showNutritionModal;
window.showWorkoutModal = showWorkoutModal;
window.showWeightModal = showWeightModal;
window.calculateCalories = calculateCalories;
window.addMeal = addMeal;
window.deleteMeal = deleteMeal;
window.saveMeal = saveMeal;
window.saveMeasurements = saveMeasurements;
window.startWorkout = startWorkout;
window.showRecipe = showRecipe; 