from disease_info import disease_info
import random

def get_chatbot_response(question, disease_name=None):
    """
    Enhanced AI chatbot that provides context-aware, human-like responses about plant diseases,
    fertilizers, treatments, and crop care.

    Args:
        question (str): The user's question
        disease_name (str): The detected disease name (optional)

    Returns:
        str: Contextual, AI-like response based on the disease and question
    """

    question = question.lower().strip()

    # Get disease information if disease is detected
    disease_data = None
    if disease_name and disease_name in disease_info:
        disease_data = disease_info[disease_name]

    # AI-like greeting responses
    greetings = ["Hello!", "Hi there!", "Hey!", "Greetings!", "Good day!"]
    greeting_responses = [
        "I'm your AI Plant Assistant! I'm here to help you with plant disease detection and farming advice. 🌱",
        "Welcome! I'm an AI specialized in plant health and agriculture. How can I assist you today?",
        "Hi! I'm your intelligent farming companion. Ready to help with your plants and crops! 🌾"
    ]

    if any(word in question for word in ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening']):
        return random.choice(greeting_responses)

    # Handle disease-specific questions with AI-like responses
    if disease_data:
        disease_display_name = disease_data.get('disease', disease_name)

        # Questions about treatment
        if any(word in question for word in ['treatment', 'cure', 'heal', 'fix', 'remedy', 'medicine', 'solution']):
            treatment = disease_data.get('treatment', 'No specific treatment information available.')
            responses = [
                f"Based on my analysis, for {disease_display_name}, I recommend: {treatment}",
                f"For treating {disease_display_name}, here's what I suggest: {treatment}",
                f"My recommendation for {disease_display_name} treatment: {treatment}",
                f"To address {disease_display_name}, try this approach: {treatment}"
            ]
            return random.choice(responses)

        # Questions about fertilizer
        if any(word in question for word in ['fertilizer', 'nutrition', 'feed', 'nutrients', 'manure', 'compost']):
            fertilizer = disease_data.get('fertilizer', 'No specific fertilizer information available.')
            responses = [
                f"For optimal recovery from {disease_display_name}, I suggest: {fertilizer}",
                f"Regarding nutrition for {disease_display_name}, try: {fertilizer}",
                f"My fertilizer recommendation for {disease_display_name}: {fertilizer}",
                f"To support your plant's recovery from {disease_display_name}: {fertilizer}"
            ]
            return random.choice(responses)

        # Questions about symptoms or what the disease is
        if any(word in question for word in ['symptom', 'sign', 'what is', 'what are', 'identify', 'recognize']):
            responses = [
                f"I've identified {disease_display_name} in your plant. This is a common plant disease that can affect crop health and yield.",
                f"Based on the analysis, your plant shows signs of {disease_display_name}. This condition typically affects plant growth and productivity.",
                f"The detected condition is {disease_display_name}. It's important to address this promptly to prevent further spread.",
                f"My diagnosis indicates {disease_display_name}. Early intervention is key to successful treatment."
            ]
            return random.choice(responses)

        # Questions about prevention
        if any(word in question for word in ['prevent', 'avoid', 'stop', 'protection', 'preventive']):
            responses = [
                f"To prevent {disease_display_name}, maintain good plant spacing, ensure proper drainage, and avoid overhead watering.",
                f"Prevention is key! For {disease_display_name}, focus on plant hygiene, crop rotation, and using disease-resistant varieties.",
                f"Here are some preventive measures for {disease_display_name}: regular monitoring, proper sanitation, and balanced fertilization.",
                f"To avoid {disease_display_name}, implement integrated pest management practices and maintain optimal growing conditions."
            ]
            return random.choice(responses)

        # General questions about the disease
        if any(word in question for word in ['how', 'why', 'when', 'where', 'cause', 'reason']):
            responses = [
                f"{disease_display_name} is a plant disease that can significantly impact crop health. For specific management strategies, consider consulting local agricultural experts.",
                f"This appears to be {disease_display_name}, which affects plant physiology. The key is early detection and appropriate intervention.",
                f"{disease_display_name} typically occurs due to environmental stress or pathogen infection. Proper cultural practices can help manage this condition.",
                f"I've detected {disease_display_name}. This condition usually responds well to integrated management approaches combining cultural, biological, and chemical methods."
            ]
            return random.choice(responses)

    # General farming questions (when no specific disease context)
    if any(word in question for word in ['fertilizer', 'nutrition', 'feed', 'nutrients', 'manure', 'compost']):
        responses = [
            "For general plant health, I recommend using balanced NPK fertilizers. Organic options like compost, vermicompost, and neem cake are excellent choices. Always consider getting a soil test for specific nutrient requirements.",
            "Great question about nutrition! A balanced fertilizer approach works best. Consider organic sources like compost tea, bone meal, and seaweed extracts for sustainable plant health.",
            "Fertilizer choice depends on your soil type and plant needs. I suggest starting with a complete organic fertilizer and monitoring plant response. Soil testing is invaluable for optimal results.",
            "For healthy plant growth, focus on soil health first. Organic matter, proper pH balance, and micronutrients are key. I recommend compost as the foundation of any fertilization program."
        ]
        return random.choice(responses)

    if any(word in question for word in ['treatment', 'cure', 'heal', 'fix', 'remedy', 'medicine', 'solution']):
        responses = [
            "Plant treatment depends on the specific issue. Common practices include: proper watering, pruning infected parts, using organic pesticides, and maintaining plant spacing for air circulation.",
            "Treatment strategies vary by problem. I always recommend starting with cultural practices like improved drainage, proper spacing, and sanitation before considering chemical interventions.",
            "For plant health issues, an integrated approach works best: identify the problem correctly, choose appropriate treatments, and focus on prevention. Early intervention is crucial.",
            "Plant care involves addressing root causes. Whether it's nutritional deficiencies, pest pressure, or environmental stress, a holistic approach yields the best results."
        ]
        return random.choice(responses)

    if any(word in question for word in ['water', 'watering', 'irrigation']):
        responses = [
            "Most plants need 1-2 inches of water per week. Water deeply but less frequently to encourage deep root growth. Avoid overhead watering to prevent fungal diseases.",
            "Proper watering is crucial for plant health. I recommend deep, infrequent watering to promote strong root systems. Early morning is the best time to water.",
            "Watering technique matters! Check soil moisture 2 inches deep before watering. Different plants have different water needs - observe and adjust accordingly.",
            "For optimal plant health, focus on consistent soil moisture. Overwatering is as harmful as underwatering. Consider drip irrigation for efficient water use."
        ]
        return random.choice(responses)

    if any(word in question for word in ['pest', 'insect', 'bug']):
        responses = [
            "For pest control, try organic methods first: neem oil, insecticidal soap, or introducing beneficial insects. Avoid chemical pesticides unless necessary.",
            "Integrated Pest Management (IPM) is my recommended approach. Start with cultural controls, then biological controls, and use chemicals only as a last resort.",
            "Pest problems? Identify the pest first, then choose appropriate control methods. Beneficial insects like ladybugs can be great allies in pest management.",
            "Healthy plants resist pests better. Focus on plant health through proper nutrition and stress reduction. Companion planting can also help deter pests naturally."
        ]
        return random.choice(responses)

    if any(word in question for word in ['soil', 'ground', 'earth']):
        responses = [
            "Healthy soil is key for plant growth. Test your soil pH (ideal range 6.0-7.0). Add organic matter like compost to improve soil structure and fertility.",
            "Soil health is fundamental to successful gardening. Regular soil testing helps you understand nutrient levels and pH. Organic matter improves soil structure dramatically.",
            "Great question about soil! Soil is a living ecosystem. Focus on building organic matter, maintaining proper pH, and ensuring good drainage for optimal plant growth.",
            "Soil management is an art and science. I recommend annual soil testing, regular addition of organic matter, and avoiding soil compaction for the best results."
        ]
        return random.choice(responses)

    if any(word in question for word in ['crop rotation', 'rotation']):
        responses = [
            "Crop rotation prevents soil-borne diseases and nutrient depletion. Rotate crops from different families and avoid planting the same crop in the same spot year after year.",
            "Crop rotation is a powerful tool for sustainable farming. It breaks pest and disease cycles while maintaining soil fertility. Plan your rotations carefully!",
            "Rotating crops is essential for long-term soil health. Different plant families have different nutrient requirements and susceptibility to pests and diseases.",
            "Smart crop rotation can dramatically improve yields and reduce pest problems. Consider plant families and nutrient needs when planning your rotation schedule."
        ]
        return random.choice(responses)

    if any(word in question for word in ['organic', 'natural']):
        responses = [
            "Organic farming uses natural methods: compost, crop rotation, beneficial insects, and natural pest repellents. It promotes soil health and environmental sustainability.",
            "Organic agriculture focuses on building healthy ecosystems. Natural pest control, soil building, and biodiversity are key principles of organic farming.",
            "Going organic? Start with soil health, use natural amendments, and learn about companion planting. It's a holistic approach to farming that benefits everyone.",
            "Organic methods work with nature rather than against it. Beneficial microorganisms, natural pest controls, and organic matter are the foundation of organic agriculture."
        ]
        return random.choice(responses)

    if any(word in question for word in ['yield', 'production', 'harvest']):
        responses = [
            "To maximize yield: use quality seeds, proper spacing, adequate water and nutrients, pest management, and harvest at the right time.",
            "High yields come from attention to detail. Start with good genetics, provide optimal growing conditions, and manage pests and diseases proactively.",
            "Yield optimization involves many factors: soil health, proper nutrition, water management, and pest control. Consistent monitoring is key to success.",
            "Maximizing production requires a systems approach. Focus on soil fertility, plant health, and environmental conditions for the best harvest results."
        ]
        return random.choice(responses)

    if any(word in question for word in ['seed', 'planting', 'sow']):
        responses = [
            "Choose disease-resistant varieties. Plant during the right season. Ensure proper seed depth and spacing. Treat seeds with organic fungicides if needed.",
            "Seed selection is crucial for success. Choose varieties suited to your climate and soil conditions. Disease-resistant varieties can save you many problems later.",
            "Quality seeds are the foundation of a good harvest. Consider heirloom varieties for biodiversity, or hybrid varieties for specific traits like disease resistance.",
            "Successful planting starts with good seed. Ensure proper seed depth, spacing, and soil conditions. Consider seed treatments for disease prevention when needed."
        ]
        return random.choice(responses)

    # Default responses
    if not disease_name:
        responses = [
            "Please upload a plant image first for disease detection, then I can provide more specific advice about fertilizers, treatments, and crop care.",
            "I'd love to help with your plant questions! For the most accurate advice, please upload a photo of your plant so I can analyze it for diseases.",
            "To give you the best recommendations, I need to see your plant. Upload an image and I'll provide targeted advice for treatment and care.",
            "I'm here to help with plant disease detection and farming advice. Upload a plant photo and I'll analyze it to give you specific recommendations."
        ]
        return random.choice(responses)

    # Disease-specific but general question
    if disease_data:
        disease_display_name = disease_data.get('disease', disease_name)
        responses = [
            f"I detected {disease_display_name} in your plant. You can ask me about treatment options, suitable fertilizers, or general care tips for this condition.",
            f"Your plant shows signs of {disease_display_name}. I'm here to help with treatment recommendations, nutritional advice, and prevention strategies.",
            f"I've identified {disease_display_name} in your plant image. Feel free to ask about treatment methods, fertilizers, or how to prevent this in the future.",
            f"The analysis shows {disease_display_name}. I can provide detailed information about treatment, nutrition, and management strategies for this condition."
        ]
        return random.choice(responses)

    # Final fallback
    responses = [
        "I'm here to help with plant disease detection and farming advice. Try asking about fertilizers, treatments, or crop care practices.",
        "I specialize in plant health and agriculture. Ask me about disease treatment, fertilizers, watering, or any farming-related questions!",
        "As your AI farming assistant, I'm ready to help with plant diseases, crop management, and agricultural best practices.",
        "Feel free to ask me anything about plant care, disease management, fertilizers, or farming techniques. I'm here to help!"
    ]
    return random.choice(responses)