"""
RAG-based Ayushman Bharat Eligibility Checker
Uses local embeddings and similarity search without external API dependencies
"""

import re
import json
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)

# Ayushman Bharat Scheme Knowledge Base
AYUSHMAN_KNOWLEDGE = """
AYUSHMAN BHARAT SCHEME - ELIGIBILITY CRITERIA

1. COVERAGE:
   - Pradhan Mantri Jan Arogya Yojana (PM-JAY) provides health coverage up to ₹5 lakhs per family per year
   - Covers 3 days of pre-hospitalization and 15 days of post-hospitalization expenses
   - Cashless and paperless treatment at empaneled hospitals

2. ELIGIBLE FAMILIES:
   - Families identified based on SECC (Socio-Economic Caste Census) 2011 data
   - No restriction on family size, age, or gender
   - Covers pre-existing diseases from day one
   - Both rural and urban families eligible

3. RURAL ELIGIBILITY (Based on SECC 2011 deprivation criteria):
   - Families living in only one room with kuccha walls and roof
   - No adult member between 16-59 years
   - Female-headed households with no adult male member aged 16-59
   - Disabled member and no able-bodied adult member
   - SC/ST households
   - Landless households deriving major income from manual casual labor

4. URBAN ELIGIBILITY (Based on occupation):
   - Rag pickers
   - Domestic workers
   - Street vendors
   - Construction workers
   - Plumbers
   - Electricians
   - Fruit/vegetable sellers
   - Daily wage laborers
   - Washermen/watchmen
   - Home-based workers
   - Tailors
   - Transport workers (rickshaw pullers, drivers)
   - Small shop owners

5. REQUIRED DOCUMENTS:
   - Aadhaar card (mandatory for enrollment)
   - Ration card
   - Any government issued ID
   - Mobile number (for OTP verification)
   - Passport size photographs

6. COVERED TREATMENTS:
   - All three days of pre-hospitalization expenses
   - Medical examination, consultation, and treatment
   - 15 days post-hospitalization expenses
   - Medicine and consumables
   - Diagnostic services
   - ICU charges
   - Medical implants (if required)
   - Food services during hospitalization

7. NOT COVERED:
   - Cosmetic surgeries (except due to accident)
   - Fertility treatments
   - Organ transplant (for donor)
   - Dental treatments (except due to accident)
   - Mental illness treatments (certain types)
   - Experimental treatments

8. HOW TO CHECK ELIGIBILITY:
   - Visit nearest Common Service Centre (CSC)
   - Visit empaneled hospital
   - Call Ayushman Bharat helpline: 14555
   - Check online at mera.pmjay.gov.in

9. ENROLLMENT PROCESS:
   - Visit CSC or empaneled hospital with Aadhaar
   - Verify mobile number with OTP
   - Get eligibility confirmation
   - Receive Ayushman card if eligible
   - Start using benefits immediately

10. FAMILY COVERAGE:
    - Covers all family members listed in SECC data
    - Includes senior citizens
    - Includes differently-abled members
    - No limit on number of family members
"""

# Simple text-based embeddings (using word frequency vectors)
class SimpleTextEmbedder:
    """Simple text embedder using TF-IDF-like approach"""
    
    def __init__(self):
        self.vocabulary = {}
        self.documents = []
        
    def _tokenize(self, text: str) -> List[str]:
        """Simple tokenization"""
        text = text.lower()
        text = re.sub(r'[^\w\s]', ' ', text)
        tokens = text.split()
        # Remove stopwords
        stopwords = {'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 
                     'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
                     'would', 'could', 'should', 'may', 'might', 'must', 'shall',
                     'can', 'of', 'in', 'to', 'for', 'with', 'on', 'at', 'by',
                     'from', 'up', 'about', 'into', 'through', 'during', 'before',
                     'after', 'above', 'below', 'between', 'and', 'or', 'but', 'if',
                     'because', 'as', 'until', 'while', 'this', 'that', 'these',
                     'those', 'am', 'it', 'its', 'they', 'them', 'their'}
        return [t for t in tokens if t not in stopwords and len(t) > 2]
    
    def build_index(self, documents: List[str]):
        """Build vocabulary from documents"""
        self.documents = documents
        word_freq = {}
        for doc in documents:
            tokens = self._tokenize(doc)
            for token in tokens:
                word_freq[token] = word_freq.get(token, 0) + 1
        
        # Create vocabulary with top words
        sorted_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)
        self.vocabulary = {word: idx for idx, (word, _) in enumerate(sorted_words[:500])}
        
    def embed(self, text: str) -> List[float]:
        """Create embedding vector for text"""
        tokens = self._tokenize(text)
        vector = [0.0] * len(self.vocabulary)
        
        for token in tokens:
            if token in self.vocabulary:
                vector[self.vocabulary[token]] += 1
                
        # Normalize
        magnitude = sum(v**2 for v in vector) ** 0.5
        if magnitude > 0:
            vector = [v/magnitude for v in vector]
            
        return vector


class CosineSimilarity:
    """Cosine similarity calculation"""
    
    @staticmethod
    def compute(vec1: List[float], vec2: List[float]) -> float:
        if not vec1 or not vec2:
            return 0.0
            
        dot_product = sum(a * b for a, b in zip(vec1, vec2))
        mag1 = sum(a**2 for a in vec1) ** 0.5
        mag2 = sum(b**2 for b in vec2) ** 0.5
        
        if mag1 == 0 or mag2 == 0:
            return 0.0
            
        return dot_product / (mag1 * mag2)


@dataclass
class EligibilityResult:
    """Result of eligibility check"""
    is_eligible: bool
    confidence: float
    matching_criteria: List[str]
    details: str
    next_steps: List[str]
    documents_needed: List[str]


class AyushmanEligibilityChecker:
    """RAG-based Ayushman eligibility checker"""
    
    def __init__(self):
        self.embedder = SimpleTextEmbedder()
        self.chunks = []
        self.chunk_embeddings = []
        self._initialize_knowledge_base()
        
    def _initialize_knowledge_base(self):
        """Split knowledge base into chunks and build index"""
        # Split knowledge into semantic chunks
        self.chunks = [
            AYUSHMAN_KNOWLEDGE  # Use full knowledge as single chunk for better context
        ]
        
        # Build embeddings
        self.embedder.build_index(self.chunks)
        self.chunk_embeddings = [self.embedder.embed(chunk) for chunk in self.chunks]
        
    def _retrieve_relevant_info(self, query: str) -> str:
        """Retrieve most relevant information from knowledge base"""
        query_embedding = self.embedder.embed(query)
        
        # Calculate similarities
        similarities = []
        for i, chunk_emb in enumerate(self.chunk_embeddings):
            sim = CosineSimilarity.compute(query_embedding, chunk_emb)
            similarities.append((i, sim))
            
        # Sort by similarity
        similarities.sort(key=lambda x: x[1], reverse=True)
        
        # Return top result
        if similarities and similarities[0][1] > 0.1:
            return self.chunks[similarities[0][0]]
            
        return self.chunks[0]  # Return full knowledge if no good match
    
    def _extract_income_indicators(self, user_info: str) -> Dict[str, Any]:
        """Extract income-related indicators from user info"""
        user_info = user_info.lower()
        
        indicators = {
            'has_bpl_card': 'bpl' in user_info or 'below poverty' in user_info,
            'is_daily_wage': 'daily wage' in user_info or 'daily labor' in user_info or 'unskilled' in user_info,
            'is_small_business': 'small business' in user_info or 'shop owner' in user_info or 'vendor' in user_info,
            'is_domestic_worker': 'domestic worker' in user_info or 'house helper' in user_info,
            'is_street_vendor': 'street vendor' in user_info or 'vendor' in user_info,
            'is_construction_worker': 'construction' in user_info or 'mason' in user_info or ' plumber' in user_info,
            'is_driver': 'driver' in user_info or 'rickshaw' in user_info or 'transport' in user_info,
            'is_tailor': 'tailor' in user_info or 'sewing' in user_info,
            'is_farmer': 'farmer' in user_info or 'agriculture' in user_info,
            'is_rag_picker': 'rag picker' in user_info or 'waste' in user_info,
            'is_landless': 'landless' in user_info or 'no land' in user_info,
            'has_disability': 'disability' in user_info or 'disabled' in user_info,
            'is_rural': 'village' in user_info or 'rural' in user_info or 'taluka' in user_info,
            'is_urban': 'city' in user_info or 'urban' in user_info or 'town' in user_info,
            'has_aadhaar': 'aadhaar' in user_info or 'aadhar' in user_info,
            'has_ration_card': 'ration' in user_info or 'bpl card' in user_info,
            'is_sc_st': 'sc' in user_info or 'st' in user_info or 'scheduled' in user_info,
            'is_female_headed': 'female headed' in user_info or 'women headed' in user_info or 'widow' in user_info,
        }
        
        return indicators
    
    def _check_eligibility(self, user_info: str, annual_income: Optional[float] = None) -> EligibilityResult:
        """Check Ayushman eligibility based on user information"""
        
        indicators = self._extract_income_indicators(user_info)
        knowledge = self._retrieve_relevant_info(user_info)
        
        matching_criteria = []
        eligibility_score = 0.0
        
        # Check rural criteria
        if indicators['is_rural']:
            if indicators['is_landless']:
                matching_criteria.append("Landless household (rural)")
                eligibility_score += 0.3
            if indicators['is_daily_wage']:
                matching_criteria.append("Daily wage laborer (rural)")
                eligibility_score += 0.25
            if indicators['has_disability']:
                matching_criteria.append("Disabled member with no able-bodied adult")
                eligibility_score += 0.2
            if indicators['is_female_headed']:
                matching_criteria.append("Female-headed household (rural)")
                eligibility_score += 0.25
            if indicators['is_sc_st']:
                matching_criteria.append("SC/ST household")
                eligibility_score += 0.3
                
        # Check urban criteria
        if indicators['is_urban'] or (not indicators['is_rural'] and not indicators['is_farmer']):
            if indicators['is_domestic_worker']:
                matching_criteria.append("Domestic worker (urban)")
                eligibility_score += 0.3
            if indicators['is_street_vendor']:
                matching_criteria.append("Street vendor (urban)")
                eligibility_score += 0.3
            if indicators['is_construction_worker']:
                matching_criteria.append("Construction worker (urban)")
                eligibility_score += 0.25
            if indicators['is_driver']:
                matching_criteria.append("Transport worker (urban)")
                eligibility_score += 0.25
            if indicators['is_tailor']:
                matching_criteria.append("Home-based worker/Tailor (urban)")
                eligibility_score += 0.25
            if indicators['is_rag_picker']:
                matching_criteria.append("Rag picker (urban)")
                eligibility_score += 0.3
                
        # General eligibility factors
        if indicators['has_bpl_card']:
            matching_criteria.append("BPL card holder")
            eligibility_score += 0.4
        if indicators['has_ration_card']:
            matching_criteria.append("Ration card holder")
            eligibility_score += 0.1
            
        # Check income if provided
        if annual_income is not None:
            if annual_income < 10000:  # Very low income
                matching_criteria.append(f"Annual income below ₹10,000")
                eligibility_score += 0.35
            elif annual_income < 36000:  # Below taxable limit
                matching_criteria.append(f"Low annual income (₹{annual_income:,.0f})")
                eligibility_score += 0.2
            elif annual_income < 120000:
                matching_criteria.append(f"Moderate annual income (₹{annual_income:,.0f})")
                eligibility_score += 0.1
                
        # Cap eligibility score
        eligibility_score = min(eligibility_score, 1.0)
        
        is_eligible = eligibility_score >= 0.3
        
        # Generate details
        if is_eligible:
            details = f"Based on your information, you appear to be eligible for Ayushman Bharat PM-JAY scheme. "
            details += f"You match {len(matching_criteria)} eligibility criteria. "
            details += "The scheme provides ₹5 lakhs coverage per family per year for cashless treatment."
        else:
            details = "Based on the information provided, you may not meet the current Ayushman Bharat eligibility criteria. "
            details += "However, eligibility is determined by SECC 2011 data. "
            details += "We recommend visiting your nearest Common Service Centre (CSC) or calling 14555 to verify."
            
        next_steps = [
            "Visit nearest Common Service Centre (CSC) with Aadhaar card",
            "Call Ayushman Bharat helpline: 14555",
            "Check eligibility at mera.pmjay.gov.in",
            "Visit nearest empaneled hospital for verification"
        ]
        
        if not indicators['has_aadhaar']:
            next_steps.insert(0, "Apply for Aadhaar card if not already available")
            
        documents_needed = [
            "Aadhaar card (mandatory)",
            "Ration card",
            "Any government ID",
            "Mobile number for OTP",
            "Passport size photographs"
        ]
        
        return EligibilityResult(
            is_eligible=is_eligible,
            confidence=eligibility_score,
            matching_criteria=matching_criteria,
            details=details,
            next_steps=next_steps,
            documents_needed=documents_needed
        )
    
    def check_eligibility(self, user_info: str, annual_income: Optional[float] = None) -> Dict[str, Any]:
        """
        Main method to check Ayushman eligibility
        
        Args:
            user_info: Text description of user's occupation, residence, background
            annual_income: Optional annual income in INR
            
        Returns:
            Dictionary with eligibility results
        """
        try:
            result = self._check_eligibility(user_info, annual_income)
            
            return {
                "success": True,
                "eligible": result.is_eligible,
                "confidence": round(result.confidence * 100, 1),
                "matching_criteria": result.matching_criteria,
                "details": result.details,
                "next_steps": result.next_steps,
                "documents_needed": result.documents_needed,
                "scheme_name": "Ayushman Bharat PM-JAY",
                "coverage": "₹5 lakhs per family per year"
            }
            
        except Exception as e:
            logger.error(f"Error checking eligibility: {e}")
            return {
                "success": False,
                "error": str(e),
                "eligible": False,
                "message": "Unable to determine eligibility. Please try again or visit nearest CSC."
            }


# Singleton instance
eligibility_checker = AyushmanEligibilityChecker()


def check_ayushman_eligibility(user_info: str, annual_income: Optional[float] = None) -> Dict[str, Any]:
    """Convenience function to check eligibility"""
    return eligibility_checker.check_eligibility(user_info, annual_income)
