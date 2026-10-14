import math
from typing import List, Dict, Any, Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Default Pre-Loaded Industrial Knowledge Base Documents
KNOWLEDGE_BASE = [
    {
        "title": "CNC Milling Machine M-104 Maintenance & Operation SOP",
        "category": "Standard Operating Procedure (SOP)",
        "file_name": "SOP_CNC_M104_Bearing_v3.pdf",
        "machine_type": "CNC Machine",
        "chunks": [
            {
                "section_title": "Section 4.2 - Spindle Bearing Inspection & Replacement",
                "page_number": 14,
                "content": (
                    "To inspect the spindle drive bearing on CNC Machine M-104: First, isolate 480V main breaker and execute LOTO procedures. "
                    "Remove the front spindle protective shroud. Use a magnetic base dial indicator to measure axial endplay (maximum allowable play is 0.012 mm). "
                    "If vibration exceeds 6.0 mm/s or thermal imaging indicates temperature above 75°C, replace bearing set immediately. "
                    "Use OEM SKF 6208-2RS bearing assembly, torque housing bolts to 45 Nm, and apply Mobilith SHC 220 synthetic grease."
                )
            },
            {
                "section_title": "Section 5.1 - Coolant System Flushing & Lubrication",
                "page_number": 19,
                "content": (
                    "Coolant system flow rate must maintain a minimum line pressure of 95-105 PSI. "
                    "Check coolant refractometer reading daily (target concentration: 7-9%). "
                    "Every 500 operating hours, flush reservoir line with bio-cleaner, replace 25-micron filter element, and check pump suction impeller for cavitation wear."
                )
            }
        ]
    },
    {
        "title": "Hydraulic Press H-201 Technical Service Manual",
        "category": "Equipment Manual",
        "file_name": "Hydraulic_Press_H201_Manual.pdf",
        "machine_type": "Hydraulic Press",
        "chunks": [
            {
                "section_title": "Section 3.1 - Hydraulic Cylinder Pressure & Seal Troubleshooting",
                "page_number": 28,
                "content": (
                    "Hydraulic Press H-201 operates at a nominal ram pressure of 220 PSI. "
                    "If system pressure drops below 180 PSI, inspect main cylinder seal pack for fluid bypass. "
                    "Purge air pockets from manifold valve block prior to adjusting pressure relief valve."
                )
            },
            {
                "section_title": "Section 6.4 - Hydraulic Oil Thermal Degradation",
                "page_number": 42,
                "content": (
                    "Operating oil temperatures above 72°C accelerate seal polymer degradation. "
                    "If oil temp exceeds 75°C, verify heat exchanger cooling water flow rate (minimum 15 GPM) and replace inline oil filter element."
                )
            }
        ]
    },
    {
        "title": "Industrial Pump & Motor Alignment Guidelines",
        "category": "Maintenance Guide",
        "file_name": "Pump_Motor_Alignment_Guide.pdf",
        "machine_type": "Industrial Pump",
        "chunks": [
            {
                "section_title": "Section 2.3 - Laser Alignment & Vibration Reduction",
                "page_number": 8,
                "content": (
                    "Industrial Pump P-302 and Conveyor Motor C-405 require precision laser shaft alignment. "
                    "Angular misalignment must not exceed 0.05 mm per 100 mm coupling radius. "
                    "Vibration peaks at 1X RPM indicate mechanical unbalance; vibration at 2X RPM indicates coupling misalignment. "
                    "Torque hold-down bolts evenly in cross pattern to 180 Nm."
                )
            }
        ]
    }
]

class RagAssistant:
    def __init__(self):
        self.documents = KNOWLEDGE_BASE

    def search_knowledge(self, query: str, machine_type: Optional[str] = None) -> Dict[str, Any]:
        """
        TF-IDF + Cosine Similarity RAG retrieval over technical chunks.
        """
        all_chunks = []
        for doc in self.documents:
            for chunk in doc["chunks"]:
                all_chunks.append({
                    "title": doc["title"],
                    "category": doc["category"],
                    "file_name": doc["file_name"],
                    "section_title": chunk["section_title"],
                    "page_number": chunk["page_number"],
                    "content": chunk["content"]
                })

        if not all_chunks:
            return {
                "answer": "No technical documentation available in the knowledge base.",
                "sources": [],
                "confidence": 0.0,
                "query": query
            }

        corpus = [c["content"] for c in all_chunks]
        corpus.append(query)

        vectorizer = TfidfVectorizer(stop_words="english")
        tfidf_matrix = vectorizer.fit_transform(corpus)

        query_vec = tfidf_matrix[-1]
        chunk_vecs = tfidf_matrix[:-1]

        similarities = cosine_similarity(query_vec, chunk_vecs)[0]

        # Rank chunks by score
        indexed_scores = list(enumerate(similarities))
        indexed_scores.sort(key=lambda x: x[1], reverse=True)

        top_sources = []
        best_chunk = None
        highest_score = 0.0

        for idx, score in indexed_scores[:3]:
            chunk_data = all_chunks[idx]
            if score > highest_score:
                highest_score = float(score)
                best_chunk = chunk_data

            top_sources.append({
                "title": chunk_data["title"],
                "category": chunk_data["category"],
                "file_name": chunk_data["file_name"],
                "section_title": chunk_data["section_title"],
                "page_number": chunk_data["page_number"],
                "relevance_score": round(float(score), 3)
            })

        confidence = min(0.96, max(0.45, highest_score * 1.8 + 0.30)) if highest_score > 0.05 else 0.50

        if best_chunk and highest_score > 0.05:
            answer = (
                f"Based on **{best_chunk['title']}** ({best_chunk['section_title']}, Page {best_chunk['page_number']}):\n\n"
                f"{best_chunk['content']}\n\n"
                f"**Summary Procedure:** Ensure Lockout/Tagout (LOTO) is enforced, verify torque specs, and measure alignment before resuming production."
            )
        else:
            answer = (
                f"Search returned general operating guidance for query '{query}'. "
                f"For bearing inspections or component replacements, always consult the machine's official OEM manual, "
                f"enforce Lockout/Tagout (LOTO) isolation, check torque specifications, and verify vibration baselines post-maintenance."
            )

        return {
            "answer": answer,
            "sources": top_sources,
            "confidence": round(confidence, 2),
            "query": query
        }

rag_assistant_service = RagAssistant()
