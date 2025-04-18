// Script pour le calculateur d'émissions carbone

document.addEventListener('DOMContentLoaded', function() {
    // Éléments du DOM
    const activityTypeSelect = document.getElementById('activity-type');
    const activitySubtypeSelect = document.getElementById('activity-subtype');
    const quantityInput = document.getElementById('quantity');
    const unitSelect = document.getElementById('unit');
    const detailsSelect = document.getElementById('details');
    const calculateBtn = document.getElementById('calculate-btn');
    const resultsContainer = document.getElementById('calculator-results');
    const totalEmissionsElement = document.getElementById('total-emissions');
    const treeEquivalentElement = document.getElementById('tree-equivalent');
    const dataSourceElement = document.getElementById('data-source');
    const resetBtn = document.getElementById('reset-calculator');
    const downloadBtn = document.getElementById('download-results');
    
    // Base de données simplifiée des facteurs d'émission (kg CO2e par unité)
    const emissionFactors = {
        // Transport
        transport: {
            car: {
                petrol: { km: 0.192, l: 2.31 },
                diesel: { km: 0.171, l: 2.68 },
                electric: { km: 0.053, kwh: 0.085 },
                hybrid: { km: 0.106, l: 1.89 }
            },
            plane: {
                short_haul: { km: 0.255 },
                medium_haul: { km: 0.156 },
                long_haul: { km: 0.151 }
            },
            train: {
                electric: { km: 0.006, kwh: 0.085 },
                diesel: { km: 0.035, l: 2.68 }
            },
            bus: {
                urban: { km: 0.103 },
                coach: { km: 0.027 }
            }
        },
        // Énergie
        energy: {
            electricity: {
                france: { kwh: 0.052 },
                eu_average: { kwh: 0.275 },
                coal: { kwh: 0.820 },
                gas: { kwh: 0.490 }
            },
            heating: {
                natural_gas: { kwh: 0.205, l: 2.03 },
                fuel_oil: { kwh: 0.324, l: 3.25 },
                wood: { kwh: 0.024, kg: 0.295 }
            }
        },
        // Alimentation
        food: {
            meat: {
                beef: { kg: 27.0 },
                pork: { kg: 5.8 },
                chicken: { kg: 3.7 },
                lamb: { kg: 25.6 }
            },
            dairy: {
                milk: { l: 1.39 },
                cheese: { kg: 8.55 },
                yogurt: { kg: 1.31 }
            },
            plant_based: {
                vegetables: { kg: 0.47 },
                fruits: { kg: 0.42 },
                cereals: { kg: 0.51 },
                legumes: { kg: 0.78 }
            }
        },
        // Matériaux et produits
        materials: {
            metals: {
                steel: { kg: 1.46 },
                aluminum: { kg: 8.24 },
                copper: { kg: 3.81 }
            },
            plastics: {
                pet: { kg: 3.14 },
                hdpe: { kg: 2.78 },
                pvc: { kg: 3.10 }
            },
            textiles: {
                cotton: { kg: 8.3 },
                polyester: { kg: 5.5 },
                wool: { kg: 22.9 }
            }
        }
    };
    
    // Données des sources pour chaque catégorie
    const dataSources = {
        transport: 'Base ADEME (2023)',
        energy: 'Base ADEME (2023)',
        food: 'Agribalyse 3.1',
        materials: 'Ecoinvent 3.8'
    };
    
    // Initialisation des options de sous-catégories
    function updateSubtypeOptions() {
        const activityType = activityTypeSelect.value;
        activitySubtypeSelect.innerHTML = '';
        
        let options = [];
        
        switch(activityType) {
            case 'transport':
                options = [
                    { value: 'car', text: 'Voiture' },
                    { value: 'plane', text: 'Avion' },
                    { value: 'train', text: 'Train' },
                    { value: 'bus', text: 'Bus' }
                ];
                break;
            case 'energy':
                options = [
                    { value: 'electricity', text: 'Électricité' },
                    { value: 'heating', text: 'Chauffage' }
                ];
                break;
            case 'food':
                options = [
                    { value: 'meat', text: 'Viande' },
                    { value: 'dairy', text: 'Produits laitiers' },
                    { value: 'plant_based', text: 'Végétaux' }
                ];
                break;
            case 'materials':
                options = [
                    { value: 'metals', text: 'Métaux' },
                    { value: 'plastics', text: 'Plastiques' },
                    { value: 'textiles', text: 'Textiles' }
                ];
                break;
        }
        
        options.forEach(option => {
            const optElement = document.createElement('option');
            optElement.value = option.value;
            optElement.textContent = option.text;
            activitySubtypeSelect.appendChild(optElement);
        });
        
        updateDetailsOptions();
    }
    
    // Mise à jour des options de détails
    function updateDetailsOptions() {
        const activityType = activityTypeSelect.value;
        const activitySubtype = activitySubtypeSelect.value;
        detailsSelect.innerHTML = '';
        
        let options = [];
        
        if (activityType === 'transport') {
            switch(activitySubtype) {
                case 'car':
                    options = [
                        { value: 'petrol', text: 'Essence' },
                        { value: 'diesel', text: 'Diesel' },
                        { value: 'electric', text: 'Électrique' },
                        { value: 'hybrid', text: 'Hybride' }
                    ];
                    break;
                case 'plane':
                    options = [
                        { value: 'short_haul', text: 'Court courrier (<1500 km)' },
                        { value: 'medium_haul', text: 'Moyen courrier (1500-4000 km)' },
                        { value: 'long_haul', text: 'Long courrier (>4000 km)' }
                    ];
                    break;
                case 'train':
                    options = [
                        { value: 'electric', text: 'Électrique' },
                        { value: 'diesel', text: 'Diesel' }
                    ];
                    break;
                case 'bus':
                    options = [
                        { value: 'urban', text: 'Urbain' },
                        { value: 'coach', text: 'Autocar' }
                    ];
                    break;
            }
        } else if (activityType === 'energy') {
            switch(activitySubtype) {
                case 'electricity':
                    options = [
                        { value: 'france', text: 'France' },
                        { value: 'eu_average', text: 'Moyenne européenne' },
                        { value: 'coal', text: 'Charbon' },
                        { value: 'gas', text: 'Gaz' }
                    ];
                    break;
                case 'heating':
                    options = [
                        { value: 'natural_gas', text: 'Gaz naturel' },
                        { value: 'fuel_oil', text: 'Fioul' },
                        { value: 'wood', text: 'Bois' }
                    ];
                    break;
            }
        } else if (activityType === 'food') {
            switch(activitySubtype) {
                case 'meat':
                    options = [
                        { value: 'beef', text: 'Bœuf' },
                        { value: 'pork', text: 'Porc' },
                        { value: 'chicken', text: 'Poulet' },
                        { value: 'lamb', text: 'Agneau' }
                    ];
                    break;
                case 'dairy':
                    options = [
                        { value: 'milk', text: 'Lait' },
                        { value: 'cheese', text: 'Fromage' },
                        { value: 'yogurt', text: 'Yaourt' }
                    ];
                    break;
                case 'plant_based':
                    options = [
                        { value: 'vegetables', text: 'Légumes' },
                        { value: 'fruits', text: 'Fruits' },
                        { value: 'cereals', text: 'Céréales' },
                        { value: 'legumes', text: 'Légumineuses' }
                    ];
                    break;
            }
        } else if (activityType === 'materials') {
            switch(activitySubtype) {
                case 'metals':
                    options = [
                        { value: 'steel', text: 'Acier' },
                        { value: 'aluminum', text: 'Aluminium' },
                        { value: 'copper', text: 'Cuivre' }
                    ];
                    break;
                case 'plastics':
                    options = [
                        { value: 'pet', text: 'PET' },
                        { value: 'hdpe', text: 'HDPE' },
                        { value: 'pvc', text: 'PVC' }
                    ];
                    break;
                case 'textiles':
                    options = [
                        { value: 'cotton', text: 'Coton' },
                        { value: 'polyester', text: 'Polyester' },
                        { value: 'wool', text: 'Laine' }
                    ];
                    break;
            }
        }
        
        options.forEach(option => {
            const optElement = document.createElement('option');
            optElement.value = option.value;
            optElement.textContent = option.text;
            detailsSelect.appendChild(optElement);
        });
        
        updateUnitOptions();
    }
    
    // Mise à jour des options d'unités
    function updateUnitOptions() {
        const activityType = activityTypeSelect.value;
        const activitySubtype = activitySubtypeSelect.value;
        const details = detailsSelect.value;
        unitSelect.innerHTML = '';
        
        let options = [];
        
        // Déterminer les unités disponibles en fonction des facteurs d'émission
        if (emissionFactors[activityType] && 
            emissionFactors[activityType][activitySubtype] && 
            emissionFactors[activityType][activitySubtype][details]) {
            
            const availableUnits = Object.keys(emissionFactors[activityType][activitySubtype][details]);
            
            availableUnits.forEach(unit => {
                let unitText = '';
                switch(unit) {
                    case 'km': unitText = 'Kilomètres'; break;
                    case 'l': unitText = 'Litres'; break;
                    case 'kwh': unitText = 'kWh'; break;
                    case 'kg': unitText = 'Kilogrammes'; break;
                    default: unitText = unit.toUpperCase();
                }
                
                options.push({ value: unit, text: unitText });
            });
        }
        
        // Si aucune unité trouvée, ajouter des unités par défaut
        if (options.length === 0) {
            options = [
                { value: 'kg', text: 'Kilogrammes' },
                { value: 'l', text: 'Litres' },
                { value: 'km', text: 'Kilomètres' }
            ];
        }
        
        options.forEach(option => {
            const optElement = document.createElement('option');
            optElement.value = option.value;
            optElement.textContent = option.text;
            unitSelect.appendChild(optElement);
        });
    }
    
    // Calcul des émissions
    function calculateEmissions() {
        const activityType = activityTypeSelect.value;
        const activitySubtype = activitySubtypeSelect.value;
        const details = detailsSelect.value;
        const unit = unitSelect.value;
        const quantity = parseFloat(quantityInput.value);
        
        // Vérification des entrées
        if (isNaN(quantity) || quantity <= 0) {
            alert('Veuillez entrer une quantité valide.');
            return;
        }
        
        let emissionFactor = 0;
        
        // Récupération du facteur d'émission
        try {
            emissionFactor = emissionFactors[activityType][activitySubtype][details][unit];
        } catch (e) {
            console.error('Facteur d\'émission non trouvé', e);
            alert('Facteur d\'émission non disponible pour cette combinaison.');
            return;
        }
        
        // Calcul des émissions totales
        const totalEmissions = quantity * emissionFactor;
        
        // Calcul de l'équivalent en arbres (approximation: 1 arbre absorbe ~25kg CO2 par an)
        const treeEquivalent = totalEmissions / 25;
        
        // Affichage des résultats
        totalEmissionsElement.textContent = `${totalEmissions.toFixed(2)} kg CO2e`;
        treeEquivalentElement.textContent = `${treeEquivalent.toFixed(1)} arbres pendant 1 an`;
        dataSourceElement.textContent = dataSources[activityType];
        
        // Affichage du conteneur de résultats
        resultsContainer.style.display = 'block';
        
        // Création du graphique
        createChart(totalEmissions);
    }
    
    // Création du graphique
    function createChart(emissions) {
        const ctx = document.getElementById('emissions-chart').getContext('2d');
        
        // Détruire le graphique existant s'il y en a un
        if (window.emissionsChart) {
            window.emissionsChart.destroy();
        }
        
        // Données de référence pour la comparaison
        const referenceData = {
            'Votre activité': emissions,
            'Vol Paris-New York': 1000,
            'Voiture 10 000 km/an': 1920,
            'Empreinte moyenne française': 9000
        };
        
        // Création du nouveau graphique
        window.emissionsChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(referenceData),
                datasets: [{
                    label: 'Émissions (kg CO2e)',
                    data: Object.values(referenceData),
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
                    ],
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
    
    // Réinitialisation du calculateur
    function resetCalculator() {
        quantityInput.value = '';
        activityTypeSelect.selectedIndex = 0;
        updateSubtypeOptions();
        resultsContainer.style.display = 'none';
        
        // Détruire le graphique
        if (window.emissionsChart) {
            window.emissionsChart.destroy();
            window.emissionsChart = null;
        }
    }
    
    // Téléchargement des résultats (simulation)
    function downloadResults() {
        alert('Fonctionnalité de téléchargement des résultats en développement.\n\nLes résultats seraient téléchargés au format PDF ou CSV avec les détails du calcul et les recommandations pour réduire l\'empreinte carbone.');
    }
    
    // Événements
    activityTypeSelect.addEventListener('change', updateSubtypeOptions);
    activitySubtypeSelect.addEventListener('change', updateDetailsOptions);
    detailsSelect.addEventListener('change', updateUnitOptions);
    calculateBtn.addEventListener('change', calculateEmissions);
    resetBtn.addEventListener('click', resetCalculator);
    downloadBtn.addEventListener('click', downloadResults);
    
    // Initialisation
    updateSubtypeOptions();
    
    // Correction de l'événement click qui était mal configuré
    calculateBtn.addEventListener('click', calculateEmissions);
});
