"""
backend/app/db/queries.py
All PostgreSQL query functions
"""

import asyncpg
import logging
from typing import List, Dict

logger = logging.getLogger(__name__)


# 🔥 Get Hospitals
async def get_hospitals(
    pool: asyncpg.Pool,
    city: str,
    treatment: str,
    budget: float
) -> List[Dict]:

    query = """
        SELECT 
            h.id,
            h.name,
            h.city,
            h.area,
            h.type,
            h.rating,
            h.latitude,
            h.longitude,
            t.name AS treatment_name,
            htc.min_cost,
            htc.max_cost,
            (htc.min_cost + htc.max_cost) / 2 AS estimated_cost
        FROM hospital_treatment_cost htc
        JOIN hospitals h ON h.id = htc.hospital_id
        JOIN treatments t ON t.id = htc.treatment_id
        WHERE LOWER(h.city) = LOWER($1)
        AND t.name ILIKE '%' || $2 || '%'
        AND (htc.min_cost + htc.max_cost) / 2 <= $3
        ORDER BY htc.min_cost ASC;
    """

    try:
        async with pool.acquire() as conn:
            rows = await conn.fetch(query, city, treatment, budget)
            return [dict(row) for row in rows]

    except Exception as e:
        logger.error(f"DB error in get_hospitals: {e}")
        raise


# 🔥 Get Schemes
async def get_schemes(
    pool: asyncpg.Pool,
    treatment: str,
    city: str,
    hospital_cost: float
) -> List[Dict]:

    query = """
        SELECT
            id,
            name,
            short_name,
            description,
            coverage_pct,
            max_benefit,
            eligibility,
            documents_required,
            scheme_type
        FROM schemes
        WHERE
            is_active = TRUE
            AND $1 = ANY(applicable_treatments)
            AND $2 = ANY(applicable_cities)
        ORDER BY coverage_pct DESC, max_benefit DESC;
    """

    try:
        async with pool.acquire() as conn:
            rows = await conn.fetch(query, treatment, city)

            result = []
            for row in rows:
                scheme = dict(row)

                # Calculate savings
                savings = min(
                    hospital_cost * (float(scheme["coverage_pct"]) / 100),
                    float(scheme["max_benefit"])
                )

                scheme["savings"] = round(savings, 2)
                result.append(scheme)

            return result

    except Exception as e:
        logger.error(f"DB error in get_schemes: {e}")
        raise


# 🔥 Get All Treatments
async def get_all_treatments(pool: asyncpg.Pool) -> List[str]:

    query = """
        SELECT name
        FROM treatments
        WHERE is_active = TRUE
        ORDER BY name;
    """

    try:
        async with pool.acquire() as conn:
            rows = await conn.fetch(query)
            return [row["name"] for row in rows]

    except Exception as e:
        logger.error(f"DB error in get_all_treatments: {e}")
        raise


# 🔥 Get All Cities
async def get_all_cities(pool: asyncpg.Pool) -> List[str]:

    query = """
        SELECT DISTINCT city
        FROM hospitals
        WHERE is_active = TRUE
        ORDER BY city;
    """

    try:
        async with pool.acquire() as conn:
            rows = await conn.fetch(query)
            return [row["city"] for row in rows]

    except Exception as e:
        logger.error(f"DB error in get_all_cities: {e}")
        raise
