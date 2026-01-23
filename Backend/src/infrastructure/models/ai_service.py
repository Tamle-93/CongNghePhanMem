class AIService:
    def analyze_text(self, text: str) -> dict:
        return {
            "length": len(text),
            "summary": text[:100]
        }


if __name__ == "__main__":
    service = AIService()
    print(service.analyze_text("Xin chào AI Service"))
