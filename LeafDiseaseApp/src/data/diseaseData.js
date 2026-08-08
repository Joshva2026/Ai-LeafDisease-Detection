const diseaseData = {
  "Apple___Apple_scab": {
    "description": "Apple scab is a common fungal disease that affects apple trees, causing lesions on leaves and fruit.",
    "symptoms": ["Dull, olive-green to black spots on leaves", "Twisted or puckered leaves", "Dark, scabby spots on fruit"],
    "treatment": "Apply fungicides at green tip and continue through the season. Remove fallen leaves in autumn to reduce overwintering fungi.",
    "prevention": "Plant scab-resistant apple varieties. Prune trees for good air circulation."
  },
  "Apple___Black_rot": {
    "description": "Black rot is a disease caused by the fungus Botryosphaeria obtusa that affects leaves, fruit, and wood.",
    "symptoms": ["Purple spots on leaves that enlarge and turn brown", "Frogeye leaf spots", "Brown, rotting areas on fruit with black fruiting bodies"],
    "treatment": "Prune out dead or diseased wood. Apply fungicides starting at silver tip and continuing through the season.",
    "prevention": "Remove mummified fruit from the tree. Ensure proper pruning to allow canopy drying."
  },
  "Apple___Cedar_apple_rust": {
    "description": "Cedar apple rust is a fungal disease requiring two hosts: apple trees and eastern red cedar.",
    "symptoms": ["Bright yellow-orange spots on leaves", "Small, raised spots on the underside of leaves", "Premature leaf drop"],
    "treatment": "Apply preventative fungicides in spring when cedar galls are releasing spores.",
    "prevention": "Remove nearby eastern red cedar trees if possible. Plant rust-resistant apple varieties."
  },
  "Apple___healthy": {
    "description": "The apple tree is healthy and free of major diseases.",
    "symptoms": ["None"],
    "treatment": "None required.",
    "prevention": "Continue regular maintenance, watering, and preventative care."
  },
  "Blueberry___healthy": {
    "description": "The blueberry bush is healthy and showing vigorous growth.",
    "symptoms": ["None"],
    "treatment": "None required.",
    "prevention": "Maintain proper soil pH (acidic) and ensure consistent watering."
  },
  "Cherry_(including_sour)___Powdery_mildew": {
    "description": "Powdery mildew is a fungal disease that coats leaves and young shoots in a white powdery substance.",
    "symptoms": ["White to light grey powdery patches on leaves", "Distorted, curled leaves", "Stunted shoot growth"],
    "treatment": "Apply sulfur-based fungicides or other registered mildew treatments at the first sign of disease.",
    "prevention": "Prune trees to improve air circulation. Avoid excessive nitrogen fertilizer."
  },
  "Cherry_(including_sour)___healthy": {
    "description": "The cherry tree is healthy.",
    "symptoms": ["None"],
    "treatment": "None required.",
    "prevention": "Continue standard orchard management practices."
  },
  "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot": {
    "description": "Gray leaf spot is a significant fungal disease in corn causing foliar lesions and yield loss.",
    "symptoms": ["Small, tan spots that elongate into rectangular lesions parallel to leaf veins", "Lesions turn gray over time"],
    "treatment": "Foliar fungicides applied around tasseling can protect yield.",
    "prevention": "Rotate crops and use tillage to break down infected residue. Plant resistant hybrids."
  },
  "Corn_(maize)___Common_rust": {
    "description": "Common rust is caused by the fungus Puccinia sorghi, favored by cool, moist conditions.",
    "symptoms": ["Small, circular to elongate reddish-brown pustules on both upper and lower leaf surfaces", "Pustules rupture to release powdery spores"],
    "treatment": "Fungicide applications are rarely cost-effective unless infection is severe on susceptible hybrids early in the season.",
    "prevention": "Plant rust-resistant corn hybrids."
  },
  "Corn_(maize)___Northern_Leaf_Blight": {
    "description": "A fungal disease causing large, cigar-shaped lesions on corn leaves, heavily impacting yield if it strikes early.",
    "symptoms": ["Long, elliptical, grayish-green to tan lesions on leaves", "Lesions typically begin on lower leaves and spread upward"],
    "treatment": "Apply fungicides if disease is spreading rapidly prior to or during silking.",
    "prevention": "Select resistant hybrids. Manage crop residue through tillage or rotation."
  },
  "Corn_(maize)___healthy": {
    "description": "The corn plant is healthy.",
    "symptoms": ["None"],
    "treatment": "None required.",
    "prevention": "Maintain proper nutrient levels and weed control."
  },
  "Grape___Black_rot": {
    "description": "Black rot is a devastating fungal disease of grapes that can destroy an entire crop.",
    "symptoms": ["Brown circular lesions on leaves with dark margins", "Berries turn light brown, then shrivel into hard black mummies"],
    "treatment": "Apply protective fungicides from early shoot growth through fruit set.",
    "prevention": "Sanitation is critical; remove all mummified berries and infected canes from the vineyard."
  },
  "Grape___Esca_(Black_Measles)": {
    "description": "Esca is a complex of fungal diseases affecting the wood and foliage of grapevines.",
    "symptoms": ["Interveinal striping on leaves (tiger-stripe pattern)", "Dark spots on berries (measles)"],
    "treatment": "No chemical cures exist. Manage by cutting back infected trunks to healthy wood (re-training).",
    "prevention": "Avoid pruning in wet weather. Protect pruning wounds with sealants."
  },
  "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)": {
    "description": "A minor fungal disease of grapes causing irregular leaf lesions.",
    "symptoms": ["Irregular reddish-brown spots on leaves", "Premature defoliation in severe cases"],
    "treatment": "Fungicides applied for other major diseases usually control leaf blight.",
    "prevention": "Ensure good canopy airflow and remove fallen leaves."
  },
  "Grape___healthy": {
    "description": "The grapevine is healthy.",
    "symptoms": ["None"],
    "treatment": "None required.",
    "prevention": "Maintain routine vineyard spray programs and canopy management."
  },
  "Orange___Haunglongbing_(Citrus_greening)": {
    "description": "Citrus greening is a fatal bacterial disease transmitted by the Asian citrus psyllid.",
    "symptoms": ["Asymmetrical yellow mottling on leaves", "Small, misshapen, bitter-tasting, green fruit", "Branch dieback"],
    "treatment": "There is currently no cure. Infected trees must be removed and destroyed to prevent spread.",
    "prevention": "Control psyllid populations with insecticides. Plant certified disease-free nursery stock."
  },
  "Peach___Bacterial_spot": {
    "description": "Bacterial spot affects leaves, twigs, and fruit of peach trees, often causing severe defoliation.",
    "symptoms": ["Small, water-soaked leaf spots that turn brown and fall out (shot-hole)", "Deep, pitted cracks on fruit"],
    "treatment": "Copper or antibiotic sprays applied at specific stages can suppress the disease.",
    "prevention": "Plant highly resistant peach varieties. Avoid planting near infected orchards."
  },
  "Peach___healthy": {
    "description": "The peach tree is healthy.",
    "symptoms": ["None"],
    "treatment": "None required.",
    "prevention": "Follow standard pest and disease management schedules."
  },
  "Pepper,_bell___Bacterial_spot": {
    "description": "A serious bacterial disease causing defoliation and fruit lesions on peppers.",
    "symptoms": ["Small, water-soaked spots on leaves that turn dark brown", "Leaves turn yellow and drop", "Raised, scabby spots on fruit"],
    "treatment": "Apply copper-based bactericides preventatively. Once established, it is hard to control.",
    "prevention": "Use pathogen-free seed. Rotate crops away from solanaceous plants for at least a year."
  },
  "Pepper,_bell___healthy": {
    "description": "The bell pepper plant is healthy.",
    "symptoms": ["None"],
    "treatment": "None required.",
    "prevention": "Maintain consistent moisture and monitor for pests."
  },
  "Potato___Early_blight": {
    "description": "Early blight is a fungal disease causing target-like lesions on potato leaves.",
    "symptoms": ["Dark brown to black spots with concentric rings on older leaves", "Lower leaves yellow and die"],
    "treatment": "Apply fungicides when symptoms first appear and repeat as necessary.",
    "prevention": "Ensure adequate nitrogen fertility. Rotate crops and destroy volunteer potatoes."
  },
  "Potato___Late_blight": {
    "description": "Late blight is the infamous disease responsible for the Irish Potato Famine, highly destructive in wet conditions.",
    "symptoms": ["Large, water-soaked spots on leaves that turn brown/black", "White fungal growth on leaf undersides in humid conditions", "Rotting tubers"],
    "treatment": "Immediate application of protective fungicides is necessary as the disease spreads rapidly.",
    "prevention": "Plant certified seed potatoes. Destroy cull piles. Ensure good soil drainage."
  },
  "Potato___healthy": {
    "description": "The potato plant is healthy.",
    "symptoms": ["None"],
    "treatment": "None required.",
    "prevention": "Practice good crop rotation and hilling."
  },
  "Raspberry___healthy": {
    "description": "The raspberry plant is healthy.",
    "symptoms": ["None"],
    "treatment": "None required.",
    "prevention": "Prune out old fruiting canes to improve airflow."
  },
  "Soybean___healthy": {
    "description": "The soybean plant is healthy.",
    "symptoms": ["None"],
    "treatment": "None required.",
    "prevention": "Maintain standard crop scouting and weed management."
  },
  "Squash___Powdery_mildew": {
    "description": "A common fungal disease affecting squash and other cucurbits, coating leaves in white powder.",
    "symptoms": ["White, powdery fungal spots on upper and lower leaf surfaces", "Leaves may yellow and die prematurely"],
    "treatment": "Apply fungicides, neem oil, or sulfur-based products at first sign of infection.",
    "prevention": "Plant resistant varieties. Ensure adequate spacing for airflow."
  },
  "Strawberry___Leaf_scorch": {
    "description": "Leaf scorch is a fungal disease that creates spots on strawberry foliage, potentially weakening the plant.",
    "symptoms": ["Irregular purplish-brown spots on leaves", "Spots coalesce, causing leaves to look burned or scorched"],
    "treatment": "Fungicide applications during active growth periods can manage the disease.",
    "prevention": "Remove and destroy infected leaves after harvest. Ensure good weed control for airflow."
  },
  "Strawberry___healthy": {
    "description": "The strawberry plant is healthy.",
    "symptoms": ["None"],
    "treatment": "None required.",
    "prevention": "Keep plants thinned and mulch to prevent soil splashing."
  },
  "Tomato___Bacterial_spot": {
    "description": "Bacterial spot causes severe damage to tomato leaves and fruit, thriving in warm, humid conditions.",
    "symptoms": ["Small, dark, water-soaked spots on leaves", "Leaves yellow and drop", "Scabby, dark spots on fruit"],
    "treatment": "Copper sprays can suppress disease spread, but eradication is difficult.",
    "prevention": "Use certified disease-free seed and transplants. Avoid overhead watering."
  },
  "Tomato___Early_blight": {
    "description": "A fungal disease causing concentric ring spots on older tomato leaves.",
    "symptoms": ["Brown or black spots with target-like concentric rings on lower leaves", "Yellowing of surrounding leaf tissue"],
    "treatment": "Apply fungicides preventatively or at the very first sign of disease.",
    "prevention": "Mulch to prevent soil splashing. Stake tomatoes to keep foliage off the ground."
  },
  "Tomato___Late_blight": {
    "description": "A highly destructive disease capable of destroying entire tomato fields in days under wet conditions.",
    "symptoms": ["Irregular, water-soaked spots on leaves that rapidly turn brown", "White fungal growth on undersides in wet weather", "Firm, dark brown fruit rot"],
    "treatment": "Apply protective fungicides. Destroy heavily infected plants immediately.",
    "prevention": "Avoid planting near potatoes. Ensure excellent airflow and keep foliage dry."
  },
  "Tomato___Leaf_Mold": {
    "description": "Leaf mold is a fungal disease common in high tunnels and greenhouses with high humidity.",
    "symptoms": ["Pale green or yellow spots on the upper leaf surface", "Olive-green to brown velvety fungal growth on the underside"],
    "treatment": "Improve ventilation and reduce humidity. Fungicides can be applied if necessary.",
    "prevention": "Space plants widely, prune lower leaves, and use resistant varieties."
  },
  "Tomato___Septoria_leaf_spot": {
    "description": "A very common fungal disease causing numerous small spots on lower tomato leaves.",
    "symptoms": ["Small, circular spots with dark borders and tan/gray centers", "Tiny black specks (fruiting bodies) in the center of spots", "Severe defoliation starting from the bottom up"],
    "treatment": "Apply protectant fungicides regularly throughout the season.",
    "prevention": "Remove infected crop debris at the end of the season. Rotate crops."
  },
  "Tomato___Spider_mites Two-spotted_spider_mite": {
    "description": "Spider mites are tiny arachnids that suck sap from plant leaves, thriving in hot, dry conditions.",
    "symptoms": ["Stippling (tiny yellow/white dots) on leaves", "Fine webbing on the underside of leaves", "Leaves turn bronze or yellow and dry up"],
    "treatment": "Use insecticidal soap, horticultural oils, or specific miticides. Spray water to dislodge them.",
    "prevention": "Keep plants well-watered to reduce stress. Encourage natural predators like ladybugs."
  },
  "Tomato___Target_Spot": {
    "description": "Target spot is a fungal disease causing lesions on leaves and fruit, favored by high humidity.",
    "symptoms": ["Brown leaf spots with faint concentric rings", "Sunken, dark lesions on fruit"],
    "treatment": "Apply appropriate fungicides when conditions favor disease.",
    "prevention": "Improve airflow through staking and pruning. Avoid overhead irrigation."
  },
  "Tomato___Tomato_Yellow_Leaf_Curl_Virus": {
    "description": "TYLCV is a devastating viral disease transmitted by the silverleaf whitefly.",
    "symptoms": ["Severe stunting of the plant", "Leaves are small, cupped upward, and yellowed at the margins", "Flower drop and poor fruit set"],
    "treatment": "No cure for infected plants. Infected plants must be removed and destroyed.",
    "prevention": "Control whitefly populations. Plant TYLCV-resistant varieties."
  },
  "Tomato___Tomato_mosaic_virus": {
    "description": "ToMV is a highly contagious virus that can survive in seed, soil, and debris.",
    "symptoms": ["Mottled light and dark green pattern on leaves", "Stunted growth", "Fern-like appearance of leaves"],
    "treatment": "No cure. Remove and destroy infected plants immediately. Wash hands and tools thoroughly.",
    "prevention": "Use certified virus-free seed. Do not smoke near plants (related to Tobacco Mosaic Virus)."
  },
  "Tomato___healthy": {
    "description": "The tomato plant is healthy.",
    "symptoms": ["None"],
    "treatment": "None required.",
    "prevention": "Maintain proper watering, fertilizing, and airflow."
  }
};

export default diseaseData;
