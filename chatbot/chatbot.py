def chatbot(question):

    question = question.lower()

    if "fertilizer" in question:
        return "Use organic compost fertilizer"

    if "treatment" in question:
        return "Remove infected leaves and spray fungicide"

    return "Please upload plant image for disease detection"