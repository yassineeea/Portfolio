// Script pour l'intégration des bases de données de facteurs d'émission

// Classe pour gérer l'accès aux facteurs d'émission
class EmissionFactorDatabase {
    constructor() {
        this.data = null;
        this.isLoaded = false;
        this.loadingPromise = null;
    }

    // Charger la base de données depuis le fichier JSON
    load() {
        if (this.loadingPromise) {
            return this.loadingPromise;
        }

        this.loadingPromise = fetch('../data/emission_factors.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erreur lors du chargement de la base de données de facteurs d\'émission');
                }
                return response.json();
            })
            .then(data => {
                this.data = data;
                this.isLoaded = true;
                console.log('Base de données de facteurs d\'émission chargée avec succès');
                return data;
            })
            .catch(error => {
                console.error('Erreur:', error);
                throw error;
            });

        return this.loadingPromise;
    }

    // Obtenir un facteur d'émission spécifique
    getEmissionFactor(category, subcategory, item, detail, unit) {
        if (!this.isLoaded) {
            throw new Error('La base de données n\'est pas encore chargée');
        }

        try {
            // Navigation dans l'arborescence de la base de données
            let factor = this.data[category];
            if (subcategory) factor = factor[subcategory];
            if (item) factor = factor[item];
            if (detail) factor = factor[detail];

            // Si une unité spécifique est demandée
            if (unit && factor[unit]) {
                return factor[unit];
            } else if (unit && factor.value && factor.unit.includes(unit)) {
                return factor;
            } else if (!unit && factor.value) {
                return factor;
            } else {
                return factor;
            }
        } catch (e) {
            console.error('Facteur d\'émission non trouvé:', category, subcategory, item, detail, unit);
            return null;
        }
    }

    // Obtenir tous les facteurs d'émission d'une catégorie
    getCategoryFactors(category) {
        if (!this.isLoaded) {
            throw new Error('La base de données n\'est pas encore chargée');
        }

        return this.data[category] || null;
    }

    // Obtenir les métadonnées de la base de données
    getMetadata() {
        if (!this.isLoaded) {
            throw new Error('La base de données n\'est pas encore chargée');
        }

        return this.data.metadata || null;
    }

    // Recherche de facteurs d'émission par mot-clé
    search(keyword) {
        if (!this.isLoaded) {
            throw new Error('La base de données n\'est pas encore chargée');
        }

        const results = [];
        const searchRecursive = (obj, path = []) => {
            for (const key in obj) {
                const newPath = [...path, key];
                const value = obj[key];

                // Si la clé ou la valeur contient le mot-clé
                if (key.toLowerCase().includes(keyword.toLowerCase()) || 
                    (typeof value === 'string' && value.toLowerCase().includes(keyword.toLowerCase()))) {
                    results.push({
                        path: newPath.join('.'),
                        value: value
                    });
                }

                // Recherche récursive si la valeur est un objet
                if (value && typeof value === 'object' && !Array.isArray(value)) {
                    searchRecursive(value, newPath);
                }
            }
        };

        searchRecursive(this.data);
        return results;
    }

    // Obtenir les sources disponibles
    getSources() {
        if (!this.isLoaded) {
            throw new Error('La base de données n\'est pas encore chargée');
        }

        return this.data.metadata.sources || null;
    }
}

// Initialisation de la base de données
const emissionDB = new EmissionFactorDatabase();

// Fonction pour initialiser l'intégration avec le calculateur
function initDatabaseIntegration() {
    // Charger la base de données
    emissionDB.load()
        .then(() => {
            console.log('Base de données intégrée au calculateur');
            
            // Mettre à jour l'interface utilisateur avec les données de la base
            updateCalculatorWithDatabase();
            
            // Afficher les informations sur les sources de données
            displayDatabaseInfo();
        })
        .catch(error => {
            console.error('Erreur lors de l\'intégration de la base de données:', error);
        });
}

// Mettre à jour l'interface du calculateur avec les données de la base
function updateCalculatorWithDatabase() {
    // Cette fonction sera appelée après le chargement de la base de données
    // Elle mettra à jour les options des menus déroulants du calculateur
    
    const activityTypeSelect = document.getElementById('activity-type');
    if (!activityTypeSelect) return;
    
    // Vider les options existantes
    while (activityTypeSelect.options.length > 0) {
        activityTypeSelect.remove(0);
    }
    
    // Ajouter les catégories principales depuis la base de données
    const categories = Object.keys(emissionDB.data).filter(key => key !== 'metadata');
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        
        // Formater le nom de la catégorie pour l'affichage
        let displayName = category.charAt(0).toUpperCase() + category.slice(1);
        switch(category) {
            case 'transport': displayName = 'Transport'; break;
            case 'energy': displayName = 'Consommation d\'énergie'; break;
            case 'food': displayName = 'Alimentation'; break;
            case 'materials': displayName = 'Matériaux & Produits'; break;
            case 'waste': displayName = 'Déchets'; break;
            case 'water': displayName = 'Eau'; break;
        }
        
        option.textContent = displayName;
        activityTypeSelect.appendChild(option);
    });
    
    // Déclencher l'événement change pour mettre à jour les sous-catégories
    const event = new Event('change');
    activityTypeSelect.dispatchEvent(event);
}

// Afficher les informations sur les bases de données utilisées
function displayDatabaseInfo() {
    const databaseInfoContainer = document.getElementById('database-info');
    if (!databaseInfoContainer) return;
    
    const metadata = emissionDB.getMetadata();
    const sources = emissionDB.getSources();
    
    let infoHTML = `
        <div class="database-info-header">
            <h4>Informations sur la base de données</h4>
            <p>Version: ${metadata.version} | Mise à jour: ${metadata.date_updated}</p>
        </div>
        <div class="database-sources">
            <h5>Sources de données:</h5>
            <ul>
    `;
    
    for (const [key, value] of Object.entries(sources)) {
        infoHTML += `<li><strong>${key}</strong>: ${value}</li>`;
    }
    
    infoHTML += `
            </ul>
        </div>
    `;
    
    databaseInfoContainer.innerHTML = infoHTML;
}

// Fonction pour obtenir un facteur d'émission spécifique pour le calculateur
function getEmissionFactorForCalculator(category, subcategory, item, detail, unit) {
    try {
        const factor = emissionDB.getEmissionFactor(category, subcategory, item, detail, unit);
        
        if (factor && factor.value) {
            return {
                value: factor.value,
                unit: factor.unit,
                source: factor.source
            };
        } else if (typeof factor === 'object' && factor.hasOwnProperty(unit)) {
            return {
                value: factor[unit].value,
                unit: factor[unit].unit,
                source: factor[unit].source
            };
        } else {
            console.warn('Format de facteur d\'émission non reconnu:', factor);
            return null;
        }
    } catch (e) {
        console.error('Erreur lors de la récupération du facteur d\'émission:', e);
        return null;
    }
}

// Initialiser l'intégration au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    initDatabaseIntegration();
    
    // Ajouter un gestionnaire d'événements pour le bouton de calcul
    const calculateBtn = document.getElementById('calculate-btn');
    if (calculateBtn) {
        calculateBtn.addEventListener('click', function() {
            // Utiliser la base de données pour le calcul
            calculateEmissionsWithDatabase();
        });
    }
});

// Fonction de calcul des émissions utilisant la base de données
function calculateEmissionsWithDatabase() {
    const activityTypeSelect = document.getElementById('activity-type');
    const activitySubtypeSelect = document.getElementById('activity-subtype');
    const detailsSelect = document.getElementById('details');
    const quantityInput = document.getElementById('quantity');
    const unitSelect = document.getElementById('unit');
    
    const category = activityTypeSelect.value;
    const subcategory = activitySubtypeSelect.value;
    const detail = detailsSelect.value;
    const quantity = parseFloat(quantityInput.value);
    const unit = unitSelect.value;
    
    // Vérification des entrées
    if (isNaN(quantity) || quantity <= 0) {
        alert('Veuillez entrer une quantité valide.');
        return;
    }
    
    // Structure de navigation dans la base de données dépend de la catégorie
    let item = null;
    let detailKey = null;
    
    switch(category) {
        case 'transport':
            if (subcategory === 'car' || subcategory === 'bus') {
                item = subcategory;
                detailKey = detail;
            } else if (subcategory === 'plane' || subcategory === 'train' || subcategory === 'sea') {
                item = 'passenger';
                detailKey = detail;
            }
            break;
        case 'energy':
            item = subcategory;
            detailKey = detail;
            break;
        case 'food':
            item = subcategory;
            detailKey = detail;
            break;
        case 'materials':
            item = subcategory;
            detailKey = detail;
            break;
        case 'waste':
            item = subcategory;
            detailKey = detail;
            break;
        case 'water':
            item = subcategory;
            detailKey = null;
            break;
    }
    
    // Récupération du facteur d'émission
    const emissionFactor = getEmissionFactorForCalculator(category, null, subcategory, item, detail);
    
    if (!emissionFactor) {
        alert('Facteur d\'émission non disponible pour cette combinaison. Veuillez essayer d\'autres paramètres.');
        return;
    }
    
    // Calcul des émissions
    const totalEmissions = quantity * emissionFactor.value;
    
    // Affichage des résultats
    displayCalculationResults(totalEmissions, emissionFactor.source, quantity, unit, category);
}

// Affichage des résultats du calcul
function displayCalculationResults(totalEmissions, source, quantity, unit, category) {
    const resultsContainer = document.getElementById('calculator-results');
    const totalEmissionsElement = document.getElementById('total-emissions');
    const treeEquivalentElement = document.getElementById('tree-equivalent');
    const dataSourceElement = document.getElementById('data-source');
    
    // Calcul de l'équivalent en arbres (approximation: 1 arbre absorbe ~25kg CO2 par an)
    const treeEquivalent = totalEmissions / 25;
    
    // Affichage des résultats
    totalEmissionsElement.textContent = `${totalEmissions.toFixed(2)} kg CO2e`;
    treeEquivalentElement.textContent = `${treeEquivalent.toFixed(1)} arbres pendant 1 an`;
    dataSourceElement.textContent = source;
    
    // Affichage du conteneur de résultats
    resultsContainer.style.display = 'block';
    
    // Création du graphique
    createChart(totalEmissions, category);
}

// Création du graphique de comparaison
function createChart(emissions, category) {
    const ctx = document.getElementById('emissions-chart').getContext('2d');
    
    // Détruire le graphique existant s'il y en a un
    if (window.emissionsChart) {
        window.emissionsChart.destroy();
    }
    
    // Données de référence pour la comparaison en fonction de la catégorie
    let referenceData = {
        'Votre activité': emissions
    };
    
    switch(category) {
        case 'transport':
            referenceData['Vol Paris-New York'] = 1000;
            referenceData['Voiture 10 000 km/an'] = 1920;
            referenceData['Train Paris-Marseille'] = 9;
            break;
        case 'energy':
            referenceData['Chauffage annuel appartement'] = 1500;
            referenceData['Électricité annuelle appartement'] = 800;
            referenceData['Consommation énergétique moyenne par personne'] = 2300;
            break;
        case 'food':
            referenceData['Repas avec bœuf'] = 7;
            referenceData['Repas végétarien'] = 2;
            referenceData['Alimentation annuelle moyenne'] = 1800;
            break;
        case 'materials':
            referenceData['Smartphone (fabrication)'] = 80;
            referenceData['Ordinateur portable (fabrication)'] = 320;
            referenceData['Vêtements achetés par an'] = 250;
            break;
        default:
            referenceData['Empreinte moyenne française par an'] = 9000;
            referenceData['Objectif neutralité carbone 2050'] = 2000;
            referenceData['Seuil compatible accord de Paris'] = 2500;
    }
    
    // Couleurs pour le graphique
    const colors = {
        backgroundColor: [
            'rgba(46, 125, 50, 0.7)',
            'rgba(21, 101, 192, 0.7)',
            'rgba(21, 101, 192, 0.7)',
            'rgba(21, 101, 192, 0.7)'
        ],
        borderColor: [
            'rgba(46, 125, 50, 1)',
            'rgba(21, 101, 192, 1)',
            'rgba(21, 101, 192, 1)',
            'rgba(21, 101, 192, 1)'
        ]
    };
    
    // Création du nouveau graphique
    window.emissionsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(referenceData),
            datasets: [{
                label: 'Émissions (kg CO2e)',
                data: Object.values(referenceData),
                backgroundColor: colors.backgroundColor,
                borderColor: colors.borderColor,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'kg CO2e'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Comparaison des émissions de CO2'
                },
                legend: {
                    display: false
                }
            }
        }
    });
}
